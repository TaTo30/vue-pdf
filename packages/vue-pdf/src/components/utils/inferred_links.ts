import * as PDFJS from "pdfjs-dist";
import { convertMatches, normalizeText } from "./highlight";

import type { PageViewport } from "pdfjs-dist/types/web/interfaces";
import type { PDFPageProxy } from "pdfjs-dist/types/src/display/api";

import type { Match, LinkMatch } from "../types";

function DOMRectToPDF(
  { width, height, left, top }: any,
  viewport: PageViewport,
  textLayerDiv: HTMLDivElement,
) {
  if (width === 0 || height === 0) {
    return null;
  }

  const pageBox = textLayerDiv.getBoundingClientRect();
  const bottomLeft = viewport.convertToPdfPoint(
    left - pageBox.left,
    top - pageBox.top,
  );
  const topRight = viewport.convertToPdfPoint(
    left - pageBox.left + width,
    top - pageBox.top + height,
  );

  return PDFJS.Util.normalizeRect([
    bottomLeft[0],
    bottomLeft[1],
    topRight[0],
    topRight[1],
  ]);
}

function calculateLinkPosition(
  range: Range,
  viewport: PageViewport,
  textLayerDiv: HTMLDivElement,
) {
  const rangeRects = range.getClientRects();
  if (rangeRects.length === 1) {
    return { rect: DOMRectToPDF(rangeRects[0], viewport, textLayerDiv) };
  }

  const rect = [Infinity, Infinity, -Infinity, -Infinity];
  const quadPoints = [];
  let i = 0;
  for (const domRect of rangeRects) {
    const normalized = DOMRectToPDF(domRect, viewport, textLayerDiv);
    if (normalized === null) {
      continue;
    }

    quadPoints[i] = quadPoints[i + 4] = normalized[0];
    quadPoints[i + 1] = quadPoints[i + 3] = normalized[3];
    quadPoints[i + 2] = quadPoints[i + 6] = normalized[2];
    quadPoints[i + 5] = quadPoints[i + 7] = normalized[1];

    PDFJS.Util.rectBoundingBox(
      ...(normalized as [number, number, number, number]),
      rect,
    );
    i += 8;
  }
  return { quadPoints: new Float32Array(quadPoints), rect };
}

/**
 * Given a DOM node `container` and an index into its text contents `offset`,
 * returns a pair consisting of text node that the `offset` actually points
 * to, together with the offset relative to that text node.
 * When the offset points at the boundary between two node, the result will
 * point to the first text node in depth-first traversal order.
 *
 * For example, given this DOM:
 * <p>abc<span>def</span>ghi</p>
 *
 * textPosition(p, 0) -> [#text "abc", 0] (before `a`)
 * textPosition(p, 2) -> [#text "abc", 2] (between `b` and `c`)
 * textPosition(p, 3) -> [#text "abc", 3] (after `c`)
 * textPosition(p, 5) -> [#text "def", 2] (between `e` and `f`)
 * textPosition(p, 6) -> [#text "def", 3] (after `f`)
 */
function textPosition(container: any, offset: any) {
  let currentContainer = container;
  do {
    if (currentContainer.nodeType === Node.TEXT_NODE) {
      const currentLength = currentContainer.textContent.length;
      if (offset <= currentLength) {
        return [currentContainer, offset];
      }
      offset -= currentLength;
    } else if (currentContainer.firstChild) {
      currentContainer = currentContainer.firstChild;
      continue;
    }

    while (!currentContainer.nextSibling && currentContainer !== container) {
      currentContainer = currentContainer.parentNode;
    }
    if (currentContainer !== container) {
      currentContainer = currentContainer.nextSibling;
    }
  } while (currentContainer !== container);
  throw new Error("Offset is bigger than container's contents length.");
}

function createLinkAnnotation(
  match: Match,
  url: string,
  viewport: PageViewport,
  textDivs: HTMLElement[],
  textLayerDiv: HTMLDivElement,
  id: number,
) {
  const { start, end } = match;

  const beginDiv = textDivs[start.idx];
  const endDiv = textDivs[end.idx];

  if (!beginDiv || !endDiv) {
    return null;
  }

  const range = new Range();
  const [startNode, startOffset] = textPosition(beginDiv, start.offset);
  const [endNode, endOffset] = textPosition(endDiv, end.offset);

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  return {
    id: `inferred_link_${id}`,
    unsafeUrl: url,
    url,
    annotationType: PDFJS.AnnotationType.LINK,
    rotation: 0,
    ...calculateLinkPosition(range, viewport, textLayerDiv),
    // Populated in the annotationLayer to avoid unnecessary object creation,
    // since most inferred links overlap existing LinkAnnotations:
    borderStyle: null,
  };
}

/**
 * Find all URLs and email addresses in the given text.
 * Regex can be tested and verified at https://regex101.com/r/rXoLiT/2
 */
function findLinks(text: string): LinkMatch[] {
  // Reset regex lastIndex for fresh search
  const regex =
    /\b(?:https?:\/\/|mailto:|www\.)(?:[\S--[\p{P}<>]]|\/|[\S--[\[\]]]+[\S--[\p{P}<>]])+|(?=\p{L})[\S--[@\p{Ps}\p{Pe}<>]]+@([\S--[[\p{P}--\-]<>]]+(?:\.[\S--[[\p{P}--\-]<>]]+)+)/gmv;

  // Reset lastIndex before searching
  regex.lastIndex = 0;

  const links: LinkMatch[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [url, emailDomain] = match;
    let raw: string | undefined;

    if (
      url.startsWith("www.") ||
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      raw = url;
    } else if (emailDomain) {
      const hostname = URL.parse(`http://${emailDomain}`)?.hostname;
      if (!hostname) {
        continue;
      }
      const numericTLDRegex = /\.\d+$/;
      if (numericTLDRegex.test(hostname)) {
        // Skip emails with a numeric TLD as domain.
        continue;
      }
    }
    raw ??= url.startsWith("mailto:") ? url : `mailto:${url}`;

    const absoluteURL = PDFJS.createValidAbsoluteUrl(raw, undefined, {
      addDefaultProtocol: true,
    });

    if (absoluteURL) {
      links.push({
        url: absoluteURL.href,
        index: match.index,
        length: url.length,
      });
    }
  }
  return links;
}

/**
 * Process a PDF page to find and create link annotations for URLs and emails.
 * Returns an array of link annotation objects that can be used with the annotation layer.
 */
async function processLinks(
  page: PDFPageProxy,
  container: HTMLDivElement,
  viewport: PageViewport,
) {
  // Use consistent options for text content - NO marked content
  const textContent = await page.getTextContent({
    disableNormalization: true,
    includeMarkedContent: true,
  });
  const [text, diffs] = normalizeText(textContent);
  const links = findLinks(text);

  // Convert LinkMatch[] to the format expected by convertMatches from highlight.ts
  const matchesForConvert: (number | string)[][] = links.map((link) => [
    link.index,
    link.length,
    link.url,
  ]);
  const convertedMatches = convertMatches(
    matchesForConvert,
    textContent,
    diffs,
  );

  const annotations = [];
  if (convertedMatches.length > 0) {
    const mockTextContainer = document.createElement("div");
    mockTextContainer.style.visibility = "hidden";
    mockTextContainer.className = "textLayer";
    container.parentElement?.appendChild(mockTextContainer);

    const mockTextLayer = new PDFJS.TextLayer({
      textContentSource: page.streamTextContent(),
      container: mockTextContainer,
      viewport: viewport,
    });

    await mockTextLayer.render();
    const textDivs = mockTextLayer.textDivs;

    for (let i = 0; i < convertedMatches.length; i++) {
      const match = convertedMatches[i];
      const url = links[i].url;
      const annotation = createLinkAnnotation(
        match,
        url,
        viewport,
        textDivs,
        mockTextContainer,
        page._pageIndex * 100 + i,
      );
      if (annotation) {
        annotations.push(annotation);
      }
    }
    container.parentElement?.removeChild(mockTextContainer);
  }

  return annotations;
}

export { processLinks };

import * as PDFJS from "pdfjs-dist";
import { AnnotationType } from "pdfjs-dist/build/pdf";

import type {
  IPDFLinkService,
  PageViewport,
} from "pdfjs-dist/types/web/interfaces";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  TextItem,
} from "pdfjs-dist/types/src/display/api";
import type { TextContent } from "pdfjs-dist/types/src/display/text_layer";

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

interface LinkMatch {
  url: string;
  index: number;
  length: number;
}

interface ConvertedMatch {
  begin: { divIdx: number; offset: number };
  end: { divIdx: number; offset: number };
}

/**
 * Converts match indices from the joined text string to text div indices and offsets.
 * This is needed because the text content is split across multiple text divs.
 */
function convertMatches(
  matches: LinkMatch[],
  textContent: TextContent,
): Array<LinkMatch & ConvertedMatch> {
  function endOfLineOffset(
    item: TextItem,
    prevItem: TextItem | null,
    nextItem: TextItem | null,
  ): number {
    // When textitem has a EOL flag and the string has a hyphen at the end
    // the hyphen should be removed (-1 len) so the sentence could be searched as a joined one.
    // In other cases the EOL flag introduce a whitespace (+1 len) between two different sentences
    // In cases where the EOL is between two CJK characters, no offset is added
    if (item.hasEOL && item.str.length === 0) {
      const lastchar = prevItem?.str[prevItem.str.length - 1];
      const nextchar = nextItem?.str[0];

      const isCJK = new RegExp(/(\p{Ideographic}|[\u3040-\u30FF])/u);
      if (lastchar && isCJK.test(lastchar) && nextchar && isCJK.test(nextchar))
        return 0;
    }

    if (item.hasEOL) {
      if (item.str.endsWith("-")) return -1;
      else return 1;
    }
    return 0;
  }

  let index = 0;
  let tindex = 0;
  const textItems = textContent.items as TextItem[];
  const end = textItems.length - 1;

  const convertedMatches: Array<LinkMatch & ConvertedMatch> = [];

  // iterate over all matches
  for (let m = 0; m < matches.length; m++) {
    let mindex = matches[m].index;

    while (index !== end && mindex >= tindex + textItems[index].str.length) {
      const item = textItems[index];
      tindex +=
        item.str.length +
        endOfLineOffset(
          item,
          index - 1 < 0 ? null : textItems[index - 1],
          index + 1 >= textItems.length ? null : textItems[index + 1],
        );
      index++;
    }
    const divStart = {
      divIdx: index,
      offset: mindex - tindex,
    };

    mindex += matches[m].length;

    while (index !== end && mindex > tindex + textItems[index].str.length) {
      const item = textItems[index];
      tindex +=
        item.str.length +
        endOfLineOffset(
          item,
          index - 1 < 0 ? null : textItems[index - 1],
          index + 1 >= textItems.length ? null : textItems[index + 1],
        );
      index++;
    }

    const divEnd = {
      divIdx: index,
      offset: mindex - tindex,
    };

    convertedMatches.push({
      ...matches[m],
      begin: divStart,
      end: divEnd,
    });
  }

  return convertedMatches;
}

function createLinkAnnotation(
  match: LinkMatch & ConvertedMatch,
  viewport: PageViewport,
  textDivs: HTMLElement[],
  textLayerDiv: HTMLDivElement,
  id: number,
) {
  const { url, begin, end } = match;

  const beginDiv = textDivs[begin.divIdx];
  const endDiv = textDivs[end.divIdx];

  if (!beginDiv || !endDiv) {
    return null;
  }

  const range = new Range();
  const [startNode, startOffset] = textPosition(beginDiv, begin.offset);
  const [endNode, endOffset] = textPosition(endDiv, end.offset);

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  return {
    id: `inferred_link_${id}`,
    unsafeUrl: url,
    url,
    annotationType: AnnotationType.LINK,
    rotation: 0,
    ...calculateLinkPosition(range, viewport, textLayerDiv),
    // Populated in the annotationLayer to avoid unnecessary object creation,
    // since most inferred links overlap existing LinkAnnotations:
    borderStyle: null,
  };
}

/* eslint-disable @typescript-eslint/no-unused-vars */
class VueLinkService implements IPDFLinkService {
  externalLinkEnabled: boolean;

  externalLinkTarget: string;
  externalLinkRel: string;
  #pdfDocument: PDFDocumentProxy | null = null;
  #rootEmit: any = null;

  static #index = 0;
  static #regex: RegExp | null = null;
  static #numericTLDRegex: RegExp | null = null;

  /**
   * Reset the internal index counter. Useful when loading a new document.
   */
  static resetIndex() {
    this.#index = 0;
  }

  constructor() {
    this.externalLinkEnabled = true;

    this.externalLinkTarget = "";
    this.externalLinkRel = "noopener noreferrer";
  }

  setDocument(pdfDocument: PDFDocumentProxy) {
    this.#pdfDocument = pdfDocument;
  }

  setRootEmit(rootEmit: any) {
    this.#rootEmit = rootEmit;
  }

  get pagesCount() {
    return this.#pdfDocument?.numPages || 0;
  }

  get page() {
    return 0;
  }

  set page(_value: number) {}

  set rotation(_value: number) {}

  get rotation() {
    return 0;
  }

  get isInPresentationMode() {
    return false;
  }

  /**
   * @param {string|Array} dest - The named, or explicit, PDF destination.
   */
  async goToDestination(dest: string | Array<any>) {
    if (!this.#pdfDocument) {
      return;
    }

    let explicitDest, pageNumber;
    if (typeof dest === "string") {
      explicitDest = await this.#pdfDocument.getDestination(dest);
    } else {
      explicitDest = await dest;
    }
    if (!Array.isArray(explicitDest)) {
      console.error(
        `goToDestination: "${explicitDest}" is not a valid destination array, for dest="${dest}".`,
      );
      return;
    }
    // Dest array looks like that: <page-ref> </XYZ|/FitXXX> <args..>
    const [destRef] = explicitDest;

    if (destRef && typeof destRef === "object") {
      pageNumber = this.#pdfDocument.cachedPageNumber(destRef);

      if (!pageNumber) {
        // Fetch the page reference if it's not yet available. This could
        // only occur during loading, before all pages have been resolved.
        try {
          pageNumber = (await this.#pdfDocument.getPageIndex(destRef)) + 1;
        } catch {
          console.error(
            `goToDestination: "${destRef}" is not a valid page reference, for dest="${dest}".`,
          );
          return;
        }
      }
    } else if (Number.isInteger(destRef)) {
      pageNumber = destRef + 1;
    }
    if (!pageNumber || pageNumber < 1 || pageNumber > this.pagesCount) {
      console.error(
        `goToDestination: "${pageNumber}" is not a valid page number, for dest="${dest}".`,
      );
      return;
    }

    const offset = { left: 0, bottom: 0 };

    switch (explicitDest[1].name) {
      case "XYZ":
      case "FitR":
        offset.left = explicitDest[2];
        offset.bottom = explicitDest[3];
        break;
      case "FitV":
      case "FitBV":
        offset.left = explicitDest[2];
        break;
      case "FitH":
      case "FitBH":
        offset.bottom = explicitDest[2];

        if (
          offset.bottom === null ||
          typeof offset.bottom !== "number" ||
          offset.bottom < 0
        ) {
          offset.bottom = 0;
        }
        break;
    }

    this.#rootEmit("annotation", {
      type: "internal-link",
      data: {
        referencedPage: pageNumber,
        offset,
      },
    });
  }

  addLinkAttributes(link: HTMLAnchorElement, url: string, newWindow = false) {
    if (!this.externalLinkEnabled) return;

    const baseHref =
      typeof window !== "undefined" && window.location
        ? window.location.href
        : "about:blank";

    let safeUrl: URL;
    try {
      safeUrl = new URL(url, baseHref);
    } catch {
      return;
    }

    const protocol = safeUrl.protocol.toLowerCase();
    const allowed =
      protocol === "http:" ||
      protocol === "https:" ||
      protocol === "mailto:" ||
      protocol === "tel:";
    if (!allowed) return;

    link.href = safeUrl.toString();

    if (newWindow) {
      link.target = "_blank";
    } else if (this.externalLinkTarget) {
      link.target = this.externalLinkTarget;
    } else {
      link.removeAttribute("target");
    }

    const rel = this.externalLinkRel || "noopener noreferrer";
    link.rel = rel.includes("noopener") ? rel : `noopener ${rel}`.trim();
  }

  getDestinationHash(_dest: any): string {
    return "#";
  }

  getAnchorUrl(_hash: any): string {
    return "#";
  }

  setExternalLinkTarget(target: string) {
    this.externalLinkTarget = target;
  }

  setExternalLinkRel(rel: string) {
    this.externalLinkRel = rel;
  }

  setHash(_hash: string) {}
  executeNamedAction(_action: string) {}
  executeSetOCGState(_action: object) {}
  cachePageRef(_pageNum: number, _pageRef: object) {}
  goToPage(_val: number | string) {}
  goToXY(pageNumber: number, x: number, y: number): void {}

  /**
   * Process text content into a searchable string, handling line breaks
   * and hyphenation properly.
   */
  static processText(textContent: TextContent): string {
    const strs: string[] = [];
    for (const textItem of textContent.items as TextItem[]) {
      strs.push(textItem.str);
      if (textItem.hasEOL) strs.push("\n");
    }

    let textJoined = strs.join("");
    // Join the text as is presented in textlayer and then perform these replacements to build up broken words
    // 1. newline between CJK characters should be removed
    // 2. hyphen at the end of a line should be removed
    textJoined = textJoined.replace(
      /(?<=\p{Ideographic}|[\u3040-\u30FF])\n(\p{Ideographic}|[\u3040-\u30FF])/gmu,
      "$1",
    );
    textJoined = textJoined.replace(/(?<=\S)-\n/gmu, "");

    // Replace all "valid" newlines with a space
    textJoined = textJoined.replace(/\n/g, " ");

    return textJoined;
  }

  /**
   * Find all URLs and email addresses in the given text.
   * Regex can be tested and verified at https://regex101.com/r/rXoLiT/2
   */
  static findLinks(text: string): LinkMatch[] {
    // Reset regex lastIndex for fresh search
    this.#regex ??=
      /\b(?:https?:\/\/|mailto:|www\.)(?:[\S--[\p{P}<>]]|\/|[\S--[\[\]]]+[\S--[\p{P}<>]])+|(?=\p{L})[\S--[@\p{Ps}\p{Pe}<>]]+@([\S--[[\p{P}--\-]<>]]+(?:\.[\S--[[\p{P}--\-]<>]]+)+)/gmv;

    // Reset lastIndex before searching
    this.#regex.lastIndex = 0;

    const links: LinkMatch[] = [];
    let match;

    while ((match = this.#regex.exec(text)) !== null) {
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
        this.#numericTLDRegex ??= /\.\d+$/;
        if (this.#numericTLDRegex.test(hostname)) {
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
  static async processLinks(
    page: PDFPageProxy,
    container: HTMLDivElement,
    viewport: PageViewport,
  ) {
    // Use consistent options for text content - NO marked content
    const textContent = await page.getTextContent({
      disableNormalization: true,
    });
    const text = this.processText(textContent);
    const links = this.findLinks(text);
    const convertedMatches = convertMatches(links, textContent);

    const annotations = [];
    if (convertedMatches.length > 0) {
      const mockTextContainer = document.createElement("div");
      mockTextContainer.style.visibility = "hidden";
      mockTextContainer.className = "textLayer";
      container.parentElement?.appendChild(mockTextContainer);

      // Use same options as getTextContent - NO marked content
      const mockTextLayer = new PDFJS.TextLayer({
        textContentSource: page.streamTextContent({
          disableNormalization: true,
        }),
        container: mockTextContainer,
        viewport: page.getViewport({ scale: 1 }),
      });

      await mockTextLayer.render();
      const textDivs = mockTextLayer.textDivs;

      for (const match of convertedMatches) {
        const annotation = createLinkAnnotation(
          match,
          viewport,
          textDivs,
          mockTextContainer,
          this.#index++,
        );
        if (annotation) {
          annotations.push(annotation);
        }
      }
      container.parentElement?.removeChild(mockTextContainer);
    }

    return annotations;
  }
}

export { VueLinkService };

import { convertMatches, normalizeText } from "./text_utils";

import type { TextItem } from "pdfjs-dist/types/src/display/api";
import type { TextContent } from "pdfjs-dist/types/src/display/text_layer";
import type { HighlightOptions, Match, PositionDiffs } from "../types";

/**
 * Process text content into a searchable string, handling line breaks
 * and hyphenation properly.
 * @deprecated Use normalizeText instead for accurate position mapping.
 */
function processText(textContent: TextContent): string {
  const [normalized] = normalizeText(textContent);
  return normalized;
}

function searchQuery(
  textContent: TextContent,
  query: string,
  options: HighlightOptions,
): [(number | string)[][], PositionDiffs | null] {
  const [normalizedText, diffs] = normalizeText(textContent);

  const regexFlags = ["g"];
  if (options.ignoreCase) regexFlags.push("i");

  // Trim the query and escape all regex special characters
  let fquery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (options.completeWords) fquery = `\\b${fquery}\\b`;

  const regex = new RegExp(fquery, regexFlags.join(""));

  const matches: (number | string)[][] = [];
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(normalizedText)) !== null)
    matches.push([match.index, match[0].length, match[0]]);

  return [matches, diffs];
}

function highlightMatches(
  matches: Match[],
  textContent: TextContent,
  textDivs: HTMLElement[],
) {
  function appendHighlightDiv(idx: number, startOffset = -1, endOffset = -1) {
    const textItem = textContent.items[idx] as TextItem;
    const nodes = [];

    let content = "";
    let prevContent = "";
    let nextContent = "";

    let div = textDivs[idx];

    if (!div) return; // don't process if div is undefinied

    if (div.nodeType === Node.TEXT_NODE) {
      const span = document.createElement("span");
      div.before(span);
      span.append(div);
      textDivs[idx] = span;
      div = span;
    }

    if (startOffset >= 0 && endOffset >= 0)
      content = textItem.str.substring(startOffset, endOffset);
    else if (startOffset < 0 && endOffset < 0) content = textItem.str;
    else if (startOffset >= 0) content = textItem.str.substring(startOffset);
    else if (endOffset >= 0) content = textItem.str.substring(0, endOffset);

    const node = document.createTextNode(content);
    const span = document.createElement("span");
    span.className = "highlight appended";
    span.append(node);

    nodes.push(span);

    if (startOffset > 0) {
      if (
        div.childNodes.length === 1 &&
        div.childNodes[0].nodeType === Node.TEXT_NODE
      ) {
        prevContent = textItem.str.substring(0, startOffset);
        const node = document.createTextNode(prevContent);
        nodes.unshift(node);
      } else {
        let alength = 0;
        const prevNodes = [];
        for (const childNode of div.childNodes) {
          const textValue =
            childNode.nodeType === Node.TEXT_NODE
              ? childNode.nodeValue!
              : childNode.firstChild!.nodeValue!;
          alength += textValue.length;

          if (alength <= startOffset) prevNodes.push(childNode);
          else if (
            startOffset >= alength - textValue.length &&
            endOffset <= alength
          )
            prevNodes.push(
              document.createTextNode(
                textValue.substring(
                  0,
                  startOffset - (alength - textValue.length),
                ),
              ),
            );
        }
        nodes.unshift(...prevNodes);
      }
    }
    if (endOffset > 0) {
      nextContent = textItem.str.substring(endOffset);
      const node = document.createTextNode(nextContent);
      nodes.push(node);
    }

    div.replaceChildren(...nodes);
  }

  for (const match of matches.sort((a, b) => a.oindex - b.oindex)) {
    if (match.start.idx === match.end.idx) {
      appendHighlightDiv(match.start.idx, match.start.offset, match.end.offset);
    } else {
      for (let si = match.start.idx, ei = match.end.idx; si <= ei; si++) {
        if (si === match.start.idx) appendHighlightDiv(si, match.start.offset);
        else if (si === match.end.idx)
          appendHighlightDiv(si, -1, match.end.offset);
        else appendHighlightDiv(si);
      }
    }
  }
}

function resetDivs(textContent: TextContent, textDivs: HTMLElement[]) {
  const textItems = textContent.items.map((val) => (val as TextItem).str);
  for (let idx = 0; idx < textDivs.length; idx++) {
    const div = textDivs[idx];

    if (div && div.nodeType !== Node.TEXT_NODE) {
      const textNode = document.createTextNode(textItems[idx]);
      div.replaceChildren(textNode);
    }
  }
}

function findMatches(
  queries: string[],
  textContent: TextContent,
  options: HighlightOptions,
) {
  const convertedMatches: Match[] = [];
  for (const query of queries) {
    const [matches, diffs] = searchQuery(textContent, query, options);
    convertedMatches.push(...convertMatches(matches, textContent, diffs));
  }
  return convertedMatches;
}

export { findMatches, highlightMatches, processText, resetDivs };

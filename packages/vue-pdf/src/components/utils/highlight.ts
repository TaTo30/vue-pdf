import type { TextItem } from "pdfjs-dist/types/src/display/api";
import type { TextContent } from "pdfjs-dist/types/src/display/text_layer";
import type { HighlightOptions, Match, PositionDiffs } from "../types";

/**
 * Binary search to find the first item where the predicate returns true.
 */
function binarySearchFirstItem(
  arr: Uint32Array,
  predicate: (x: number) => boolean,
  start = 0,
): number {
  let minIndex = start;
  let maxIndex = arr.length - 1;

  while (minIndex < maxIndex) {
    const currentIndex = (minIndex + maxIndex) >> 1;
    if (predicate(arr[currentIndex])) {
      maxIndex = currentIndex;
    } else {
      minIndex = currentIndex + 1;
    }
  }

  return minIndex;
}

/**
 * Get the original index from the normalized index using the position diffs.
 * Similar to pdf_find_controller.js getOriginalIndex.
 */
function getOriginalIndex(
  diffs: PositionDiffs | null,
  pos: number,
  len: number,
): [number, number] {
  if (!diffs) {
    return [pos, len];
  }

  const [starts, shifts] = diffs;
  const start = pos;
  const end = pos + len - 1;

  let i = binarySearchFirstItem(starts, (x) => x >= start);
  if (starts[i] > start) {
    --i;
  }

  let j = binarySearchFirstItem(starts, (x) => x >= end, i);
  if (starts[j] > end) {
    --j;
  }

  const oldStart = start + shifts[i];
  const oldEnd = end + shifts[j];
  const oldLen = oldEnd + 1 - oldStart;

  return [oldStart, oldLen];
}

/**
 * Normalize text content into a searchable string, tracking position changes.
 * Returns [normalizedText, positionDiffs] where positionDiffs allows mapping
 * from normalized positions back to original positions.
 *
 * Similar to pdf_find_controller.js normalize function but simplified for
 * text content items.
 */
function normalizeText(
  textContent: TextContent,
): [string, PositionDiffs | null] {
  const textItems = textContent.items as TextItem[];

  // Build the raw text with EOL markers
  const strs: string[] = [];
  for (const textItem of textItems) {
    strs.push(textItem.str);
    if (textItem.hasEOL) strs.push("\n");
  }
  const rawText = strs.join("");

  if (rawText.length === 0) {
    return ["", null];
  }

  // Track position shifts as we normalize
  const positions: number[] = [0, 0];
  let shift = 0;

  // Normalization regex that handles:
  // p1: CJK followed by \n followed by CJK (remove \n)
  // p2: Non-whitespace followed by - and \n (remove -\n, hyphenation)
  // p3: Any other \n (replace with space)
  const normalizationRegex =
    /([\p{Ideographic}\u3040-\u30FF])\n([\p{Ideographic}\u3040-\u30FF])|(\S)-\n|(\n)/gmu;

  const normalized = rawText.replace(
    normalizationRegex,
    (match, p1, p2, p3, p4, offset) => {
      if (p1 && p2) {
        // CJK\nCJK -> CJKCJK (remove \n, shift +1)
        // The \n is at offset + p1.length
        const nlPos = offset + p1.length;
        positions.push(nlPos - shift, shift + 1);
        shift += 1;
        return p1 + p2;
      }

      if (p3) {
        // X-\n -> X (remove -\n, shift +2)
        // The - is at offset + p3.length, the \n is at offset + p3.length + 1
        const dashPos = offset + p3.length;
        positions.push(dashPos - shift, shift + 2);
        shift += 2;
        return p3;
      }

      if (p4) {
        // \n -> space (no shift change, just replacement)
        return " ";
      }

      return match;
    },
  );

  // Add final position
  positions.push(normalized.length, shift);

  // Convert to typed arrays for efficient binary search
  const starts = new Uint32Array(positions.length >> 1);
  const shifts = new Int32Array(positions.length >> 1);
  for (let i = 0, ii = positions.length; i < ii; i += 2) {
    starts[i >> 1] = positions[i];
    shifts[i >> 1] = positions[i + 1];
  }

  return [normalized, [starts, shifts]];
}

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

/**
 * Build cumulative position map for text items.
 * Returns array where cumPositions[i] is the starting position of textItems[i] in raw text.
 */
function buildCumulativePositions(textContent: TextContent): number[] {
  const textItems = textContent.items as TextItem[];
  const cumPositions: number[] = [0];
  let pos = 0;

  for (const item of textItems) {
    pos += item.str.length;
    if (item.hasEOL) pos += 1; // Account for \n
    cumPositions.push(pos);
  }

  return cumPositions;
}

/**
 * Find the text item index and offset for a given raw text position.
 */
function findTextItemPosition(
  rawPos: number,
  textContent: TextContent,
  cumPositions: number[],
): { idx: number; offset: number } {
  const textItems = textContent.items as TextItem[];

  // Binary search to find which text item contains this position
  let low = 0;
  let high = textItems.length - 1;

  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (cumPositions[mid] <= rawPos) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  const idx = low;
  const offset = rawPos - cumPositions[idx];

  // Clamp offset to string length (position might be in EOL)
  const item = textItems[idx];
  const clampedOffset = Math.min(offset, item ? item.str.length : 0);

  return { idx, offset: clampedOffset };
}

function convertMatches(
  matches: (number | string)[][],
  textContent: TextContent,
  diffs?: PositionDiffs | null,
): Match[] {
  const textItems = textContent.items as TextItem[];

  if (textItems.length === 0) {
    return [];
  }

  const cumPositions = buildCumulativePositions(textContent);
  const convertedMatches: Match[] = [];

  for (const match of matches) {
    const normalizedIndex = match[0] as number;
    const normalizedLength = match[1] as number;
    const matchStr = match[2] as string;

    // Convert normalized positions to raw positions
    const [rawStart, rawLen] = diffs
      ? getOriginalIndex(diffs, normalizedIndex, normalizedLength)
      : [normalizedIndex, normalizedLength];

    const rawEnd = rawStart + rawLen - 1;

    // Find text item positions
    const start = findTextItemPosition(rawStart, textContent, cumPositions);
    const end = findTextItemPosition(rawEnd, textContent, cumPositions);

    // Adjust end offset to be exclusive (point after the last char)
    const endItem = textItems[end.idx];
    const endOffset = Math.min(
      end.offset + 1,
      endItem ? endItem.str.length : 0,
    );

    convertedMatches.push({
      start,
      end: { idx: end.idx, offset: endOffset },
      str: matchStr,
      oindex: normalizedIndex,
    });
  }

  return convertedMatches;
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

export {
  convertMatches,
  findMatches,
  getOriginalIndex,
  highlightMatches,
  normalizeText,
  processText,
  resetDivs,
};

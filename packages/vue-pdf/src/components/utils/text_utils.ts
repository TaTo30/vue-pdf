import type { Match, PositionDiffs } from "../types";
import type { TextItem, TextContent } from "pdfjs-dist/types/src/display/api";

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

export { convertMatches, normalizeText, getOriginalIndex };

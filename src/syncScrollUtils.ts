const BLOCK_SELECTORS = 'h1, h2, h3, h4, h5, h6, p, table, ul, ol, blockquote, pre';
const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
const PREFIX_LENGTH = 20;

export interface BlockInfo {
  element: HTMLElement;
  text: string;
  tag: string;
}

export function extractBlockElements(container: HTMLElement): BlockInfo[] {
  const elements = container.querySelectorAll<HTMLElement>(BLOCK_SELECTORS);
  const result: BlockInfo[] = [];
  for (const el of elements) {
    // Skip nested block elements (e.g. <p> inside <blockquote>)
    let parent = el.parentElement;
    let isNested = false;
    while (parent && parent !== container) {
      if (parent.matches(BLOCK_SELECTORS)) {
        isNested = true;
        break;
      }
      parent = parent.parentElement;
    }
    if (isNested) continue;

    result.push({
      element: el,
      text: (el.textContent ?? '').trim(),
      tag: el.tagName,
    });
  }
  return result;
}

function isSimilar(a: BlockInfo, b: BlockInfo): boolean {
  if (HEADING_TAGS.has(a.tag) || HEADING_TAGS.has(b.tag)) {
    // Headings: require same tag and exact text match
    return a.tag === b.tag && a.text === b.text;
  }
  // Other blocks: prefix match (first N characters)
  if (a.text.length === 0 && b.text.length === 0) return true;
  if (a.text.length === 0 || b.text.length === 0) return false;
  const prefixA = a.text.slice(0, PREFIX_LENGTH);
  const prefixB = b.text.slice(0, PREFIX_LENGTH);
  return prefixA === prefixB;
}

/**
 * Build matched anchor pairs using LCS (Longest Common Subsequence) algorithm.
 * Returns pairs of elements that correspond to each other in left and right panels.
 */
export function buildAnchorPairs(
  leftBlocks: BlockInfo[],
  rightBlocks: BlockInfo[],
): [HTMLElement, HTMLElement][] {
  const m = leftBlocks.length;
  const n = rightBlocks.length;
  if (m === 0 || n === 0) return [];

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (isSimilar(leftBlocks[i - 1], rightBlocks[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find matched pairs
  const pairs: [HTMLElement, HTMLElement][] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (isSimilar(leftBlocks[i - 1], rightBlocks[j - 1])) {
      pairs.push([leftBlocks[i - 1].element, rightBlocks[j - 1].element]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  pairs.reverse();
  return pairs;
}

/**
 * Compute the target scroll position for the other panel based on the current
 * scroll position of the source panel, using linear interpolation between
 * matched anchor pairs.
 */
export function computeTargetScroll(
  sourceContainer: HTMLElement,
  targetContainer: HTMLElement,
  anchorPairs: [HTMLElement, HTMLElement][],
  sourceSide: 'left' | 'right',
): number {
  if (anchorPairs.length === 0) {
    // Fallback: proportional scroll
    const sourceRatio = sourceContainer.scrollTop / (sourceContainer.scrollHeight - sourceContainer.clientHeight || 1);
    return sourceRatio * (targetContainer.scrollHeight - targetContainer.clientHeight);
  }

  const srcIdx = sourceSide === 'left' ? 0 : 1;
  const tgtIdx = sourceSide === 'left' ? 1 : 0;
  const scrollTop = sourceContainer.scrollTop;

  // Get positions of anchors relative to their container's scroll origin
  const srcPositions = anchorPairs.map((pair) => pair[srcIdx].offsetTop);
  const tgtPositions = anchorPairs.map((pair) => pair[tgtIdx].offsetTop);

  // Before the first anchor
  if (scrollTop <= srcPositions[0]) {
    if (srcPositions[0] === 0) return tgtPositions[0];
    const ratio = scrollTop / srcPositions[0];
    return ratio * tgtPositions[0];
  }

  // Between anchors: find the segment and interpolate
  for (let i = 0; i < srcPositions.length - 1; i++) {
    if (scrollTop >= srcPositions[i] && scrollTop < srcPositions[i + 1]) {
      const srcSpan = srcPositions[i + 1] - srcPositions[i];
      const tgtSpan = tgtPositions[i + 1] - tgtPositions[i];
      const progress = srcSpan === 0 ? 0 : (scrollTop - srcPositions[i]) / srcSpan;
      return tgtPositions[i] + progress * tgtSpan;
    }
  }

  // After the last anchor
  const lastSrc = srcPositions[srcPositions.length - 1];
  const lastTgt = tgtPositions[tgtPositions.length - 1];
  const srcRemaining = sourceContainer.scrollHeight - lastSrc;
  const tgtRemaining = targetContainer.scrollHeight - lastTgt;
  if (srcRemaining === 0) return lastTgt;
  const ratio = (scrollTop - lastSrc) / srcRemaining;
  return lastTgt + ratio * tgtRemaining;
}

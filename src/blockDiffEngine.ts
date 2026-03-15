import { diffChars, type Change } from 'diff';
import { lcs } from './lcs.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Block {
  type: string;
  text: string;
  html: string;
  listTag?: 'ul' | 'ol';
}

export type DiffType = 'equal' | 'modified' | 'removed' | 'added';

export interface BlockDiff {
  type: DiffType;
  leftBlock: Block | null;
  rightBlock: Block | null;
  leftHighlightedHtml?: string;
  rightHighlightedHtml?: string;
}

export interface DiffResult {
  left: string;
  right: string;
}

// ---------------------------------------------------------------------------
// Step 1: Block extraction
// ---------------------------------------------------------------------------

const BLOCK_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'table', 'hr',
  'ul', 'ol',
  'li',
]);

/** Parse HTML and extract a flat list of block elements. */
export function extractBlocks(html: string): Block[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;
  const blocks: Block[] = [];

  function walk(parent: Element, listTag?: 'ul' | 'ol') {
    for (const node of Array.from(parent.children)) {
      const tag = node.tagName.toLowerCase();

      if (tag === 'ul' || tag === 'ol') {
        // Don't emit the list container itself; emit each <li> with listTag metadata
        walk(node, tag as 'ul' | 'ol');
      } else if (BLOCK_TAGS.has(tag)) {
        blocks.push({
          type: tag,
          text: (node.textContent ?? '').trim(),
          html: node.outerHTML,
          listTag,
        });
      } else if (tag === 'div' && node.classList.contains('callout')) {
        // Treat callout divs as block elements
        blocks.push({
          type: 'callout',
          text: (node.textContent ?? '').trim(),
          html: node.outerHTML,
        });
      } else {
        // Recurse into non-block wrappers (e.g. <div>, <section>)
        if (node.children.length > 0) {
          walk(node, listTag);
        }
      }
    }
  }

  walk(body);
  return blocks;
}

// ---------------------------------------------------------------------------
// Step 2: Block matching (LCS)
// ---------------------------------------------------------------------------

/** Levenshtein distance between two strings. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Use two rows instead of full matrix for memory efficiency
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Compute similarity between 0 and 1 based on Levenshtein distance. */
export function levenshteinSimilarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1;
  const maxLen = Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / maxLen;
}

const SIMILARITY_THRESHOLD = 0.3;

/** Check if two blocks can be considered the "same" block. */
function blocksMatch(a: Block, b: Block): boolean {
  if (a.type !== b.type) return false;
  if (a.text === b.text) return true;
  return levenshteinSimilarity(a.text, b.text) >= SIMILARITY_THRESHOLD;
}

/** LCS-based block matching. Returns a list of BlockDiff entries. */
export function matchBlocks(left: Block[], right: Block[]): BlockDiff[] {
  const matched = lcs(left, right, blocksMatch);

  // Build diff list
  const diffs: BlockDiff[] = [];
  let li = 0;
  let ri = 0;

  for (const [ml, mr] of matched) {
    // Emit removed blocks before this match
    while (li < ml) {
      diffs.push({ type: 'removed', leftBlock: left[li], rightBlock: null });
      li++;
    }
    // Emit added blocks before this match
    while (ri < mr) {
      diffs.push({ type: 'added', leftBlock: null, rightBlock: right[ri] });
      ri++;
    }
    // Emit matched pair
    const lb = left[ml];
    const rb = right[mr];
    if (lb.text === rb.text) {
      diffs.push({ type: 'equal', leftBlock: lb, rightBlock: rb });
    } else {
      diffs.push({ type: 'modified', leftBlock: lb, rightBlock: rb });
    }
    li = ml + 1;
    ri = mr + 1;
  }

  // Remaining unmatched blocks
  while (li < left.length) {
    diffs.push({ type: 'removed', leftBlock: left[li], rightBlock: null });
    li++;
  }
  while (ri < right.length) {
    diffs.push({ type: 'added', leftBlock: null, rightBlock: right[ri] });
    ri++;
  }

  return diffs;
}

// ---------------------------------------------------------------------------
// Step 3: Within-block text diff
// ---------------------------------------------------------------------------

const MIN_MATCH_LENGTH = 3;

/** Merge short equal parts (< minLength chars) into surrounding changes. */
export function mergeShortMatches(parts: Change[]): Change[] {
  if (parts.length === 0) return parts;

  const merged: Change[] = [];
  for (const part of parts) {
    if (
      !part.added &&
      !part.removed &&
      part.value.length < MIN_MATCH_LENGTH &&
      merged.length > 0
    ) {
      // Absorb short equal into previous change
      const prev = merged[merged.length - 1];
      if (prev.added || prev.removed) {
        prev.value += part.value;
        continue;
      }
    }
    merged.push({ ...part });
  }

  // Second pass: absorb trailing short equals that precede a change
  const result: Change[] = [];
  for (let k = 0; k < merged.length; k++) {
    const curr = merged[k];
    const next = merged[k + 1];
    if (
      !curr.added &&
      !curr.removed &&
      curr.value.length < MIN_MATCH_LENGTH &&
      next &&
      (next.added || next.removed)
    ) {
      next.value = curr.value + next.value;
      continue;
    }
    result.push(curr);
  }

  return result;
}

/**
 * Given a block's outer HTML and text diff parts, insert highlight spans
 * into the HTML by walking text nodes.
 */
function applyHighlightsToHtml(
  html: string,
  parts: Change[],
  side: 'left' | 'right',
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return html;

  // Collect all text nodes in order
  const textNodes: Text[] = [];
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let tn: Text | null;
  while ((tn = walker.nextNode() as Text | null)) {
    textNodes.push(tn);
  }

  // Build the expected text by concatenating relevant parts
  const relevantParts = parts.filter((p) => {
    if (side === 'left') return !p.added; // show removed + equal
    return !p.removed; // show added + equal
  });

  // Walk through text nodes and parts simultaneously, inserting highlights
  let partIdx = 0;
  let partOffset = 0;

  for (const textNode of textNodes) {
    const original = textNode.textContent ?? '';
    if (original.length === 0) continue;

    const fragments: Array<{ text: string; highlight: boolean }> = [];
    let nodeOffset = 0;

    while (nodeOffset < original.length && partIdx < relevantParts.length) {
      const part = relevantParts[partIdx];
      const partRemaining = part.value.length - partOffset;
      const nodeRemaining = original.length - nodeOffset;
      const take = Math.min(partRemaining, nodeRemaining);

      const isHighlight =
        side === 'left' ? !!part.removed : !!part.added;

      fragments.push({
        text: original.slice(nodeOffset, nodeOffset + take),
        highlight: isHighlight,
      });

      nodeOffset += take;
      partOffset += take;

      if (partOffset >= part.value.length) {
        partIdx++;
        partOffset = 0;
      }
    }

    // If there's remaining text in the node (shouldn't happen normally)
    if (nodeOffset < original.length) {
      fragments.push({ text: original.slice(nodeOffset), highlight: false });
    }

    // Replace text node with fragments
    if (fragments.some((f) => f.highlight)) {
      const parent = textNode.parentNode!;
      for (const frag of fragments) {
        if (frag.highlight) {
          const span = doc.createElement('span');
          span.className = side === 'left' ? 'diff-del' : 'diff-ins';
          span.textContent = frag.text;
          parent.insertBefore(span, textNode);
        } else {
          parent.insertBefore(doc.createTextNode(frag.text), textNode);
        }
      }
      parent.removeChild(textNode);
    }
  }

  return root.outerHTML;
}

/** Compute text-level diff within a matched block pair and return highlighted HTML. */
export function highlightTextDiff(
  leftHtml: string,
  rightHtml: string,
  leftText: string,
  rightText: string,
): { left: string; right: string } {
  const rawParts = diffChars(leftText, rightText);
  const parts = mergeShortMatches(rawParts);

  return {
    left: applyHighlightsToHtml(leftHtml, parts, 'left'),
    right: applyHighlightsToHtml(rightHtml, parts, 'right'),
  };
}

// ---------------------------------------------------------------------------
// Step 4: Final HTML construction
// ---------------------------------------------------------------------------

/** Wrap a block's HTML with a background class for added/removed blocks. */
function wrapWithClass(html: string, className: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const el = doc.body.firstElementChild;
  if (el) {
    el.classList.add(className);
    return el.outerHTML;
  }
  return `<div class="${className}">${html}</div>`;
}

/** Re-wrap consecutive li blocks that share the same listTag into their list container. */
function rebuildLists(htmlParts: Array<{ html: string; block: Block | null }>): string {
  const output: string[] = [];
  let currentListTag: string | null = null;
  let listItems: string[] = [];

  function flushList() {
    if (currentListTag && listItems.length > 0) {
      output.push(`<${currentListTag}>${listItems.join('')}</${currentListTag}>`);
      listItems = [];
      currentListTag = null;
    }
  }

  for (const { html, block } of htmlParts) {
    if (block?.listTag && block.type === 'li') {
      if (currentListTag && currentListTag !== block.listTag) {
        flushList();
      }
      currentListTag = block.listTag;
      listItems.push(html);
    } else {
      flushList();
      output.push(html);
    }
  }
  flushList();

  return output.join('\n');
}

/** Main entry point: compute block-level diff and return left/right HTML. */
export function computeBlockDiff(leftHtml: string, rightHtml: string): DiffResult {
  const leftBlocks = extractBlocks(leftHtml);
  const rightBlocks = extractBlocks(rightHtml);
  const diffs = matchBlocks(leftBlocks, rightBlocks);

  const leftParts: Array<{ html: string; block: Block | null }> = [];
  const rightParts: Array<{ html: string; block: Block | null }> = [];

  for (const diff of diffs) {
    switch (diff.type) {
      case 'equal':
        leftParts.push({ html: diff.leftBlock!.html, block: diff.leftBlock });
        rightParts.push({ html: diff.rightBlock!.html, block: diff.rightBlock });
        break;

      case 'modified': {
        const highlighted = highlightTextDiff(
          diff.leftBlock!.html,
          diff.rightBlock!.html,
          diff.leftBlock!.text,
          diff.rightBlock!.text,
        );
        leftParts.push({ html: highlighted.left, block: diff.leftBlock });
        rightParts.push({ html: highlighted.right, block: diff.rightBlock });
        break;
      }

      case 'removed':
        leftParts.push({
          html: wrapWithClass(diff.leftBlock!.html, 'diff-block-del'),
          block: diff.leftBlock,
        });
        break;

      case 'added':
        rightParts.push({
          html: wrapWithClass(diff.rightBlock!.html, 'diff-block-ins'),
          block: diff.rightBlock,
        });
        break;
    }
  }

  return {
    left: rebuildLists(leftParts),
    right: rebuildLists(rightParts),
  };
}

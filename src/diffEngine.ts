import HtmlDiff from 'htmldiff-js';

export interface DiffResult {
  left: string;
  right: string;
}

/** Remove block elements that have become empty (whitespace-only) after stripping ins/del tags. */
function removeEmptyBlocks(html: string): string {
  const blockTags = 'li|p|h[1-6]|tr|td|th|blockquote|pre|div|ul|ol|table|thead|tbody|tfoot';
  const pattern = new RegExp(`<(${blockTags})(\\s[^>]*)?>\\s*<\\/\\1>`, 'gi');
  let prev = html;
  // Repeat until stable — inner removals may leave outer elements empty
  for (;;) {
    const next = prev.replace(pattern, '');
    if (next === prev) return next;
    prev = next;
  }
}

/** Check if a <li> element contains any highlight tag (ins/del). */
function containsHighlight(li: Element, tag: string): boolean {
  return li.querySelector(tag) !== null;
}

/**
 * Remove list structures that are artifacts from the other revision.
 * If ALL <li> children of a <ul>/<ol> contain only highlighted content,
 * the list belongs to the other revision — unwrap the content and remove the list.
 */
function cleanStructuralArtifacts(html: string, highlightTag: 'ins' | 'del'): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;

  const lists = body.querySelectorAll('ul, ol');
  lists.forEach((list) => {
    const items = Array.from(list.querySelectorAll(':scope > li'));
    if (items.length === 0) return;

    const allContainHighlight = items.every((li) => containsHighlight(li, highlightTag));
    if (!allContainHighlight) return;

    // Extract content from each li and insert before the list
    items.forEach((li) => {
      while (li.firstChild) {
        list.parentNode!.insertBefore(li.firstChild, list);
      }
    });
    list.remove();
  });

  return body.innerHTML;
}

export function computeDiff(leftHtml: string, rightHtml: string): DiffResult {
  const diffHtml = HtmlDiff.execute(leftHtml, rightHtml);

  // [DEBUG] htmldiff-js merged output
  console.log('[DEBUG] === leftHtml (input) ===');
  console.log(leftHtml);
  console.log('[DEBUG] === rightHtml (input) ===');
  console.log(rightHtml);
  console.log('[DEBUG] === htmldiff-js merged output ===');
  console.log(diffHtml);

  // For the left panel: show deletions highlighted, strip insertions
  const leftStripped = diffHtml
    .replace(/<ins[^>]*>[\s\S]*?<\/ins>/gi, '')
    .replace(/<del([^>]*)>/gi, '<del$1>')
    .replace(/<\/del>/gi, '</del>');
  console.log('[DEBUG] === left after strip ins ===');
  console.log(leftStripped);

  const leftCleaned = removeEmptyBlocks(leftStripped);
  console.log('[DEBUG] === left after removeEmptyBlocks ===');
  console.log(leftCleaned);

  const left = cleanStructuralArtifacts(leftCleaned, 'del');
  console.log('[DEBUG] === left after cleanStructuralArtifacts ===');
  console.log(left);

  // For the right panel: show insertions highlighted, strip deletions
  const rightStripped = diffHtml
    .replace(/<del[^>]*>[\s\S]*?<\/del>/gi, '')
    .replace(/<ins([^>]*)>/gi, '<ins$1>')
    .replace(/<\/ins>/gi, '</ins>');
  console.log('[DEBUG] === right after strip del ===');
  console.log(rightStripped);

  const rightCleaned = removeEmptyBlocks(rightStripped);
  console.log('[DEBUG] === right after removeEmptyBlocks ===');
  console.log(rightCleaned);

  const right = cleanStructuralArtifacts(rightCleaned, 'ins');
  console.log('[DEBUG] === right after cleanStructuralArtifacts ===');
  console.log(right);

  return { left, right };
}

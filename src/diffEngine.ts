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

export function computeDiff(leftHtml: string, rightHtml: string): DiffResult {
  const diffHtml = HtmlDiff.execute(leftHtml, rightHtml);

  // For the left panel: show deletions highlighted, strip insertions
  const left = removeEmptyBlocks(
    diffHtml
      .replace(/<ins[^>]*>[\s\S]*?<\/ins>/gi, '')
      .replace(/<del([^>]*)>/gi, '<del$1>')
      .replace(/<\/del>/gi, '</del>'),
  );

  // For the right panel: show insertions highlighted, strip deletions
  const right = removeEmptyBlocks(
    diffHtml
      .replace(/<del[^>]*>[\s\S]*?<\/del>/gi, '')
      .replace(/<ins([^>]*)>/gi, '<ins$1>')
      .replace(/<\/ins>/gi, '</ins>'),
  );

  return { left, right };
}

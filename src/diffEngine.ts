import HtmlDiff from 'htmldiff-js';

export interface DiffResult {
  left: string;
  right: string;
}

export function computeDiff(leftHtml: string, rightHtml: string): DiffResult {
  const diffHtml = HtmlDiff.execute(leftHtml, rightHtml);

  // For the left panel: show deletions highlighted, strip insertions
  const left = diffHtml
    .replace(/<ins[^>]*>[\s\S]*?<\/ins>/gi, '')
    .replace(/<del([^>]*)>/gi, '<del$1>')
    .replace(/<\/del>/gi, '</del>');

  // For the right panel: show insertions highlighted, strip deletions
  const right = diffHtml
    .replace(/<del[^>]*>[\s\S]*?<\/del>/gi, '')
    .replace(/<ins([^>]*)>/gi, '<ins$1>')
    .replace(/<\/ins>/gi, '</ins>');

  return { left, right };
}

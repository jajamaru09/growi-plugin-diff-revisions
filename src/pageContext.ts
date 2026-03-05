import type { PageMode } from './types.ts';

const PAGE_ID_RE = /^\/([0-9a-f]{24})$/;

export function isPageIdUrl(pathname: string): boolean {
  if (pathname.startsWith('/_admin') || pathname.startsWith('/_search')) {
    return false;
  }
  return PAGE_ID_RE.test(pathname);
}

export function extractPageId(pathname: string): string | null {
  const m = pathname.match(PAGE_ID_RE);
  return m ? m[1] : null;
}

export function hashToMode(hash: string): PageMode {
  return hash === '#edit' ? 'edit' : 'view';
}

import type { GrowiPageContext, PageMode } from './types.ts';
import { extractPageId, hashToMode, isPageIdUrl } from './pageContext.ts';

type PageChangeCallback = (ctx: GrowiPageContext) => void | Promise<void>;

export function createPageChangeListener(callback: PageChangeCallback) {
  let lastKey = '';
  let abortController: AbortController | null = null;

  function buildContext(url: URL): GrowiPageContext | null {
    if (!isPageIdUrl(url.pathname)) return null;
    const pageId = extractPageId(url.pathname);
    if (!pageId) return null;
    const mode: PageMode = hashToMode(url.hash);
    return { pageId, mode };
  }

  function fire(ctx: GrowiPageContext) {
    const key = `${ctx.pageId}:${ctx.mode}`;
    if (key === lastKey) return;
    lastKey = key;
    try {
      const result = callback(ctx);
      if (result && typeof (result as Promise<void>).catch === 'function') {
        (result as Promise<void>).catch(console.error);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function start() {
    // Initial load
    const ctx = buildContext(new URL(location.href));
    if (ctx) fire(ctx);

    if (!window.navigation) return;

    abortController = new AbortController();
    window.navigation.addEventListener(
      'navigatesuccess',
      () => {
        const c = buildContext(new URL(location.href));
        if (c) fire(c);
      },
      { signal: abortController.signal },
    );
  }

  function stop() {
    lastKey = '';
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  }

  return { start, stop };
}

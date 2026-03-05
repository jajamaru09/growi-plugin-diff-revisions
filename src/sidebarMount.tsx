import { createRoot, type Root } from 'react-dom/client';
import { DiffButton } from './components/DiffButton.tsx';

const MOUNT_ID = 'growi-plugin-diff-revisions-mount';

let root: Root | null = null;

function getContainer(): HTMLElement | null {
  const ref =
    document.querySelector('[data-testid="pageListButton"]') ??
    document.querySelector('[data-testid="pageCommentButton"]');
  return ref?.parentElement ?? null;
}

function getCssModuleClass(): string {
  const container = getContainer();
  if (!container) return '';
  const btn = container.querySelector('button');
  if (!btn) return '';
  for (const cls of btn.classList) {
    if (cls.startsWith('PageAccessoriesControl_btn-page-accessories__')) {
      return cls;
    }
  }
  return '';
}

function ensureRoot(): Root {
  if (root) return root;

  const container = getContainer();
  if (!container) throw new Error('Sidebar container not found');

  let el = document.getElementById(MOUNT_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = MOUNT_ID;
    container.appendChild(el);
  }

  root = createRoot(el);
  return root;
}

export function mountOrUpdate(pageId: string): void {
  try {
    const r = ensureRoot();
    const cssClass = getCssModuleClass();
    r.render(<DiffButton pageId={pageId} cssClass={cssClass} />);
  } catch (e) {
    console.error('[growi-plugin-diff-revisions]', e);
  }
}

export function unmount(): void {
  if (root) {
    root.unmount();
    root = null;
  }
  const el = document.getElementById(MOUNT_ID);
  if (el) el.remove();
}

/**
 * client-entry.tsx — growi-plugin-diff-revisions
 *
 * GROWI loads this file in the browser.
 * Plugins are recognized when they register with window.pluginActivators.
 */

import type { GrowiPageContext } from './src/types.ts';
import { createPageChangeListener } from './src/growiNavigation.ts';
import { mountOrUpdate, unmount } from './src/sidebarMount.tsx';

declare global {
  interface Window {
    pluginActivators?: Record<
      string,
      { activate: () => void; deactivate: () => void }
    >;
    navigation?: EventTarget & {
      addEventListener: EventTarget['addEventListener'];
    };
  }
}

const PLUGIN_NAME = 'growi-plugin-diff-revisions';

const handlePageChange = (ctx: GrowiPageContext) => {
  if (ctx.mode === 'view') {
    mountOrUpdate(ctx.pageId);
  } else {
    unmount();
  }
};

const listener = createPageChangeListener(handlePageChange);

function activate() {
  listener.start();
}

function deactivate() {
  listener.stop();
  unmount();
}

window.pluginActivators = window.pluginActivators ?? {};
window.pluginActivators[PLUGIN_NAME] = { activate, deactivate };

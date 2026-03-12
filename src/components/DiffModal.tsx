import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { RevisionItem } from '../types.ts';
import { RevisionSelector } from './RevisionSelector.tsx';
import { DiffPanel } from './DiffPanel.tsx';
import { renderMarkdown } from '../markdownRenderer.ts';
import { computeBlockDiff } from '../blockDiffEngine.ts';
import { useSyncScroll } from '../useSyncScroll.ts';
import { useRevisionNavigation } from '../useRevisionNavigation.ts';
import { MarkdownDiffPanel } from './MarkdownDiffPanel.tsx';

interface Props {
  revisions: RevisionItem[];
  loading: boolean;
  error: string | null;
  pageId: string;
  onClose: () => void;
}

export function DiffModal({ revisions, loading, error, pageId, onClose }: Props) {
  const nav = useRevisionNavigation(revisions);
  const [leftHtml, setLeftHtml] = useState('');
  const [rightHtml, setRightHtml] = useState('');
  const [syncScroll, setSyncScroll] = useState(true);
  const [diffMode, setDiffMode] = useState<'html' | 'markdown'>('html');
  const [leftPanelEl, setLeftPanelEl] = useState<HTMLDivElement | null>(null);
  const [rightPanelEl, setRightPanelEl] = useState<HTMLDivElement | null>(null);

  // Determine if selected revisions have identical markdown
  const noDiff = useMemo(() => {
    const left = revisions.find((r) => r.revisionId === nav.leftId);
    const right = revisions.find((r) => r.revisionId === nav.rightId);
    if (!left || !right) return false;
    return left.body === right.body;
  }, [revisions, nav.leftId, nav.rightId]);

  const handleJumpToFirstDiff = useCallback(() => {
    const selector = '.diff-del, .diff-ins, .diff-block-del, .diff-block-ins';
    const panels = [leftPanelEl, rightPanelEl].filter(Boolean) as HTMLDivElement[];
    for (const panel of panels) {
      const firstDiff = panel.querySelector(selector);
      if (firstDiff) {
        firstDiff.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  }, [leftPanelEl, rightPanelEl]);

  useSyncScroll({
    leftEl: leftPanelEl,
    rightEl: rightPanelEl,
    enabled: syncScroll && diffMode === 'html',
    leftHtml,
    rightHtml,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Compute diff when both revisions are selected
  useEffect(() => {
    const left = revisions.find((r) => r.revisionId === nav.leftId);
    const right = revisions.find((r) => r.revisionId === nav.rightId);
    if (!left || !right) {
      setLeftHtml('');
      setRightHtml('');
      return;
    }

    let cancelled = false;

    (async () => {
      const [lHtml, rHtml] = await Promise.all([
        renderMarkdown(left.body),
        renderMarkdown(right.body),
      ]);
      if (cancelled) return;

      const diffResult = computeBlockDiff(lHtml, rHtml);
      setLeftHtml(diffResult.left);
      setRightHtml(diffResult.right);
    })();

    return () => {
      cancelled = true;
    };
  }, [nav.leftId, nav.rightId, revisions]);

  const modal = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bs-body-bg, #fff)',
          color: 'var(--bs-body-color, #212529)',
          borderRadius: '8px',
          width: '95vw',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid var(--bs-border-color, #dee2e6)',
          }}
        >
          <h5 style={{ margin: 0 }}>差分比較</h5>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {noDiff && (
              <span
                className="badge bg-info"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                差分なし
              </span>
            )}
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className={`btn ${diffMode === 'html' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setDiffMode('html')}
              >
                HTML
              </button>
              <button
                type="button"
                className={`btn ${diffMode === 'markdown' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setDiffMode('markdown')}
              >
                Markdown
              </button>
            </div>
            {diffMode === 'html' && (
              <div className="form-check form-switch" style={{ margin: 0 }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="syncScrollToggle"
                  checked={syncScroll}
                  onChange={(e) => setSyncScroll(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="syncScrollToggle" style={{ fontSize: '14px' }}>
                  スクロール連動
                </label>
              </div>
            )}
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '12px 16px' }}>
          {loading && <p>読み込み中...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
              {/* Revision selectors row */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <RevisionSelector
                    revisions={revisions}
                    selectedId={nav.leftId}
                    pageId={pageId}
                    onChange={nav.setLeftId}
                    onPrev={() => nav.setLeftId((prev) => nav.shiftRevision(prev, -1))}
                    onNext={() => nav.setLeftId((prev) => nav.shiftRevision(prev, 1))}
                    canPrev={nav.canLeftPrev}
                    canNext={nav.canLeftNext}
                  />
                </div>
                {/* Center navigation buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '2px', gap: '2px' }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    style={{ padding: '2px 6px', fontSize: '14px', lineHeight: 1 }}
                    disabled={!nav.canBothPrev}
                    onClick={() => nav.shiftBoth(-1)}
                    title="両方を前のリビジョンへ"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    style={{ padding: '2px 6px', fontSize: '14px', lineHeight: 1 }}
                    disabled={!nav.canBothNext}
                    onClick={() => nav.shiftBoth(1)}
                    title="両方を次のリビジョンへ"
                  >
                    ▶
                  </button>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <RevisionSelector
                    revisions={revisions}
                    selectedId={nav.rightId}
                    pageId={pageId}
                    onChange={nav.setRightId}
                    onPrev={() => nav.setRightId((prev) => nav.shiftRevision(prev, -1))}
                    onNext={() => nav.setRightId((prev) => nav.shiftRevision(prev, 1))}
                    canPrev={nav.canRightPrev}
                    canNext={nav.canRightNext}
                  />
                </div>
              </div>

              {/* Jump to first diff button */}
              {diffMode === 'html' && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    style={{ padding: '2px 10px', fontSize: '13px', lineHeight: 1 }}
                    disabled={noDiff}
                    onClick={handleJumpToFirstDiff}
                    title="最初の差分へ移動"
                  >
                    ▼ 最初の差分へ
                  </button>
                </div>
              )}

              {/* Diff content area */}
              {diffMode === 'html' ? (
                <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
                  <DiffPanel ref={setLeftPanelEl} html={leftHtml} side="left" />
                  <DiffPanel ref={setRightPanelEl} html={rightHtml} side="right" />
                </div>
              ) : (
                <MarkdownDiffPanel
                  leftBody={revisions.find((r) => r.revisionId === nav.leftId)?.body ?? ''}
                  rightBody={revisions.find((r) => r.revisionId === nav.rightId)?.body ?? ''}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

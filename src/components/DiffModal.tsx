import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { RevisionItem } from '../types.ts';
import { RevisionSelector } from './RevisionSelector.tsx';
import { DiffPanel } from './DiffPanel.tsx';
import { renderMarkdown } from '../markdownRenderer.ts';
import { computeDiff } from '../diffEngine.ts';
import { useSyncScroll } from '../useSyncScroll.ts';

interface Props {
  revisions: RevisionItem[];
  loading: boolean;
  error: string | null;
  pageId: string;
  onClose: () => void;
}

export function DiffModal({ revisions, loading, error, pageId, onClose }: Props) {
  const [leftId, setLeftId] = useState<string>('');
  const [rightId, setRightId] = useState<string>('');
  const [leftHtml, setLeftHtml] = useState<string>('');
  const [rightHtml, setRightHtml] = useState<string>('');
  const [syncScroll, setSyncScroll] = useState(true);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useSyncScroll({
    leftRef: leftPanelRef,
    rightRef: rightPanelRef,
    enabled: syncScroll,
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

  // Set default revision selection when revisions are loaded
  useEffect(() => {
    if (revisions.length >= 2) {
      setLeftId(revisions[revisions.length - 2].revisionId);
      setRightId(revisions[revisions.length - 1].revisionId);
    } else if (revisions.length === 1) {
      setLeftId('');
      setRightId(revisions[0].revisionId);
    }
  }, [revisions]);

  // Revision navigation helpers
  const getIndex = useCallback(
    (id: string) => revisions.findIndex((r) => r.revisionId === id),
    [revisions],
  );

  const shiftRevision = useCallback(
    (currentId: string, delta: number): string => {
      const idx = getIndex(currentId);
      if (idx < 0) return currentId;
      const next = idx + delta;
      if (next < 0 || next >= revisions.length) return currentId;
      return revisions[next].revisionId;
    },
    [getIndex, revisions],
  );

  const leftIdx = getIndex(leftId);
  const rightIdx = getIndex(rightId);
  const canLeftPrev = leftIdx > 0;
  const canLeftNext = leftIdx >= 0 && leftIdx < revisions.length - 1;
  const canRightPrev = rightIdx > 0;
  const canRightNext = rightIdx >= 0 && rightIdx < revisions.length - 1;
  const canBothPrev = canLeftPrev && canRightPrev;
  const canBothNext = canLeftNext && canRightNext;

  const shiftBoth = useCallback(
    (delta: number) => {
      setLeftId((prev) => shiftRevision(prev, delta));
      setRightId((prev) => shiftRevision(prev, delta));
    },
    [shiftRevision],
  );

  // Compute diff when both revisions are selected
  useEffect(() => {
    const left = revisions.find((r) => r.revisionId === leftId);
    const right = revisions.find((r) => r.revisionId === rightId);
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

      const diffResult = computeDiff(lHtml, rHtml);
      setLeftHtml(diffResult.left);
      setRightHtml(diffResult.right);
    })();

    return () => {
      cancelled = true;
    };
  }, [leftId, rightId, revisions]);

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
            <div
              style={{
                display: 'flex',
                gap: '16px',
                height: '100%',
              }}
            >
              {/* Left panel */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <RevisionSelector
                  revisions={revisions}
                  selectedId={leftId}
                  pageId={pageId}
                  onChange={setLeftId}
                  onPrev={() => setLeftId((prev) => shiftRevision(prev, -1))}
                  onNext={() => setLeftId((prev) => shiftRevision(prev, 1))}
                  canPrev={canLeftPrev}
                  canNext={canLeftNext}
                />
                <DiffPanel ref={leftPanelRef} html={leftHtml} side="left" />
              </div>

              {/* Center navigation buttons */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  paddingTop: '2px',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  style={{ padding: '2px 6px', fontSize: '14px', lineHeight: 1 }}
                  disabled={!canBothPrev}
                  onClick={() => shiftBoth(-1)}
                  title="両方を前のリビジョンへ"
                >
                  ◀
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  style={{ padding: '2px 6px', fontSize: '14px', lineHeight: 1 }}
                  disabled={!canBothNext}
                  onClick={() => shiftBoth(1)}
                  title="両方を次のリビジョンへ"
                >
                  ▶
                </button>
              </div>

              {/* Right panel */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <RevisionSelector
                  revisions={revisions}
                  selectedId={rightId}
                  pageId={pageId}
                  onChange={setRightId}
                  onPrev={() => setRightId((prev) => shiftRevision(prev, -1))}
                  onNext={() => setRightId((prev) => shiftRevision(prev, 1))}
                  canPrev={canRightPrev}
                  canNext={canRightNext}
                />
                <DiffPanel ref={rightPanelRef} html={rightHtml} side="right" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

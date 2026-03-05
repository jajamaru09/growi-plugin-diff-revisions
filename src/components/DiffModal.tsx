import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { RevisionItem } from '../types.ts';
import { RevisionSelector } from './RevisionSelector.tsx';
import { DiffPanel } from './DiffPanel.tsx';
import { renderMarkdown } from '../markdownRenderer.ts';
import { computeDiff } from '../diffEngine.ts';

interface Props {
  revisions: RevisionItem[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function DiffModal({ revisions, loading, error, onClose }: Props) {
  const [leftId, setLeftId] = useState<string>('');
  const [rightId, setRightId] = useState<string>('');
  const [leftHtml, setLeftHtml] = useState<string>('');
  const [rightHtml, setRightHtml] = useState<string>('');

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
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          />
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
                  onChange={setLeftId}
                />
                <DiffPanel html={leftHtml} side="left" />
              </div>

              {/* Right panel */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <RevisionSelector
                  revisions={revisions}
                  selectedId={rightId}
                  onChange={setRightId}
                />
                <DiffPanel html={rightHtml} side="right" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

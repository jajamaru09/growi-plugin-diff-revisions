import { useCallback, useEffect, useState } from 'react';
import type { RevisionItem } from '../types.ts';
import { fetchAllRevisions } from '../growiApi.ts';
import { DiffModal } from './DiffModal.tsx';

interface Props {
  pageId: string;
  cssClass?: string;
}

export function DiffButton({ pageId, cssClass }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close modal on page change
  useEffect(() => {
    setIsOpen(false);
  }, [pageId]);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);
    try {
      const items = await fetchAllRevisions(pageId);
      setRevisions(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'リビジョンの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  return (
    <>
      <button
        type="button"
        className={`btn btn-sm ${cssClass ?? ''}`}
        title="差分比較"
        onClick={handleOpen}
        style={{ border: 'none', background: 'transparent' }}
      >
        <span className="material-symbols-outlined">compare_arrows</span>
      </button>
      {isOpen && (
        <DiffModal
          revisions={revisions}
          loading={loading}
          error={error}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

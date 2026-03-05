import type { RevisionItem } from '../types.ts';

interface Props {
  revisions: RevisionItem[];
  selectedId: string;
  pageId: string;
  onChange: (revisionId: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${mo}/${d} ${h}:${mi}`;
}

const navBtnStyle: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: '14px',
  lineHeight: 1,
};

export function RevisionSelector({
  revisions,
  selectedId,
  pageId,
  onChange,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: Props) {
  const revisionUrl = selectedId ? `/${pageId}?revisionId=${selectedId}` : '';

  return (
    <div className="d-flex align-items-center gap-1" style={{ marginBottom: '8px' }}>
      <select
        className="form-select form-select-sm"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1 }}
      >
        <option value="">-- リビジョンを選択 --</option>
        {[...revisions].reverse().map((rev) => (
          <option key={rev.revisionId} value={rev.revisionId}>
            #{rev.revisionNo} - {rev.revisionId.slice(0, 8)} - {formatDate(rev.createdAt)}{' '}
            {rev.authorName}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        style={navBtnStyle}
        disabled={!canPrev}
        onClick={onPrev}
        title="前のリビジョン"
      >
        ◀
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        style={navBtnStyle}
        disabled={!canNext}
        onClick={onNext}
        title="次のリビジョン"
      >
        ▶
      </button>
      <a
        href={revisionUrl || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline-secondary btn-sm"
        style={{
          ...navBtnStyle,
          pointerEvents: revisionUrl ? 'auto' : 'none',
          opacity: revisionUrl ? 1 : 0.5,
          textDecoration: 'none',
        }}
        title="リビジョンを別タブで開く"
        aria-disabled={!revisionUrl}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
      </a>
    </div>
  );
}

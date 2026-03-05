import type { RevisionItem } from '../types.ts';

interface Props {
  revisions: RevisionItem[];
  selectedId: string;
  onChange: (revisionId: string) => void;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${mo}/${d} ${h}:${mi}`;
}

export function RevisionSelector({ revisions, selectedId, onChange }: Props) {
  return (
    <select
      className="form-select form-select-sm"
      value={selectedId}
      onChange={(e) => onChange(e.target.value)}
      style={{ marginBottom: '8px' }}
    >
      <option value="">-- リビジョンを選択 --</option>
      {revisions.map((rev) => (
        <option key={rev.revisionId} value={rev.revisionId}>
          #{rev.revisionNo} - {rev.revisionId.slice(0, 8)} - {formatDate(rev.createdAt)}{' '}
          {rev.authorName}
        </option>
      ))}
    </select>
  );
}

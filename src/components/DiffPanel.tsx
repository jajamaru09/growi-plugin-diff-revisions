interface Props {
  html: string;
  side: 'left' | 'right';
}

const DIFF_STYLES = `
  ins {
    background-color: #e6ffec;
    text-decoration: none;
  }
  del {
    background-color: #ffebe9;
    text-decoration: none;
  }
`;

export function DiffPanel({ html, side }: Props) {
  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        border: '1px solid var(--bs-border-color, #dee2e6)',
        borderRadius: '4px',
        padding: '16px',
      }}
    >
      <style>{DIFF_STYLES}</style>
      {html ? (
        <div
          className="wiki"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p style={{ color: '#999' }}>
          {side === 'left' ? '左' : '右'}のリビジョンを選択してください
        </p>
      )}
    </div>
  );
}

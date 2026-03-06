import { forwardRef } from 'react';

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
  .diff-del {
    background-color: #ffebe9;
  }
  .diff-ins {
    background-color: #e6ffec;
  }
  .diff-block-del {
    background-color: #ffebe9;
  }
  .diff-block-ins {
    background-color: #e6ffec;
  }
`;

export const DiffPanel = forwardRef<HTMLDivElement, Props>(function DiffPanel({ html, side }, ref) {
  return (
    <div
      ref={ref}
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
});

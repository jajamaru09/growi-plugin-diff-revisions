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

  /* Callout styles */
  .callout {
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    color: inherit;
    border-left: .25em solid #6c757d;
    border-radius: 0.25rem;
  }
  .callout-indicator {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    line-height: 1;
    font-weight: 600;
  }
  .callout-title {
    font-size: 0.95em;
  }
  .callout-content > *:first-child {
    margin-block-start: 0;
  }
  .callout-content > *:last-child {
    margin-block-end: 0;
  }
  .callout-note,
  .callout-info {
    border-left-color: var(--bs-info, #0dcaf0);
  }
  .callout-note .callout-indicator,
  .callout-info .callout-indicator {
    color: var(--bs-info, #0dcaf0);
  }
  .callout-tip {
    border-left-color: var(--bs-success, #198754);
  }
  .callout-tip .callout-indicator {
    color: var(--bs-success, #198754);
  }
  .callout-important {
    border-left-color: var(--bs-primary, #0d6efd);
  }
  .callout-important .callout-indicator {
    color: var(--bs-primary, #0d6efd);
  }
  .callout-warning {
    border-left-color: var(--bs-warning, #ffc107);
  }
  .callout-warning .callout-indicator {
    color: var(--bs-warning, #ffc107);
  }
  .callout-danger,
  .callout-caution {
    border-left-color: var(--bs-danger, #dc3545);
  }
  .callout-danger .callout-indicator,
  .callout-caution .callout-indicator {
    color: var(--bs-danger, #dc3545);
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

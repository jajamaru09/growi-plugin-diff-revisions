import { forwardRef, useMemo } from 'react';
import { computeMarkdownDiff, type SideBySideLine } from '../markdownDiffEngine.ts';

interface Props {
  leftBody: string;
  rightBody: string;
}

const ROW_COLORS: Record<SideBySideLine['type'], { leftBg: string; rightBg: string; leftNumBg: string; rightNumBg: string }> = {
  equal: {
    leftBg: 'transparent',
    rightBg: 'transparent',
    leftNumBg: 'transparent',
    rightNumBg: 'transparent',
  },
  removed: {
    leftBg: '#ffebe9',
    rightBg: 'transparent',
    leftNumBg: '#ffd7d5',
    rightNumBg: 'transparent',
  },
  added: {
    leftBg: 'transparent',
    rightBg: '#e6ffec',
    leftNumBg: 'transparent',
    rightNumBg: '#ccffd8',
  },
  modified: {
    leftBg: '#ffebe9',
    rightBg: '#e6ffec',
    leftNumBg: '#ffd7d5',
    rightNumBg: '#ccffd8',
  },
};

export const MarkdownDiffPanel = forwardRef<HTMLDivElement, Props>(
  function MarkdownDiffPanel({ leftBody, rightBody }, ref) {
    const lines = useMemo(
      () => computeMarkdownDiff(leftBody, rightBody),
      [leftBody, rightBody],
    );

    return (
      <div
        ref={ref}
        style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid var(--bs-border-color, #dee2e6)',
          borderRadius: '4px',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '13px',
            lineHeight: '1.5',
          }}
        >
          <colgroup>
            <col style={{ width: '40px' }} />
            <col style={{ width: 'calc(50% - 40px)' }} />
            <col style={{ width: '40px' }} />
            <col style={{ width: 'calc(50% - 40px)' }} />
          </colgroup>
          <tbody>
            {lines.map((line, i) => {
              const colors = ROW_COLORS[line.type];
              return (
                <tr key={i}>
                  {/* Left line number */}
                  <td
                    style={{
                      backgroundColor: colors.leftNumBg,
                      color: 'var(--bs-secondary-color, #6c757d)',
                      textAlign: 'right',
                      padding: '0 8px',
                      userSelect: 'none',
                      verticalAlign: 'top',
                      borderRight: '1px solid var(--bs-border-color, #dee2e6)',
                    }}
                  >
                    {line.leftLineNo ?? ''}
                  </td>
                  {/* Left text */}
                  <td
                    style={{
                      backgroundColor: colors.leftBg,
                      padding: '0 8px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      verticalAlign: 'top',
                      borderRight: '1px solid var(--bs-border-color, #dee2e6)',
                    }}
                  >
                    {line.leftText}
                  </td>
                  {/* Right line number */}
                  <td
                    style={{
                      backgroundColor: colors.rightNumBg,
                      color: 'var(--bs-secondary-color, #6c757d)',
                      textAlign: 'right',
                      padding: '0 8px',
                      userSelect: 'none',
                      verticalAlign: 'top',
                      borderRight: '1px solid var(--bs-border-color, #dee2e6)',
                    }}
                  >
                    {line.rightLineNo ?? ''}
                  </td>
                  {/* Right text */}
                  <td
                    style={{
                      backgroundColor: colors.rightBg,
                      padding: '0 8px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      verticalAlign: 'top',
                    }}
                  >
                    {line.rightText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
);

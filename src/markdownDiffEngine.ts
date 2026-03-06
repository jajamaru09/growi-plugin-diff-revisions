import { diffArrays } from 'diff';

export interface SideBySideLine {
  leftLineNo: number | null;
  leftText: string;
  rightLineNo: number | null;
  rightText: string;
  type: 'equal' | 'removed' | 'added' | 'modified';
}

export function computeMarkdownDiff(leftBody: string, rightBody: string): SideBySideLine[] {
  const leftLines = leftBody.split('\n');
  const rightLines = rightBody.split('\n');
  const changes = diffArrays(leftLines, rightLines);

  const result: SideBySideLine[] = [];
  let leftLineNo = 1;
  let rightLineNo = 1;

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];

    if (!change.added && !change.removed) {
      // Equal lines
      for (const line of change.value) {
        result.push({
          leftLineNo: leftLineNo++,
          leftText: line,
          rightLineNo: rightLineNo++,
          rightText: line,
          type: 'equal',
        });
      }
    } else if (change.removed) {
      // Check if next chunk is added (= modified pair)
      const next = changes[i + 1];
      if (next && next.added) {
        // Modified: pair removed and added lines
        const removedLines = change.value;
        const addedLines = next.value;
        const maxLen = Math.max(removedLines.length, addedLines.length);

        for (let j = 0; j < maxLen; j++) {
          const hasLeft = j < removedLines.length;
          const hasRight = j < addedLines.length;
          result.push({
            leftLineNo: hasLeft ? leftLineNo++ : null,
            leftText: hasLeft ? removedLines[j] : '',
            rightLineNo: hasRight ? rightLineNo++ : null,
            rightText: hasRight ? addedLines[j] : '',
            type: 'modified',
          });
        }

        i++; // Skip the next (added) chunk
      } else {
        // Pure removal
        for (const line of change.value) {
          result.push({
            leftLineNo: leftLineNo++,
            leftText: line,
            rightLineNo: null,
            rightText: '',
            type: 'removed',
          });
        }
      }
    } else if (change.added) {
      // Pure addition (not preceded by removal)
      for (const line of change.value) {
        result.push({
          leftLineNo: null,
          leftText: '',
          rightLineNo: rightLineNo++,
          rightText: line,
          type: 'added',
        });
      }
    }
  }

  return result;
}

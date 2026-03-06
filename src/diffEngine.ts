import { computeBlockDiff } from './blockDiffEngine.ts';

export interface DiffResult {
  left: string;
  right: string;
}

export function computeDiff(leftHtml: string, rightHtml: string): DiffResult {
  return computeBlockDiff(leftHtml, rightHtml);
}

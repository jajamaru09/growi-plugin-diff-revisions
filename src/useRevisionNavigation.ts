import { useCallback, useEffect, useState } from 'react';
import type { RevisionItem } from './types.ts';

export interface UseRevisionNavigationResult {
  leftId: string;
  rightId: string;
  setLeftId: React.Dispatch<React.SetStateAction<string>>;
  setRightId: React.Dispatch<React.SetStateAction<string>>;
  leftIdx: number;
  rightIdx: number;
  shiftRevision: (currentId: string, delta: number) => string;
  shiftBoth: (delta: number) => void;
  canLeftPrev: boolean;
  canLeftNext: boolean;
  canRightPrev: boolean;
  canRightNext: boolean;
  canBothPrev: boolean;
  canBothNext: boolean;
}

export function useRevisionNavigation(revisions: RevisionItem[]): UseRevisionNavigationResult {
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');

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

  const getIndex = useCallback(
    (id: string) => revisions.findIndex((r) => r.revisionId === id),
    [revisions],
  );

  const shiftRevision = useCallback(
    (currentId: string, delta: number): string => {
      const idx = getIndex(currentId);
      if (idx < 0) return currentId;
      const next = idx + delta;
      if (next < 0 || next >= revisions.length) return currentId;
      return revisions[next].revisionId;
    },
    [getIndex, revisions],
  );

  const shiftBoth = useCallback(
    (delta: number) => {
      setLeftId((prev) => shiftRevision(prev, delta));
      setRightId((prev) => shiftRevision(prev, delta));
    },
    [shiftRevision],
  );

  const leftIdx = getIndex(leftId);
  const rightIdx = getIndex(rightId);
  const canLeftPrev = leftIdx > 0;
  const canLeftNext = leftIdx >= 0 && leftIdx < revisions.length - 1;
  const canRightPrev = rightIdx > 0;
  const canRightNext = rightIdx >= 0 && rightIdx < revisions.length - 1;
  const canBothPrev = canLeftPrev && canRightPrev;
  const canBothNext = canLeftNext && canRightNext;

  return {
    leftId,
    rightId,
    setLeftId,
    setRightId,
    leftIdx,
    rightIdx,
    shiftRevision,
    shiftBoth,
    canLeftPrev,
    canLeftNext,
    canRightPrev,
    canRightNext,
    canBothPrev,
    canBothNext,
  };
}

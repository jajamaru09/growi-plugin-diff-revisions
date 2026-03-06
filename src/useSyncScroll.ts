import { useEffect, useRef } from 'react';
import { extractBlockElements, buildAnchorPairs, computeTargetScroll } from './syncScrollUtils.ts';

interface UseSyncScrollOptions {
  leftEl: HTMLDivElement | null;
  rightEl: HTMLDivElement | null;
  enabled: boolean;
  leftHtml: string;
  rightHtml: string;
}

export function useSyncScroll({ leftEl, rightEl, enabled, leftHtml, rightHtml }: UseSyncScrollOptions): void {
  const anchorPairsRef = useRef<[HTMLElement, HTMLElement][]>([]);
  const isScrollingRef = useRef(false);
  const rafIdRef = useRef(0);

  // Rebuild anchor pairs when HTML changes or elements become available
  useEffect(() => {
    if (!leftEl || !rightEl || !enabled) {
      anchorPairsRef.current = [];
      return;
    }

    // Defer to next frame so DOM is rendered
    const id = requestAnimationFrame(() => {
      const leftBlocks = extractBlockElements(leftEl);
      const rightBlocks = extractBlockElements(rightEl);
      anchorPairsRef.current = buildAnchorPairs(leftBlocks, rightBlocks);
    });

    return () => cancelAnimationFrame(id);
  }, [leftEl, rightEl, enabled, leftHtml, rightHtml]);

  // Attach scroll listeners
  useEffect(() => {
    if (!leftEl || !rightEl || !enabled) return;

    const handleScroll = (source: HTMLElement, target: HTMLElement, side: 'left' | 'right') => {
      if (isScrollingRef.current) return;

      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        isScrollingRef.current = true;
        const targetScrollTop = computeTargetScroll(source, target, anchorPairsRef.current, side);
        target.scrollTop = targetScrollTop;

        // Release lock on next frame to prevent infinite loop
        requestAnimationFrame(() => {
          isScrollingRef.current = false;
        });
      });
    };

    const onLeftScroll = () => handleScroll(leftEl, rightEl, 'left');
    const onRightScroll = () => handleScroll(rightEl, leftEl, 'right');

    leftEl.addEventListener('scroll', onLeftScroll, { passive: true });
    rightEl.addEventListener('scroll', onRightScroll, { passive: true });

    return () => {
      leftEl.removeEventListener('scroll', onLeftScroll);
      rightEl.removeEventListener('scroll', onRightScroll);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [leftEl, rightEl, enabled, leftHtml, rightHtml]);
}

import { useRef, useCallback } from "react";

interface TapOrHoldOptions {
  /** 길게 누름 판정 시간 (ms) */
  holdDuration?: number;
  /** 탭(짧게 누름) 콜백 */
  onTap?: () => void;
  /** 길게 누름 콜백 */
  onHold?: () => void;
}

/**
 * 터치/마우스 모두에서 탭과 길게 누르기를 구분하는 훅
 * - holdDuration ms 이상 누르고 있으면 onHold 호출
 * - 그보다 빨리 떼면 onTap 호출
 */
export function useTapOrHold({
  holdDuration = 500,
  onTap,
  onHold,
}: TapOrHoldOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (clientX: number, clientY: number) => {
      triggeredRef.current = false;
      startPosRef.current = { x: clientX, y: clientY };
      clear();
      timerRef.current = setTimeout(() => {
        triggeredRef.current = true;
        onHold?.();
      }, holdDuration);
    },
    [holdDuration, onHold, clear]
  );

  const move = useCallback(
    (clientX: number, clientY: number) => {
      if (!startPosRef.current) return;
      const dx = clientX - startPosRef.current.x;
      const dy = clientY - startPosRef.current.y;
      // 손가락/마우스가 너무 많이 움직이면 길게 누름 취소
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clear();
      }
    },
    [clear]
  );

  const end = useCallback(() => {
    clear();
    if (!triggeredRef.current) {
      onTap?.();
    }
    startPosRef.current = null;
  }, [clear, onTap]);

  return {
    onTouchStart: (e: React.TouchEvent) =>
      start(e.touches[0].clientX, e.touches[0].clientY),
    onTouchMove: (e: React.TouchEvent) =>
      move(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: () => end(),
    onMouseDown: (e: React.MouseEvent) => start(e.clientX, e.clientY),
    onMouseMove: (e: React.MouseEvent) => move(e.clientX, e.clientY),
    onMouseUp: () => end(),
    onMouseLeave: () => clear(),
  };
}

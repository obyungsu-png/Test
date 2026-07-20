import { useRef, useCallback } from "react";

interface TapOrHoldOptions {
  holdDuration?: number;
  onTap?: () => void;
  onHold?: () => void;
}

/**
 * 탭(짧게 누름)과 홀드(길게 누름)를 구분하는 훅
 * 터치/마우스 모두 지원
 */
export function useTapOrHold({ holdDuration = 450, onTap, onHold }: TapOrHoldOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const start = useCallback((cx: number, cy: number) => {
    triggeredRef.current = false;
    startPosRef.current = { x: cx, y: cy };
    clear();
    timerRef.current = setTimeout(() => { triggeredRef.current = true; onHold?.(); }, holdDuration);
  }, [holdDuration, onHold, clear]);

  const move = useCallback((cx: number, cy: number) => {
    if (!startPosRef.current) return;
    const dx = cx - startPosRef.current.x;
    const dy = cy - startPosRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) clear();
  }, [clear]);

  const end = useCallback(() => {
    clear();
    if (!triggeredRef.current) onTap?.();
    startPosRef.current = null;
  }, [clear, onTap]);

  return {
    onTouchStart: (e: React.TouchEvent) => start(e.touches[0].clientX, e.touches[0].clientY),
    onTouchMove: (e: React.TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: () => end(),
    onMouseDown: (e: React.MouseEvent) => start(e.clientX, e.clientY),
    onMouseMove: (e: React.MouseEvent) => move(e.clientX, e.clientY),
    onMouseUp: () => end(),
    onMouseLeave: () => clear(),
  };
}

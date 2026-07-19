import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Highlighter, Underline, BookMarked } from "lucide-react";
import { HIGHLIGHT_COLORS, UNDERLINE_COLORS } from "./ReadingReviewToolbar";

interface SelectionActionPopoverProps {
  /** 팝업 기준 X (선택 영역 중앙) */
  x: number;
  /** 팝업 기준 Y (선택 영역 상단) */
  y: number;
  onHighlight: (color: string) => void;
  onUnderline: (color: string) => void;
  onDictionary: () => void;
  onClose: () => void;
}

/**
 * 드래그 완료 후 선택 영역 위에 나타나는 액션 팝오버
 * - 하이라이트 3색 / 밑줄 3색 / 사전 버튼
 * - createPortal로 document.body에 렌더링 (z-index 충돌 방지)
 * - 화면 경계 자동 보정
 */
export function SelectionActionPopover({
  x, y, onHighlight, onUnderline, onDictionary, onClose,
}: SelectionActionPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  // 위치 보정 (화면 경계)
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let newX = x - rect.width / 2;
    let newY = y - rect.height - 10;
    if (newX < 8) newX = 8;
    if (newX + rect.width > window.innerWidth - 8) {
      newX = window.innerWidth - rect.width - 8;
    }
    // 위 공간 부족 시 선택 영역 아래에 표시
    if (newY < 8) newY = y + 24;
    setPos({ x: newX, y: newY });
  }, [x, y]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handle), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handle);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[90] flex items-center gap-1.5 bg-gray-900 dark:bg-gray-700 rounded-full px-2.5 py-1.5 shadow-2xl border border-gray-700"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* 하이라이트 3색 */}
      {HIGHLIGHT_COLORS.map(c => (
        <button
          key={`h-${c.value}`}
          onClick={() => onHighlight(c.value)}
          className="w-6 h-6 rounded-full border border-white/40 hover:scale-110 transition-transform flex items-center justify-center"
          style={{ backgroundColor: c.value }}
          title={`하이라이트 ${c.name}`}
        >
          <Highlighter className="w-3 h-3 text-gray-700" />
        </button>
      ))}
      <div className="w-px h-5 bg-white/20 mx-0.5" />
      {/* 밑줄 3색 */}
      {UNDERLINE_COLORS.map(c => (
        <button
          key={`u-${c.value}`}
          onClick={() => onUnderline(c.value)}
          className="w-6 h-6 rounded-full hover:scale-110 transition-transform flex items-center justify-center border border-white/40"
          style={{ backgroundColor: c.value }}
          title={`밑줄 ${c.name}`}
        >
          <span className="text-white text-[10px] font-bold underline">U</span>
        </button>
      ))}
      <div className="w-px h-5 bg-white/20 mx-0.5" />
      {/* 사전 */}
      <button
        onClick={onDictionary}
        className="w-7 h-7 rounded-full bg-white hover:bg-cyan-100 hover:scale-110 transition-transform flex items-center justify-center"
        title="단어 뜻 보기"
      >
        <BookMarked className="w-4 h-4 text-cyan-700" />
      </button>
    </div>,
    document.body
  );
}

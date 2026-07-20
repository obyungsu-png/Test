import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Highlighter, Underline, BookOpen } from "lucide-react";
import { HIGHLIGHT_COLORS, UNDERLINE_COLORS } from "./ReadingReviewToolbar";

interface SelectionActionPopoverProps {
  x: number;
  y: number;
  onHighlight: (color: string) => void;
  onUnderline: (color: string) => void;
  onDictionary: () => void;
  onClose: () => void;
}

/**
 * 드래그 완료 후 선택 영역 위에 나타나는 깔끔한 액션 팝오버
 * - 하이라이트 3색 / 밑줄 3색 / 사전 버튼
 * - 흰색 배경, 둥근 모서리, 그림자
 */
export function SelectionActionPopover({
  x, y, onHighlight, onUnderline, onDictionary, onClose,
}: SelectionActionPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let newX = x - rect.width / 2;
    let newY = y - rect.height - 12;
    if (newX < 8) newX = 8;
    if (newX + rect.width > window.innerWidth - 8) {
      newX = window.innerWidth - rect.width - 8;
    }
    if (newY < 8) newY = y + 30;
    setPos({ x: newX, y: newY });
  }, [x, y]);

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
      className="fixed z-[90] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="flex items-center gap-1 p-1.5">
        {/* 하이라이트 섹션 */}
        <div className="flex items-center gap-1 px-1">
          {HIGHLIGHT_COLORS.map(c => (
            <button
              key={`h-${c.value}`}
              onClick={() => onHighlight(c.value)}
              className="w-8 h-8 rounded-lg hover:scale-110 transition-all flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-600"
              style={{ backgroundColor: c.value }}
              title={`하이라이트 ${c.name}`}
            >
              <Highlighter className="w-4 h-4 text-gray-700" />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-0.5" />

        {/* 밑줄 섹션 */}
        <div className="flex items-center gap-1 px-1">
          {UNDERLINE_COLORS.map(c => (
            <button
              key={`u-${c.value}`}
              onClick={() => onUnderline(c.value)}
              className="w-8 h-8 rounded-lg hover:scale-110 transition-all flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-600"
              style={{ backgroundColor: c.value }}
              title={`밑줄 ${c.name}`}
            >
              <Underline className="w-4 h-4 text-white" />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-0.5" />

        {/* 사전 버튼 */}
        <button
          onClick={onDictionary}
          className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:scale-110 transition-all flex items-center justify-center"
          title="단어 뜻 보기"
        >
          <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </button>
      </div>
    </div>,
    document.body
  );
}

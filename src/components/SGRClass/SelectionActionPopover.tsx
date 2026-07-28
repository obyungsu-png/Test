import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Highlighter, Underline, BookOpen, Bot } from "lucide-react";
import { HIGHLIGHT_COLORS, UNDERLINE_COLORS } from "./ReadingReviewToolbar";
import { useTapOrHold } from "./useTapOrHold";

interface SelectionActionPopoverProps {
  x: number;
  y: number;
  selectedText: string;
  onHighlight: (color: string) => void;
  onUnderline: (color: string) => void;
  onDictionary: () => void;
  onAiTutor?: (action: "explain" | "translate" | "analyze" | "rewrite", text: string) => void;
  onClose: () => void;
}

type AiAction = "explain" | "translate" | "analyze" | "rewrite";

const AI_ACTIONS: { key: AiAction; label: string }[] = [
  { key: "explain", label: "Explain" },
  { key: "translate", label: "Translate" },
  { key: "analyze", label: "Analyze" },
  { key: "rewrite", label: "Rewrite" },
];

/**
 * 드래그 완료 후 선택 영역 위에 나타나는 액션 팝오버
 * 트렌디한 캡슐 디자인: 아이콘만 보이고, AI 버튼은 별도 스타일
 */
export function SelectionActionPopover({
  x, y, selectedText, onHighlight, onUnderline, onDictionary, onAiTutor, onClose,
}: SelectionActionPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [highlightPicker, setHighlightPicker] = useState(false);
  const [underlinePicker, setUnderlinePicker] = useState(false);
  const [aiSubOpen, setAiSubOpen] = useState(false);
  const [currentHighlightColor, setCurrentHighlightColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [currentUnderlineColor, setCurrentUnderlineColor] = useState(UNDERLINE_COLORS[0].value);

  // 위치 보정
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let nx = x - rect.width / 2;
    let ny = y - rect.height - 14;
    if (nx < 8) nx = 8;
    if (nx + rect.width > window.innerWidth - 8) nx = window.innerWidth - rect.width - 8;
    if (ny < 8) ny = y + 28;
    setPos({ x: nx, y: ny });
  }, [x, y, highlightPicker, underlinePicker, aiSubOpen]);

  // 바깥 클릭 닫기
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handle), 50);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handle); };
  }, [onClose]);

  // 하이라이트 탭/홀드
  const hTapHold = useTapOrHold({
    onTap: () => { onHighlight(currentHighlightColor); },
    onHold: () => { setHighlightPicker(v => !v); setUnderlinePicker(false); setAiSubOpen(false); },
  });

  // 밑줄 탭/홀드
  const uTapHold = useTapOrHold({
    onTap: () => { onUnderline(currentUnderlineColor); },
    onHold: () => { setUnderlinePicker(v => !v); setHighlightPicker(false); setAiSubOpen(false); },
  });

  const iconBtn = "flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-150";

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[90] flex items-center gap-0.5 px-1.5 py-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* 하이라이트 */}
      <div className="relative">
        <button
          {...hTapHold}
          className={iconBtn}
          title="하이라이트"
        >
          <Highlighter className="w-4 h-4" />
        </button>
        {highlightPicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-1.5">
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={`h-${c.value}`}
                onClick={() => { onHighlight(c.value); setCurrentHighlightColor(c.value); setHighlightPicker(false); }}
                className={`w-6 h-6 rounded-full hover:scale-110 transition-transform ${c.value === currentHighlightColor ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* 밑줄 */}
      <div className="relative">
        <button
          {...uTapHold}
          className={iconBtn}
          title="밑줄"
        >
          <Underline className="w-4 h-4" />
        </button>
        {underlinePicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-1.5">
            {UNDERLINE_COLORS.map(c => (
              <button
                key={`u-${c.value}`}
                onClick={() => { onUnderline(c.value); setCurrentUnderlineColor(c.value); setUnderlinePicker(false); }}
                className={`w-6 h-6 rounded-full hover:scale-110 transition-transform ${c.value === currentUnderlineColor ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* 사전 */}
      <button
        onClick={() => { onDictionary(); }}
        className={iconBtn}
        title="단어 뜻 보기"
      >
        <BookOpen className="w-4 h-4" />
      </button>

      {/* AI 튜터 */}
      <button
        onClick={() => { setAiSubOpen(v => !v); setHighlightPicker(false); setUnderlinePicker(false); }}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 ${
          aiSubOpen
            ? "bg-violet-600 text-white"
            : "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50"
        }`}
        title="AI 튜터"
      >
        <Bot className="w-4 h-4" />
      </button>

      {/* AI 튜터 하위 탭 */}
      {aiSubOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-1">
          {AI_ACTIONS.map(act => (
            <button
              key={act.key}
              onClick={() => {
                onAiTutor?.(act.key, selectedText);
                setAiSubOpen(false);
                onClose();
              }}
              className="px-2.5 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              {act.label}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

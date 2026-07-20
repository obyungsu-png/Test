import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Highlighter, Underline, BookOpen, Sparkles } from "lucide-react";
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
 * [하이라이트] [밑줄] [사전] [AI튜터]
 *  - 하이라이트/밑줄: 한 가지 색, 길게 누르면 3색 피커
 *  - 사전: 단어 뜻 팝업
 *  - AI튜터: 4개 하위 탭 (explain/translate/analyze/rewrite)
 */
export function SelectionActionPopover({
  x, y, selectedText, onHighlight, onUnderline, onDictionary, onAiTutor, onClose,
}: SelectionActionPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [highlightPicker, setHighlightPicker] = useState(false);
  const [underlinePicker, setUnderlinePicker] = useState(false);
  const [aiSubOpen, setAiSubOpen] = useState(false);
  const [currentHighlightColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [currentUnderlineColor] = useState(UNDERLINE_COLORS[0].value);

  // 위치 보정
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let nx = x - rect.width / 2;
    let ny = y - rect.height - 12;
    if (nx < 8) nx = 8;
    if (nx + rect.width > window.innerWidth - 8) nx = window.innerWidth - rect.width - 8;
    if (ny < 8) ny = y + 30;
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

  const btnBase = "relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 shrink-0";

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[90] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* 메인 툴바 */}
      <div className="flex items-center gap-0.5 p-1.5">
        {/* 하이라이트 */}
        <div className="relative">
          <button
            {...hTapHold}
            className={`${btnBase} hover:scale-105`}
            style={{ backgroundColor: currentHighlightColor }}
            title="하이라이트 (길게 누르면 색상 선택)"
          >
            <Highlighter className="w-4 h-4 text-gray-700" />
          </button>
          {highlightPicker && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-1.5 z-10">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={`h-${c.value}`}
                  onClick={() => { onHighlight(c.value); setHighlightPicker(false); }}
                  className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-500 hover:scale-110 transition-transform"
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
            className={`${btnBase} hover:scale-105`}
            style={{ backgroundColor: currentUnderlineColor }}
            title="밑줄 (길게 누르면 색상 선택)"
          >
            <Underline className="w-4 h-4 text-white" />
          </button>
          {underlinePicker && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-1.5 z-10">
              {UNDERLINE_COLORS.map(c => (
                <button
                  key={`u-${c.value}`}
                  onClick={() => { onUnderline(c.value); setUnderlinePicker(false); }}
                  className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-500 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-0.5" />

        {/* 사전 */}
        <button
          onClick={() => { onDictionary(); }}
          className={`${btnBase} bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:scale-105`}
          title="단어 뜻 보기"
        >
          <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </button>

        {/* AI 튜터 */}
        <button
          onClick={() => { setAiSubOpen(v => !v); setHighlightPicker(false); setUnderlinePicker(false); }}
          className={`${btnBase} ${aiSubOpen ? "bg-violet-600 text-white" : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50"} hover:scale-105`}
          title="AI 튜터"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* AI 튜터 하위 탭 */}
      {aiSubOpen && (
        <div className="flex items-center gap-1 px-2 pb-1.5 pt-0.5 border-t border-gray-100 dark:border-gray-700">
          {AI_ACTIONS.map(act => (
            <button
              key={act.key}
              onClick={() => {
                onAiTutor?.(act.key, selectedText);
                setAiSubOpen(false);
                onClose();
              }}
              className="px-2.5 py-1 rounded-md text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
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

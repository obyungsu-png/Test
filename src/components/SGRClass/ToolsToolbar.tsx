import { useState, useRef, useEffect } from "react";
import { Highlighter, Underline, Eraser, BookOpen, Sparkles } from "lucide-react";
import { HIGHLIGHT_COLORS, UNDERLINE_COLORS } from "./ReadingReviewToolbar";
import { useTapOrHold } from "./useTapOrHold";

interface ToolsToolbarProps {
  /** 테마 컬러 (SGR Class=cyan, Writing=indigo, Voca=rose) */
  themeColor?: string;
  /** 현재 활성 도구 */
  activeTool: "highlight" | "underline" | null;
  activeColor?: string;
  onToolChange: (tool: "highlight" | "underline" | null, color?: string) => void;
  onClearAll: () => void;
  /** 사전 모드 활성화 */
  onDictionary: () => void;
  /** AI 튜터 열기 */
  onAiTutor: () => void;
  /** Tools 활성화 여부 (드래그 선택 감지 on/off) */
  toolsOpen: boolean;
  onToolsToggle: (open: boolean) => void;
}

/**
 * SGR Class / Writing / Voca 공용 툴바
 *
 * [하이라이트] [밑줄] [지우개] [사전] [AI튜터]
 *  - 하이라이트/밑줄: 평소 한 가지 색, 길게 누르면 3색 팝업
 *  - 사전: EN/KO 동시 표시
 *  - AI튜터: 마지막 아이콘, 클릭 시 위젯 열림
 */
export function ToolsToolbar({
  themeColor = "#0e7490",
  activeTool,
  activeColor,
  onToolChange,
  onClearAll,
  onDictionary,
  onAiTutor,
  toolsOpen,
  onToolsToggle,
}: ToolsToolbarProps) {
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [underlinePickerOpen, setUnderlinePickerOpen] = useState(false);
  const [dictActive, setDictActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 색상 피커 닫기
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setHighlightPickerOpen(false);
        setUnderlinePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // 현재 선택된 하이라이트 색상 (기본값: 노랑)
  const currentHighlightColor =
    activeTool === "highlight" && activeColor
      ? activeColor
      : HIGHLIGHT_COLORS[0].value;

  // 현재 선택된 밑줄 색상 (기본값: 파랑)
  const currentUnderlineColor =
    activeTool === "underline" && activeColor
      ? activeColor
      : UNDERLINE_COLORS[0].value;

  // 하이라이트 탭/홀드
  const highlightTapHold = useTapOrHold({
    onTap: () => {
      // 탭: 현재 색상으로 토글
      const isActive = activeTool === "highlight";
      onToolChange(isActive ? null : "highlight", currentHighlightColor);
      setUnderlinePickerOpen(false);
    },
    onHold: () => {
      // 길게 누름: 3색 피커 표시
      setHighlightPickerOpen(v => !v);
      setUnderlinePickerOpen(false);
    },
  });

  // 밑줄 탭/홀드
  const underlineTapHold = useTapOrHold({
    onTap: () => {
      const isActive = activeTool === "underline";
      onToolChange(isActive ? null : "underline", currentUnderlineColor);
      setHighlightPickerOpen(false);
    },
    onHold: () => {
      setUnderlinePickerOpen(v => !v);
      setHighlightPickerOpen(false);
    },
  });

  const handleDictionary = () => {
    setDictActive(v => !v);
    onDictionary();
  };

  const handleAiTutor = () => {
    onAiTutor();
  };

  const btnBase =
    "relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 shrink-0";

  return (
    <div ref={containerRef} className="flex items-center gap-1">
      {/* 하이라이트 버튼 */}
      <div className="relative">
        <button
          {...highlightTapHold}
          className={`${btnBase} ${
            activeTool === "highlight"
              ? "ring-2 ring-offset-1"
              : "hover:scale-105"
          }`}
          style={{
            backgroundColor:
              activeTool === "highlight"
                ? currentHighlightColor
                : "rgba(0,0,0,0.05)",
            ringColor: themeColor,
          }}
          title="하이라이트 (길게 누르면 색상 선택)"
          aria-label="하이라이트"
        >
          <Highlighter
            className="w-4 h-4"
            style={{
              color:
                activeTool === "highlight"
                  ? "#333"
                  : "#666"
            }}
          />
        </button>

        {/* 3색 피커 (아래에 표시) */}
        {highlightPickerOpen && (
          <ColorPickerPopover
            colors={HIGHLIGHT_COLORS}
            currentColor={currentHighlightColor}
            onSelect={(color) => {
              onToolChange("highlight", color);
              setHighlightPickerOpen(false);
            }}
          />
        )}
      </div>

      {/* 밑줄 버튼 */}
      <div className="relative">
        <button
          {...underlineTapHold}
          className={`${btnBase} ${
            activeTool === "underline"
              ? "ring-2 ring-offset-1"
              : "hover:scale-105"
          }`}
          style={{
            backgroundColor:
              activeTool === "underline"
                ? currentUnderlineColor
                : "rgba(0,0,0,0.05)",
            ringColor: themeColor,
          }}
          title="밑줄 (길게 누르면 색상 선택)"
          aria-label="밑줄"
        >
          <Underline
            className="w-4 h-4"
            style={{
              color:
                activeTool === "underline"
                  ? "#fff"
                  : "#666"
            }}
          />
        </button>

        {/* 3색 피커 */}
        {underlinePickerOpen && (
          <ColorPickerPopover
            colors={UNDERLINE_COLORS}
            currentColor={currentUnderlineColor}
            onSelect={(color) => {
              onToolChange("underline", color);
              setUnderlinePickerOpen(false);
            }}
          />
        )}
      </div>

      {/* 지우개 */}
      <button
        onClick={onClearAll}
        className={`${btnBase} hover:scale-105 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600`}
        title="모든 표시 지우기"
        aria-label="지우개"
      >
        <Eraser className="w-4 h-4" />
      </button>

      {/* 사전 (EN/KO 동시 표시) */}
      <button
        onClick={handleDictionary}
        className={`${btnBase} flex-col gap-0.5 hover:scale-105 ${
          dictActive
            ? "text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        }`}
        style={dictActive ? { backgroundColor: themeColor } : undefined}
        title="사전 (EN/KO)"
        aria-label="사전"
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-[8px] font-bold leading-none flex gap-0.5">
          <span>EN</span>
          <span>/</span>
          <span>KO</span>
        </span>
      </button>

      {/* AI 튜터 (마지막 아이콘) */}
      <button
        onClick={handleAiTutor}
        className={`${btnBase} hover:scale-105 text-white shadow-md`}
        style={{ backgroundColor: themeColor }}
        title="AI 튜터"
        aria-label="AI 튜터"
      >
        <Sparkles className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── 색상 피커 팝오버 (버튼 아래에 표시) ─────────────────────
interface ColorPickerPopoverProps {
  colors: { name: string; value: string }[];
  currentColor: string;
  onSelect: (color: string) => void;
}

function ColorPickerPopover({ colors, currentColor, onSelect }: ColorPickerPopoverProps) {
  return (
    <div
      className="absolute z-[100] flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-xl px-2.5 py-2 shadow-2xl border border-gray-200 dark:border-gray-600"
      style={{
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginTop: "6px",
      }}
    >
      {colors.map(c => {
        const isSelected = c.value === currentColor;
        return (
          <button
            key={c.value}
            onClick={() => onSelect(c.value)}
            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
              isSelected
                ? "border-gray-800 dark:border-gray-100 scale-110"
                : "border-gray-300 dark:border-gray-500"
            }`}
            style={{ backgroundColor: c.value }}
            title={c.name}
            aria-label={c.name}
          />
        );
      })}
    </div>
  );
}

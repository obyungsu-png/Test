import { useState, useRef, useEffect, useCallback } from "react";
import { SelectionActionPopover } from "./SelectionActionPopover";

/** 최소 선택 길이 — 이보다 짧으면 무시 */
const MIN_SELECTION_LENGTH = 2;

interface PopoverState {
  x: number;
  y: number;
  text: string;
}

interface ReadingReviewPassageProps {
  children: React.ReactNode;
  className?: string;
  /** false면 드래그 팝오버 비활성화 */
  toolsOpen?: boolean;
  /** 사전 버튼 클릭 시 콜백 — 부모에서 WordPopup 표시 */
  onDictionary: (data: { word: string; context: string; x: number; y: number }) => void;
  /** AI 튜터 액션 콜백 (explain/translate/analyze/rewrite + 선택된 텍스트) */
  onAiTutor?: (action: "explain" | "translate" | "analyze" | "rewrite", text: string) => void;
  /** 이 값이 바뀌면 모든 하이라이트/밑줄 제거 */
  clearTrigger?: number;
}

/**
 * SGR Class 지문 래퍼 — 드래그 선택 시 SelectionActionPopover 표시
 * 하이라이트/밑줄은 DOM(mark/u)에 직접 적용 (인메모리)
 */
export function ReadingReviewPassage({
  children,
  className = "",
  toolsOpen = true,
  onDictionary,
  onAiTutor,
  clearTrigger = 0,
}: ReadingReviewPassageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  // 지우기 트리거 — 모든 mark/u 제거
  useEffect(() => {
    if (clearTrigger === 0) return;
    containerRef.current?.querySelectorAll("mark, u").forEach(el => {
      const parent = el.parentNode;
      if (!parent) return;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
      parent.normalize();
    });
  }, [clearTrigger]);

  // 드래그 완료 처리
  const handleSelectionEnd = useCallback(() => {
    if (!toolsOpen) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const text = sel.toString().trim();
    if (text.length < MIN_SELECTION_LENGTH) return;

    const range = sel.getRangeAt(0);
    if (!containerRef.current?.contains(range.commonAncestorContainer)) return;

    const rect = range.getBoundingClientRect();
    savedRange.current = range.cloneRange();
    setPopover({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text,
    });
  }, [toolsOpen]);

  // 하이라이트/밑줄 적용
  const applyMark = useCallback((type: "h" | "u", color: string) => {
    const range = savedRange.current;
    if (!range) return;

    const mark = document.createElement(type === "h" ? "mark" : "u");
    if (type === "h") {
      mark.style.backgroundColor = color;
      mark.style.textDecoration = "none";
      mark.style.borderRadius = "2px";
      mark.style.padding = "0 1px";
    } else {
      mark.style.backgroundColor = "transparent";
      mark.style.textDecoration = "underline";
      mark.style.textDecorationColor = color;
      mark.style.textDecorationThickness = "2px";
    }

    try {
      range.surroundContents(mark);
    } catch {
      const contents = range.extractContents();
      mark.appendChild(contents);
      range.insertNode(mark);
    }
    window.getSelection()?.removeAllRanges();
    setPopover(null);
  }, []);

  // 사전 버튼
  const handleDictionary = useCallback(() => {
    if (!popover) return;
    const words = popover.text.split(/\s+/);
    const word = words.length === 1 ? popover.text : words[0];
    const context = containerRef.current?.textContent?.slice(0, 500) || "";
    onDictionary({ word, context, x: popover.x, y: popover.y + 20 });
    window.getSelection()?.removeAllRanges();
    setPopover(null);
  }, [popover, onDictionary]);

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseUp={handleSelectionEnd}
      onTouchEnd={handleSelectionEnd}
    >
      {children}
      {popover && (
        <SelectionActionPopover
          x={popover.x}
          y={popover.y}
          selectedText={popover.text}
          onHighlight={color => applyMark("h", color)}
          onUnderline={color => applyMark("u", color)}
          onDictionary={handleDictionary}
          onAiTutor={onAiTutor}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { getWordDefinitions, WordDefinition } from "./dictionaryApi";
import { translateWord, WordTranslation } from "./wordTranslate";

interface WordPopupProps {
  word: string;
  context?: string;
  language: "en" | "ko";
  x: number;
  y: number;
  onClose: () => void;
  onLanguageChange?: (lang: "en" | "ko") => void;
}

/**
 * 단어 뜻 팝업 — createPortal로 body에 렌더링
 * - EN: Free Dictionary API (영영 사전)
 * - KO: Claude API 프록시 (한국어 번역)
 * - API 호출은 유저가 [검색] 버튼을 누를 때만 수행 (자동 호출 X)
 * - 화면 경계 + AI 튜터 FAB 영역 회피하여 위치 자동 조정
 */
export function WordPopup({ word, context, language, x, y, onClose, onLanguageChange }: WordPopupProps) {
  const [loading, setLoading] = useState(false);
  const [definitions, setDefinitions] = useState<WordDefinition[]>([]);
  const [translation, setTranslation] = useState<WordTranslation | null>(null);
  const [error, setError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });

  // API 호출 — 유저가 [검색] 버튼 클릭 시에만 실행
  const fetchWordData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(false);
    setDefinitions([]);
    setTranslation(null);

    try {
      if (language === "en") {
        const defs = await getWordDefinitions(word);
        if (defs.length === 0) setError(true);
        else setDefinitions(defs);
      } else {
        const trans = await translateWord(word, context);
        if (!trans) setError(true);
        else setTranslation(trans);
      }
      setHasFetched(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [word, language, context, loading]);

  // 언어 토글 시 기존 결과 초기화 (재검색 필요 상태로)
  useEffect(() => {
    setHasFetched(false);
    setDefinitions([]);
    setTranslation(null);
    setError(false);
  }, [language]);

  // 팝업 위치 조정 (화면 경계 + AI 튜터 위젯 영역 회피)
  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      let newX = x;
      let newY = y;
      // 오른쪽 경계
      if (x + rect.width > window.innerWidth - 20) {
        newX = Math.max(20, window.innerWidth - rect.width - 20);
      }
      // 아래쪽 경계 — 위로 표시
      if (y + rect.height > window.innerHeight - 20) {
        newY = Math.max(20, y - rect.height - 40);
      }
      // AI 튜터 FAB 영역 (우측 하단) 회피
      const isMobile = window.innerWidth < 768;
      const fabSize = 56;
      const fabRight = 24;
      const fabBottom = isMobile ? 64 : 24;
      const fabLeft = window.innerWidth - fabRight - fabSize;
      const fabTop = window.innerHeight - fabBottom - fabSize;
      const pad = 8;
      const overlapX = newX + rect.width > fabLeft - pad;
      const overlapY = newY + rect.height > fabTop - pad;
      if (overlapX && overlapY) {
        newY = Math.max(20, fabTop - rect.height - pad);
      }
      setAdjustedPos({ x: Math.max(20, newX), y: Math.max(20, newY) });
    }
  }, [x, y, loading]);

  // 팝업 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[100] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-md"
      style={{ left: adjustedPos.x, top: adjustedPos.y, minWidth: 300 }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{word}</span>
          {language === "en" && definitions[0]?.phonetic && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{definitions[0].phonetic}</span>
          )}
          {language === "ko" && translation?.partOfSpeech && (
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">{translation.partOfSpeech}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* EN/KR 토글 */}
          {onLanguageChange && (
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
              <button
                onClick={() => onLanguageChange("en")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  language === "en" ? "bg-cyan-600 text-white" : "text-gray-500 dark:text-gray-400"
                }`}
              >EN</button>
              <button
                onClick={() => onLanguageChange("ko")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  language === "ko" ? "bg-cyan-600 text-white" : "text-gray-500 dark:text-gray-400"
                }`}
              >KR</button>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* 내용 */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-cyan-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">검색 중...</span>
        </div>
      ) : error ? (
        <div className="py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            이 단어의 정의를 찾을 수 없습니다. AI 튜터에게 물어보세요.
          </p>
          <button
            onClick={() => { setHasFetched(false); fetchWordData(); }}
            className="w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : hasFetched ? (
        language === "en" ? (
          <div className="space-y-2">
            {definitions.map((def, i) => (
              <div key={i} className="text-sm">
                <span className="text-xs text-gray-400 italic mr-1">{def.partOfSpeech}</span>
                <span className="text-gray-800 dark:text-gray-200">{def.definition}</span>
                {def.example && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">"{def.example}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">뜻:</span>
              <span className="text-base font-semibold text-cyan-700 dark:text-cyan-400">
                {translation?.koreanMeaning}
              </span>
            </div>
            {translation?.englishExplanation && (
              <p className="text-xs text-gray-600 dark:text-gray-300 italic">{translation.englishExplanation}</p>
            )}
          </div>
        )
      ) : (
        <button
          onClick={fetchWordData}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold transition-colors shadow-sm"
        >
          <Search className="w-4 h-4" />
          단어 검색
        </button>
      )}
    </div>,
    document.body
  );
}

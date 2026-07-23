import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { getWordDefinitions, WordDefinition } from "./dictionaryApi";
import {
  translateWord,
  translateWordToChinese,
  WordTranslation,
  ChineseWordTranslation,
} from "./wordTranslate";

export type WordPopupLang = "en" | "ko" | "ch";

interface WordPopupProps {
  word: string;
  context?: string;
  language: WordPopupLang;
  x: number;
  y: number;
  onClose: () => void;
  onLanguageChange?: (lang: WordPopupLang) => void;
  /** 지원 언어 목록. 기본 en/ko. SGR Class에서는 en/ko/ch. */
  availableLanguages?: WordPopupLang[];
}

/**
 * 단어 뜻 팝업 — createPortal로 body에 렌더링
 * - EN: Free Dictionary API (영영 사전)
 * - KO: Claude API (apiclaude.cc, 한국어 번역)
 * - CH: Claude API (apiclaude.cc, 중국어 번역 + 병음)
 * - 자동 호출 없음: 유저가 [검색] 버튼을 누를 때만 API 호출 (토큰 절약)
 * - 언어 변경 시 기존 결과 초기화, 재검색은 버튼 클릭 시에만
 */
export function WordPopup({
  word,
  context,
  language,
  x,
  y,
  onClose,
  onLanguageChange,
  availableLanguages,
}: WordPopupProps) {
  const [loading, setLoading] = useState(false);
  const [definitions, setDefinitions] = useState<WordDefinition[]>([]);
  const [translation, setTranslation] = useState<WordTranslation | null>(null);
  const [chinese, setChinese] = useState<ChineseWordTranslation | null>(null);
  const [error, setError] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });

  const langs: WordPopupLang[] =
    availableLanguages && availableLanguages.length > 0
      ? availableLanguages
      : ["en", "ko"];

  const fetchWordData = useCallback(async () => {
    setLoading(true);
    setError(false);
    setDefinitions([]);
    setTranslation(null);
    setChinese(null);

    try {
      if (language === "en") {
        const defs = await getWordDefinitions(word);
        if (defs.length === 0) setError(true);
        else setDefinitions(defs);
      } else if (language === "ko") {
        const trans = await translateWord(word, context);
        if (!trans) setError(true);
        else setTranslation(trans);
      } else {
        const trans = await translateWordToChinese(word, context);
        if (!trans) setError(true);
        else setChinese(trans);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [word, language, context]);

  // 자동 호출 제거: 유저가 [검색] 버튼을 누를 때만 API 호출 (토큰 절약)
  // 언어 변경 시 기존 결과만 초기화
  useEffect(() => {
    setDefinitions([]);
    setTranslation(null);
    setChinese(null);
    setError(false);
  }, [language]);

  // 팝업 위치 조정 (화면 경계 + AI 튜터 위젯 영역 회피)
  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      let newX = x;
      let newY = y;
      if (x + rect.width > window.innerWidth - 20) {
        newX = Math.max(20, window.innerWidth - rect.width - 20);
      }
      if (y + rect.height > window.innerHeight - 20) {
        newY = Math.max(20, y - rect.height - 40);
      }
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

  const langLabel = (l: WordPopupLang) =>
    l === "en" ? "EN" : l === "ko" ? "KO" : "CH";

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[100] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-md"
      style={{ left: adjustedPos.x, top: adjustedPos.y, minWidth: 300 }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
            {word}
          </span>
          {language === "en" && definitions[0]?.phonetic && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {definitions[0].phonetic}
            </span>
          )}
          {language === "ko" && translation?.partOfSpeech && (
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              {translation.partOfSpeech}
            </span>
          )}
          {language === "ch" && chinese?.pinyin && (
            <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
              [{chinese.pinyin}]
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 언어 토글 */}
          {onLanguageChange && langs.length > 1 && (
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
              {langs.map((l) => (
                <button
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    language === l
                      ? "bg-cyan-600 text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {langLabel(l)}
                </button>
              ))}
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
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            검색 중...
          </span>
        </div>
      ) : error ? (
        <div className="py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            이 단어의 정의를 찾을 수 없습니다. AI 튜터에게 물어보세요.
          </p>
          <button
            onClick={fetchWordData}
            className="w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : language === "en" ? (
        <div className="space-y-2">
          {definitions.map((def, i) => (
            <div key={i} className="text-sm">
              <span className="text-xs text-gray-400 italic mr-1">
                {def.partOfSpeech}
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {def.definition}
              </span>
              {def.example && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">
                  "{def.example}"
                </p>
              )}
            </div>
          ))}
        </div>
      ) : language === "ko" ? (
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">뜻:</span>
            <span className="text-base font-semibold text-cyan-700 dark:text-cyan-400">
              {translation?.koreanMeaning}
            </span>
          </div>
          {translation?.englishExplanation && (
            <p className="text-xs text-gray-600 dark:text-gray-300 italic">
              {translation.englishExplanation}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">意思:</span>
            <span className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
              {chinese?.chineseMeaning}
            </span>
            {chinese?.partOfSpeech && (
              <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                ({chinese.partOfSpeech})
              </span>
            )}
          </div>
          {chinese?.chineseExplanation && (
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {chinese.chineseExplanation}
            </p>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}

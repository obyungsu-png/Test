/**
 * AI로 문장별 주요구문/문법 포인트를 생성.
 * Claude API 프록시 사용 (wordTranslate와 동일 엔드포인트).
 * 결과는 localStorage에 lessonId 단위로 캐싱.
 */
import type { GrammarPoint } from "./types";

const isElectron =
  typeof window !== "undefined" &&
  (window as any).electronAPI?.isElectron === true;

const CLAUDE_ENDPOINT = isElectron
  ? "https://apiclaude.cc/v1/chat/completions"
  : "/api/claude/chat/completions";

const CLAUDE_MODEL = "claude-sonnet-5";

const CACHE_KEY = (lessonId: string) => `sgrClass_aiGrammar_${lessonId}`;

export interface AiGrammarCache {
  [sentenceId: string]: GrammarPoint[];
}

export function loadAiGrammarCache(lessonId: string): AiGrammarCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY(lessonId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAiGrammarCache(lessonId: string, cache: AiGrammarCache) {
  try {
    localStorage.setItem(CACHE_KEY(lessonId), JSON.stringify(cache));
  } catch {}
}

async function callClaude(prompt: string): Promise<string | null> {
  try {
    const res = await fetch(CLAUDE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.content?.[0]?.text ||
      null
    );
  } catch {
    return null;
  }
}

function extractJson(text: string): any | null {
  const m = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

/**
 * 한 문장에 대해 주요 구문/문법 포인트를 최대 3개 생성.
 */
export async function generateGrammarPointsForSentence(
  english: string
): Promise<GrammarPoint[]> {
  const prompt = `You are an English grammar tutor for Korean students.
Analyze this English sentence and return the key grammar/phrase points (up to 3, most important first) as a JSON array:

Sentence: "${english}"

Each item must have exactly these fields:
- type: short grammar category in Korean (예: "관계대명사", "가주어-진주어", "동명사", "5형식")
- label: 2-6자 짧은 배지 라벨 in Korean
- highlight: the exact phrase from the sentence (a substring of the sentence)
- description: 1문장 짜리 Korean explanation (max 80자)

Return ONLY a JSON array, no markdown or code fences.`;

  const content = await callClaude(prompt);
  if (!content) return [];
  const parsed = extractJson(content);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((x) => x && typeof x === "object" && x.highlight)
    .slice(0, 3)
    .map((x: any) => ({
      type: String(x.type || ""),
      label: String(x.label || ""),
      highlight: String(x.highlight || ""),
      description: String(x.description || ""),
    }));
}

/**
 * 단어 번역 유틸리티 — Claude API 프록시 사용
 * - Electron: apiclaude.cc 직접 호출 (세션 인터셉터가 CORS+인증 처리)
 * - Web: /api/claude/chat/completions Vercel 서버리스 프록시
 */

const isElectron =
  typeof window !== "undefined" &&
  (window as any).electronAPI?.isElectron === true;

const CLAUDE_ENDPOINT = isElectron
  ? "https://apiclaude.cc/v1/chat/completions"
  : "/api/claude/chat/completions";

const CLAUDE_MODEL = "claude-sonnet-5";

export interface WordTranslation {
  koreanMeaning: string;
  partOfSpeech: string;
  englishExplanation: string;
}

export interface ChineseWordTranslation {
  chineseMeaning: string;
  pinyin: string;
  partOfSpeech: string;
  chineseExplanation: string;
}

async function callClaude(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(CLAUDE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.warn(`[wordTranslate] API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.content?.[0]?.text ||
      "";
    return typeof content === "string" ? content : null;
  } catch (err) {
    console.warn("[wordTranslate] fetch error:", err);
    return null;
  }
}

function extractJson(text: string): any | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

/**
 * 단어의 한국어 뜻을 조회합니다.
 */
export async function translateWord(
  word: string,
  context?: string
): Promise<WordTranslation | null> {
  const cleaned = word.trim().replace(/[^a-zA-Z'-]/g, "");
  if (!cleaned) return null;

  const contextLine = context
    ? `The word appears in this context: "${context.slice(0, 200)}".`
    : "";

  const prompt = `Translate the English word "${cleaned}" into Korean. ${contextLine}
Return ONLY a JSON object (no markdown, no code fences) with these fields:
- koreanMeaning: Korean translation (brief, 1-3 words)
- partOfSpeech: part of speech in English (noun, verb, adjective, etc.)
- englishExplanation: brief English explanation (1 sentence, max 20 words)`;

  const content = await callClaude(prompt);
  if (!content) return null;
  const parsed = extractJson(content);
  if (!parsed) return null;

  return {
    koreanMeaning: parsed.koreanMeaning || "",
    partOfSpeech: parsed.partOfSpeech || "",
    englishExplanation: parsed.englishExplanation || "",
  };
}

/**
 * 단어의 중국어 뜻과 병음을 조회합니다.
 */
export async function translateWordToChinese(
  word: string,
  context?: string
): Promise<ChineseWordTranslation | null> {
  const cleaned = word.trim().replace(/[^a-zA-Z'-]/g, "");
  if (!cleaned) return null;

  const contextLine = context
    ? `The word appears in this context: "${context.slice(0, 200)}".`
    : "";

  const prompt = `Translate the English word "${cleaned}" into Simplified Chinese. ${contextLine}
Return ONLY a JSON object (no markdown, no code fences) with these fields:
- chineseMeaning: Simplified Chinese translation (brief, 1-4 characters typical)
- pinyin: Hanyu Pinyin with tone marks for the chineseMeaning (e.g. "míng bái")
- partOfSpeech: part of speech in English (noun, verb, adjective, etc.)
- chineseExplanation: brief Chinese explanation of the word (1 short sentence)`;

  const content = await callClaude(prompt);
  if (!content) return null;
  const parsed = extractJson(content);
  if (!parsed) return null;

  return {
    chineseMeaning: parsed.chineseMeaning || "",
    pinyin: parsed.pinyin || "",
    partOfSpeech: parsed.partOfSpeech || "",
    chineseExplanation: parsed.chineseExplanation || "",
  };
}

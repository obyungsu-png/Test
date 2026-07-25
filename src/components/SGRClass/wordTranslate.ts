/**
 * 단어 번역 유틸리티 — Claude API 서버 프록시 경유 호출
 * (클라이언트에 API 키를 두지 않고 Supabase Edge Function을 경유하여 apiclaude.cc 호출)
 */

import { CLAUDE_PROXY_URL, getServerHeaders } from "../../utils/apiConfig";

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
    const response = await fetch(CLAUDE_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getServerHeaders(),
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.warn(`[wordTranslate] proxy returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    // 서버 프록시는 { content, model, usage } 형태로 반환
    const content =
      data?.content ||
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
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

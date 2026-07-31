// ===================== SGR Novels Types =====================
// Novel-based classroom lesson data model (LitCharts-inspired)
// 구조: 소설(Novel) > 챕터(Chapter) > 분석(Plot/Theme/Character/Quote/Quiz/직독직해)

import type {
  PassageParagraph,
  DirectReadingItem,
  GrammarPoint,
} from "../SGRClass/types";

export type { PassageParagraph, DirectReadingItem, GrammarPoint };

// ─── 테마 (Theme) ────────────────────────────────────
export interface NovelTheme {
  id: string;
  name: string;            // e.g. "The American Dream"
  description: string;     // 테마 설명
  quote?: string;          // 대표 문장
  quoteKorean?: string;    // 대표 문장 한국어
}

// ─── 등장인물 (Character) ─────────────────────────────
export interface NovelCharacter {
  id: string;
  name: string;            // e.g. "Jay Gatsby"
  role: string;            // e.g. "Protagonist"
  description: string;     // 인물 설명
  traits?: string[];       // 성격 특징 ["ambitious", "mysterious"]
}

// ─── 인용문 (Quote) ───────────────────────────────────
export interface NovelQuote {
  id: string;
  text: string;            // 인용문 원문
  speaker?: string;        // 화자
  analysis?: string;       // 분석/해설
  analysisKorean?: string; // 한국어 분석
}

// ─── 퀴즈 (Quiz) ──────────────────────────────────────
export type QuizType =
  | "multiple_choice"      // 객관식
  | "true_false"           // O/X
  | "fill_blank"           // 빈칸 채우기
  | "short_answer";        // 주관식

export interface NovelQuiz {
  id: string;
  type: QuizType;
  question: string;        // ___ 로 빈칸 표시 (fill_blank)
  options?: string[];      // 객관식 보기
  answer: string;          // 정답 (객관식: 보기 텍스트, T/F: "true"/"false", 빈칸/주관식: 정답 텍스트)
  explanation?: string;    // 해설
}

// ─── 챕터 (Chapter) ───────────────────────────────────
export interface NovelChapter {
  id: string;
  chapterNumber: string;   // "Chapter 1" / "Ch. 1"
  title: string;           // 챕터 제목
  // 읽기 콘텐츠
  contentParagraphs: PassageParagraph[];   // 챕터 본문 (SGR Class 재사용)
  pdfUrl?: string;         // PDF 링크 (선택)
  epubUrl?: string;        // EPUB 링크 (선택)
  readingTime?: number;    // 예상 읽기 시간(분)
  // 챕터별 분석 (LitCharts 스타일)
  plotSummary: string;          // 챕터별 plot summary
  plotSummaryKorean?: string;   // 한국어 요약
  themes: NovelTheme[];         // 챕터별 테마
  characters: NovelCharacter[]; // 챕터별 등장인물
  quotes: NovelQuote[];         // 중요 인용문
  quizzes: NovelQuiz[];         // 챕터별 퀴즈
  directReading: DirectReadingItem[]; // 직독직해 (SGR Class 재사용)
}

// ─── 소설 (Novel) ─────────────────────────────────────
export interface SGRNovel {
  id: string;
  createdAt: number;
  updatedAt: number;

  // meta
  title: string;           // "The Great Gatsby"
  author: string;          // "F. Scott Fitzgerald"
  coverImage?: string;     // base64 or URL
  description: string;     // 소설 개요
  level?: string;          // 난이도/학년 ("Intermediate", "High School")
  category?: string;       // 장르/카테고리 ("Classic", "Fiction")
  sourceUrl?: string;      // LitCharts 참고 URL
  publishedYear?: string;  // 출판연도

  chapters: NovelChapter[];

  // 소설 전체 분석
  overallThemes: NovelTheme[];
  overallCharacters: NovelCharacter[];
  overallQuotes: NovelQuote[];
}

// ─── Storage ───────────────────────────────────────
export const NOVEL_STORAGE_KEY = "sgrNovel_novels";
export const NOVEL_EVENT = "sgrNovelUpdated";

function migrateNovels(list: SGRNovel[]): SGRNovel[] {
  return list.map((n) => ({
    ...n,
    chapters: (n.chapters || []).map((c) => ({
      ...c,
      themes: c.themes || [],
      characters: c.characters || [],
      quotes: c.quotes || [],
      quizzes: c.quizzes || [],
      directReading: c.directReading || [],
      contentParagraphs: c.contentParagraphs || [],
    })),
    overallThemes: n.overallThemes || [],
    overallCharacters: n.overallCharacters || [],
    overallQuotes: n.overallQuotes || [],
  }));
}

function initialSeed(): SGRNovel[] {
  return [SAMPLE_NOVEL];
}

export function loadNovels(): SGRNovel[] {
  try {
    const raw = localStorage.getItem(NOVEL_STORAGE_KEY);
    if (!raw) return initialSeed();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialSeed();
    return migrateNovels(parsed);
  } catch {
    return initialSeed();
  }
}

export function saveNovels(novels: SGRNovel[]) {
  localStorage.setItem(NOVEL_STORAGE_KEY, JSON.stringify(novels));
  window.dispatchEvent(new Event(NOVEL_EVENT));
  saveNovelsToServer(novels);
}

// ─── Supabase 서버 연동 (SGR Class 패턴 동일) ─────────
let _saveToServer: ((novels: SGRNovel[]) => Promise<void>) | null = null;
let _loadFromServer: (() => Promise<SGRNovel[]>) | null = null;

export function registerNovelServerSaver(fn: (novels: SGRNovel[]) => Promise<void>) {
  _saveToServer = fn;
}

export function registerNovelServerLoader(fn: () => Promise<SGRNovel[]>) {
  _loadFromServer = fn;
}

function saveNovelsToServer(novels: SGRNovel[]) {
  if (_saveToServer) {
    _saveToServer(novels).catch(err => {
      console.warn("[SGR Novels] 서버 저장 실패 (로컬에는 저장됨):", err);
    });
  }
}

export async function syncNovelsFromServer(): Promise<SGRNovel[]> {
  if (!_loadFromServer) return loadNovels();
  try {
    const serverNovels = await _loadFromServer();
    if (serverNovels && serverNovels.length > 0) {
      localStorage.setItem(NOVEL_STORAGE_KEY, JSON.stringify(serverNovels));
      window.dispatchEvent(new Event(NOVEL_EVENT));
      return serverNovels;
    }
  } catch (err) {
    console.warn("[SGR Novels] 서버 불러오기 실패 (로컬 사용):", err);
  }
  return loadNovels();
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Empty factories ───────────────────────────────
export function emptyParagraph(): PassageParagraph {
  return { id: uid(), content: "" };
}

export function emptyTheme(): NovelTheme {
  return { id: uid(), name: "", description: "" };
}

export function emptyCharacter(): NovelCharacter {
  return { id: uid(), name: "", role: "", description: "" };
}

export function emptyQuote(): NovelQuote {
  return { id: uid(), text: "" };
}

export function emptyQuiz(type: QuizType = "multiple_choice"): NovelQuiz {
  if (type === "multiple_choice") {
    return { id: uid(), type, question: "", options: ["", "", "", ""], answer: "" };
  }
  if (type === "true_false") {
    return { id: uid(), type, question: "", answer: "true" };
  }
  return { id: uid(), type, question: "", answer: "" };
}

export function emptyDirectReading(): DirectReadingItem {
  return { id: uid(), english: "", korean: "", chunks: [], grammarPoints: [] };
}

export function emptyChapter(): NovelChapter {
  return {
    id: uid(),
    chapterNumber: "Chapter 1",
    title: "",
    contentParagraphs: [emptyParagraph()],
    plotSummary: "",
    plotSummaryKorean: "",
    themes: [],
    characters: [],
    quotes: [],
    quizzes: [],
    directReading: [],
  };
}

export function emptyNovel(): SGRNovel {
  return {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    title: "New Novel",
    author: "",
    description: "",
    level: "",
    category: "",
    chapters: [emptyChapter()],
    overallThemes: [],
    overallCharacters: [],
    overallQuotes: [],
  };
}

// ─── Sample Novel: The Great Gatsby (LitCharts 참고) ─
export const SAMPLE_NOVEL: SGRNovel = {
  id: "sample-gatsby",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  description:
    "A portrait of the Jazz Age in all of its decadence and excess, The Great Gatsby is the story of Jay Gatsby, a man who pursues his version of the American Dream through organized crime—and is destroyed by it.",
  level: "High School",
  category: "Classic",
  sourceUrl: "https://www.litcharts.com/lit/the-great-gatsby",
  publishedYear: "1925",
  overallThemes: [
    {
      id: "t1",
      name: "The American Dream",
      description:
        "Gatsby's pursuit of wealth and status to win Daisy represents the corruption of the American Dream—the original ideals of freedom and equality twisted into materialism.",
      quote: "Gatsby believed in the green light, the orgastic future that year by year recedes before us.",
    },
    {
      id: "t2",
      name: "Class (Old Money vs. New Money)",
      description:
        "Fitzgerald contrasts the inherited 'old money' of East Egg (Tom and Daisy) with the newly-earned 'new money' of West Egg (Gatsby), showing how class barriers remain even amid wealth.",
    },
    {
      id: "t3",
      name: "Decay and the Past",
      description:
        "The novel is haunted by the desire to repeat or escape the past. Gatsby tries to recreate his past with Daisy, while society decays morally beneath the glittering surface.",
    },
  ],
  overallCharacters: [
    {
      id: "c1",
      name: "Jay Gatsby",
      role: "Protagonist",
      description:
        "A mysterious millionaire who throws lavish parties to attract Daisy Buchanan, the love he lost. His romantic idealism is both his greatness and his downfall.",
      traits: ["ambitious", "romantic", "mysterious", "idealistic"],
    },
    {
      id: "c2",
      name: "Nick Carraway",
      role: "Narrator",
      description:
        "The novel's narrator and Gatsby's neighbor. A young man from the Midwest who becomes caught up in the world of the rich, he serves as the moral compass of the story.",
      traits: ["observant", "honest", "reserved"],
    },
    {
      id: "c3",
      name: "Daisy Buchanan",
      role: "Love Interest",
      description:
        "Nick's cousin and Gatsby's former love. Beautiful and careless, she represents the seductive but destructive appeal of old money.",
      traits: ["charming", "careless", "shallow"],
    },
    {
      id: "c4",
      name: "Tom Buchanan",
      role: "Antagonist",
      description:
        "Daisy's husband, a wealthy, brutish man from an old-money family. He is arrogant, racist, and unfaithful.",
      traits: ["arrogant", "dominant", "cruel"],
    },
  ],
  overallQuotes: [
    {
      id: "q1",
      text: "So we beat on, boats against the current, borne back ceaselessly into the past.",
      speaker: "Nick Carraway",
      analysis:
        "The novel's closing line captures the central tragedy: humans struggle forward but are inevitably pulled back by the past and by illusion.",
      analysisKorean: "인간은 앞으로 나아가려 하지만, 과거와 환상에 의해 끊임없이 뒤로 끌려간다는 비극을 담은 결말 문장.",
    },
    {
      id: "q2",
      text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us.",
      speaker: "Nick Carraway",
      analysis:
        "The green light symbolizes Gatsby's hope and the American Dream—an always-receding future.",
    },
  ],
  chapters: [
    {
      id: "ch1",
      chapterNumber: "Chapter 1",
      title: "The Narrator Arrives",
      readingTime: 12,
      contentParagraphs: [
        {
          id: "p1",
          content:
            "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. \"Whenever you feel like criticizing any one,\" he told me, \"just remember that all the people in this world haven't had the advantages that you've had.\"",
        },
        {
          id: "p2",
          content:
            "He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me.",
        },
        {
          id: "p3",
          content:
            "Nick Carraway, the narrator, moves to West Egg on Long Island, next door to the mysterious millionaire **Jay Gatsby**. Across the bay lives his cousin **Daisy Buchanan** and her husband Tom. When Nick visits them for dinner, he meets the golfer **Jordan Baker** and learns that Tom has a mistress.",
        },
      ],
      plotSummary:
        "Nick Carraway introduces himself and moves to West Egg, renting a house next to Gatsby's mansion. He visits his cousin Daisy and her husband Tom Buchanan in East Egg, where he also meets Jordan Baker. During dinner, Tom receives a call from his mistress in New York, unsettling Daisy. Nick sees Gatsby reaching toward a green light at the end of Daisy's dock.",
      plotSummaryKorean:
        "닉 캐러웨이가 자기소개와 함께 웨스트 에그로 이사해 개츠비 저택 옆에 삽니다. 사촌 데이지와 남편 톰 부캐넌을 만나러 이스트 에그에 가서 조던 베이커도 만납니다. 저녁 식사 중 톰이 뉴욕의 정부에게서 전화를 받아 데이지가 동요합니다. 닉은 개츠비가 데이지 부두 끝의 초록불을 향해 손을 뻗는 것을 봅니다.",
      themes: [
        {
          id: "ch1t1",
          name: "Class Distinction",
          description: "The contrast between East Egg (old money) and West Egg (new money) is established.",
          quote: "I lived at West Egg, the—well, the less fashionable of the two.",
        },
      ],
      characters: [
        {
          id: "ch1c1",
          name: "Nick Carraway",
          role: "Narrator",
          description: "Introduces himself as a tolerant, non-judgmental observer from the Midwest.",
        },
        {
          id: "ch1c2",
          name: "Jay Gatsby",
          role: "Neighbor",
          description: "Seen only as a silhouette reaching for the green light—mysterious and hopeful.",
        },
      ],
      quotes: [
        {
          id: "ch1q1",
          text: "he stretched out his arms toward the dark water in a curious way... a single green light, minute and far away.",
          speaker: "Nick observing Gatsby",
          analysis: "The green light at the end of Daisy's dock symbolizes Gatsby's hope and his dream of reuniting with Daisy.",
        },
      ],
      quizzes: [
        {
          id: "ch1qz1",
          type: "multiple_choice",
          question: "Where does Nick Carraway move to at the start of the novel?",
          options: ["East Egg", "West Egg", "New York City", "The Midwest"],
          answer: "West Egg",
          explanation: "Nick rents a house in West Egg, next door to Gatsby's mansion.",
        },
        {
          id: "ch1qz2",
          type: "true_false",
          question: "Tom Buchanan is faithful to his wife Daisy in Chapter 1.",
          answer: "false",
          explanation: "Tom has a mistress, and her phone call interrupts dinner.",
        },
        {
          id: "ch1qz3",
          type: "short_answer",
          question: "What does Gatsby reach toward at the end of Chapter 1?",
          answer: "green light",
          explanation: "The green light at the end of Daisy's dock symbolizes his hope.",
        },
      ],
      directReading: [
        {
          id: "ch1d1",
          english: "In my younger and more vulnerable years my father gave me some advice.",
          korean: "내가 더 어리고 더 취약했던 시절, 아버지가 나에게 충고를 해주셨다.",
          chunks: ["In my younger and more vulnerable years", "my father", "gave me some advice"],
          paragraphId: 1,
          importance: "mid",
          difficulty: "easy",
          grammarPoints: [
            { type: "비교급", label: "younger and more vulnerable", description: "비교급 나열: 더 어리고 더 취약한", highlight: "younger and more vulnerable" },
          ],
        },
      ],
    },
    {
      id: "ch2",
      chapterNumber: "Chapter 2",
      title: "The Valley of Ashes",
      readingTime: 11,
      contentParagraphs: [
        {
          id: "p1",
          content:
            "About half way between West Egg and New York the motor road hastily joins the railroad and runs beside it for a quarter of a mile, so as to shrink away from a certain desolate area of land. This is a valley of **ashes**—a fantastic farm where ashes grow like wheat into ridges and hills and grotesque gardens.",
        },
        {
          id: "p2",
          content:
            "Above the gray land and the spasms of bleak dust which drift endlessly over it, you perceive, after a moment, the eyes of Doctor T.J. Eckleburg. The eyes are blue and gigantic—their retinas are one yard high.",
        },
      ],
      plotSummary:
        "Nick accompanies Tom to New York. They stop in the Valley of Ashes, a bleak industrial wasteland, and pick up Tom's mistress Myrtle Wilson. At Tom's apartment, they throw a small party that ends with Tom breaking Myrtle's nose.",
      plotSummaryKorean:
        "닉은 톰과 함께 뉴욕으로 갑니다. 황량한 산업 폐허인 '재의 골짜기'에 들러 톰의 정부 마이틀 윌슨을 데려갑니다. 톰의 아파트에서 열린 작은 파티는 톰이 마이틀의 코를 부러뜨리며 끝납니다.",
      themes: [
        {
          id: "ch2t1",
          name: "Moral Decay",
          description: "The Valley of Ashes represents the moral and social decay beneath the glittering wealth.",
          quote: "a valley of ashes—a fantastic farm where ashes grow like wheat.",
        },
      ],
      characters: [
        {
          id: "ch2c1",
          name: "Myrtle Wilson",
          role: "Tom's mistress",
          description: "A working-class woman desperate to escape her life, whose affair with Tom ends badly.",
        },
        {
          id: "ch2c2",
          name: "George Wilson",
          role: "Myrtle's husband",
          description: "A lifeless, exhausted mechanic who owns a garage in the Valley of Ashes.",
        },
      ],
      quotes: [
        {
          id: "ch2q1",
          text: "The eyes of Doctor T.J. Eckleburg are blue and gigantic—their retinas are one yard high.",
          speaker: "Nick",
          analysis: "The billboard eyes symbolize a god-like witness to the moral decay of the era.",
        },
      ],
      quizzes: [
        {
          id: "ch2qz1",
          type: "multiple_choice",
          question: "What does the Valley of Ashes symbolize?",
          options: ["Wealth and luxury", "Moral and social decay", "The American Dream achieved", "Natural beauty"],
          answer: "Moral and social decay",
          explanation: "The bleak wasteland represents the decay hidden beneath the era's wealth.",
        },
      ],
      directReading: [],
    },
  ],
};

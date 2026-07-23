// ===================== SGR Class Types =====================
// Textbook-style classroom lesson data model

export interface PreviewCard {
  id: string;
  image?: string;    // base64 or URL
  caption: string;
}

export interface VocabPreviewItem {
  id: string;
  word: string;
  meaning: string;
}

export interface PassageParagraph {
  id: string;
  content: string;              // supports **bold** and __underline__
  image?: string;               // base64 or URL
  imageCaption?: string;
}

// ─── Question types ────────────────────────────────
export type QuestionType =
  | "main_idea"          // Main idea: choose one of 3 options
  | "multiple_choice"    // Generic MCQ (3-4 options)
  | "vocabulary"         // "What does X mean?" MCQ
  | "fill_blank"         // Single blank + short answer
  | "complete_sentence"  // Multiple sentences with blanks (word bank optional)
  | "outline"            // Two-column outline with blanks
  | "true_false";        // T/F set

export interface McqQuestion {
  id: string;
  type: "main_idea" | "multiple_choice" | "vocabulary";
  question: string;
  options: string[];     // 3-4 options
  answer: number;        // index into options
  explanation?: string;
}

export interface FillBlankQuestion {
  id: string;
  type: "fill_blank";
  question: string;      // uses ___ to mark blank position
  answer: string;
  explanation?: string;
}

export interface CompleteSentenceQuestion {
  id: string;
  type: "complete_sentence";
  wordBank?: string[];   // optional bank
  sentences: Array<{ id: string; text: string; answer: string }>; // text uses ___
}

export interface OutlineQuestion {
  id: string;
  type: "outline";
  leftTitle: string;
  rightTitle: string;
  leftItems: Array<{ id: string; text: string; answer?: string }>;   // text uses ___
  rightItems: Array<{ id: string; text: string; answer?: string }>;
}

export interface TrueFalseQuestion {
  id: string;
  type: "true_false";
  statements: Array<{ id: string; text: string; answer: boolean }>;
}

export type Question =
  | McqQuestion
  | FillBlankQuestion
  | CompleteSentenceQuestion
  | OutlineQuestion
  | TrueFalseQuestion;

// ─── Vocabulary review (final page) ────────────────
export interface VocabReviewItem {
  id: string;
  sentence: string;      // uses ___ for blank
  answer: string;
}

export interface VocabReview {
  wordBank: string[];
  items: VocabReviewItem[];
}

// ─── Direct reading (직독직해) ───────────────────────
export interface GrammarPoint {
  type: string;           // e.g. "가주어-진주어", "5형식", "관계대명사"
  label: string;          // short badge label
  description: string;    // full explanation
  highlight: string;      // the phrase in the sentence
}

export interface DirectReadingItem {
  id: string;
  english: string;
  korean: string;
  chunks: string[];       // english broken into chunks
  paragraphId?: number;
  paragraphTitle?: string;
  importance?: "high" | "mid" | "low";
  difficulty?: "hard" | "medium" | "easy";
  isKeyExam?: boolean;
  grammarPoints?: GrammarPoint[];
}

// ─── 책 종류 (bookType) ─────────────────────────────
// 하나의 SGR Class 인스턴스에 여러 책 유형의 레슨이 공존한다.
// - "sgr_original": 기본 SGR Class 형식
// - "reading_explore": Reading Explorer 형식 (사진 2-4)
// - 추후 확장 가능
export type BookType = "american_textbook" | "reading_explore" | string;

export const BOOK_TYPE_META: Record<string, { label: string; color: string; description: string }> = {
  american_textbook: {
    label: "American Textbook",
    color: "from-cyan-500 to-blue-600",
    description: "기본 American Textbook 형식 (Preview / Passage / Questions / Vocab / 직독직해)",
  },
  reading_explore: {
    label: "Reading Explorer",
    color: "from-violet-500 to-fuchsia-600",
    description: "Reading / Comprehension / Reading Skill / Vocabulary Practice 4단 구성",
  },
};

/** 예전 값(sgr_original) 및 미지정 → american_textbook 로 정규화 */
export function normalizeBookType(bt?: string | null): BookType {
  if (!bt || bt === "sgr_original") return "american_textbook";
  return bt as BookType;
}

// ─── Reading Explore 컨텐츠 ─────────────────────────
export interface RELabeledParagraph {
  id: string;
  label: string;        // "A", "B", "C" ...
  content: string;      // supports **bold** / __underline__ / ==red== 표시
  imageCaption?: string;
}

export interface REFootnote {
  id: string;
  marker: string;       // "1", "2", ...
  text: string;         // 짧은 정의
}

export interface REReading {
  headline: string;             // 큰 제목
  headlineAccent?: string;      // 강조 부분 (색이 다른 부분)
  intro?: string;               // italic 도입 문장
  paragraphs: RELabeledParagraph[];
  subheads?: Array<{ afterParagraphId: string; text: string }>; // 특정 단락 뒤에 소제목
  footnotes: REFootnote[];
}

export interface REComprehensionMcq {
  id: string;
  category: string;             // "MAIN IDEA" | "DETAIL" | "VOCABULARY" | "INFERENCE" ...
  question: string;
  options: string[];
  answer: number;
}

export interface REMatchingItem {
  id: string;
  statement: string;
  answer: string;               // "a" | "b" | "c" ...
}

export interface REMatchingBlock {
  category: string;             // "APPLYING IDEAS"
  instruction: string;
  choices: Array<{ letter: string; text: string }>;
  items: REMatchingItem[];
}

export interface REConceptMapNode {
  id: string;
  /** 배치: 중심(center) / 주요(major) / 세부(leaf) */
  kind: "center" | "major" | "leaf";
  /** major의 부모는 center id, leaf의 부모는 major id */
  parentId?: string;
  /** 노드 내 표시 텍스트. ___ 위치에 빈칸 정답을 넣는다 */
  text: string;
  /** 빈칸 정답 (순서대로) */
  answers?: string[];
}

export interface REConceptMap {
  title: string;                // "Organizing Information (1)—Creating a Concept Map"
  intro: string;                // 스킬 설명
  nodes: REConceptMapNode[];
}

export interface REVocabCompletion {
  bank: string[];
  /** 문단 내 여러 빈칸을 원문 순서대로 배치 */
  text: string;                 // 본문. ___ 로 빈칸 표시
  answers: string[];            // 빈칸 정답 순서대로
}

export interface REDefinitionMatchItem {
  id: string;
  word: string;
  definition: string;
}

export interface REWordFormItem {
  id: string;
  sentence: string;             // "I find that singing is really ___."
  options: string[];            // ["embarrassed", "embarrassing"]
  answer: number;
}

export interface REWordForms {
  explanation: string;
  items: REWordFormItem[];
}

export interface REVocabularyPractice {
  completion: REVocabCompletion;
  definitionMatch: REDefinitionMatchItem[];
  wordForms: REWordForms;
}

export interface ReadingExploreContent {
  reading: REReading;
  comprehension: {
    mcq: REComprehensionMcq[];
    matching?: REMatchingBlock;
  };
  readingSkill: REConceptMap;
  vocabPractice: REVocabularyPractice;
}

// ─── Full lesson ───────────────────────────────────
export interface SGRLesson {
  id: string;
  createdAt: number;
  updatedAt: number;

  /** 책 종류 - 없으면 "sgr_original" */
  bookType?: BookType;

  // meta
  unitNumber: string;         // "01"
  title: string;              // "The U.S. Geography"
  subject: string;            // "영어"
  category?: string;          // e.g. "중등영어1-1"

  // Page 1: Preview
  coverImage?: string;
  previewQuestion: string;    // "What are some features..."
  previewCards: PreviewCard[];    // usually 3
  vocabularyPreview: VocabPreviewItem[]; // ~5 words
  vocabPreviewInstruction: string;       // e.g. "Write the correct word next to its meaning."

  // Page 2-3: Passage
  passageTitle: string;                  // "The Regions of the United States"
  passageHeaderImage?: string;
  passageParagraphs: PassageParagraph[];

  // Page 4: Questions
  questions: Question[];

  // Page 5: Vocabulary Review
  vocabReview: VocabReview;

  // (optional) Direct reading tool - authored in CMS
  directReading: DirectReadingItem[];

  /** bookType === "reading_explore" 일 때 사용 */
  readingExplore?: ReadingExploreContent;
}

// ─── Storage ───────────────────────────────────────
export const SGR_STORAGE_KEY = "sgrClass_lessons";
export const SGR_EVENT = "sgrClassUpdated";

/** 저장된 레슨을 현행 데이터 스키마로 정규화 */
function migrateLessons(list: SGRLesson[]): SGRLesson[] {
  return list.map((l) => ({
    ...l,
    bookType: normalizeBookType((l as any).bookType),
  }));
}

/** 초기 시드에 두 개의 book type 샘플을 포함 (Reading Explorer 자리 확보) */
function initialSeed(): SGRLesson[] {
  return [SAMPLE_LESSON, SAMPLE_READING_EXPLORE_LESSON];
}

export function loadLessons(): SGRLesson[] {
  try {
    const raw = localStorage.getItem(SGR_STORAGE_KEY);
    if (!raw) return initialSeed();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialSeed();
    return migrateLessons(parsed);
  } catch {
    return initialSeed();
  }
}

export function saveLessons(lessons: SGRLesson[]) {
  localStorage.setItem(SGR_STORAGE_KEY, JSON.stringify(lessons));
  window.dispatchEvent(new Event(SGR_EVENT));
  // Supabase에도 비동기 저장 (fire-and-forget)
  saveLessonsToServer(lessons);
}

// ─── Supabase 서버 연동 ─────────────────────────────

let _saveToServer: ((lessons: SGRLesson[]) => Promise<void>) | null = null;
let _loadFromServer: (() => Promise<SGRLesson[]>) | null = null;

/** 서버 저장 함수 등록 (sgrClassApi에서 호출) */
export function registerServerSaver(fn: (lessons: SGRLesson[]) => Promise<void>) {
  _saveToServer = fn;
}

/** 서버 로드 함수 등록 (sgrClassApi에서 호출) */
export function registerServerLoader(fn: () => Promise<SGRLesson[]>) {
  _loadFromServer = fn;
}

/** 서버에 레슨 저장 (fire-and-forget, 실패해도 조용히 넘어감) */
function saveLessonsToServer(lessons: SGRLesson[]) {
  if (_saveToServer) {
    _saveToServer(lessons).catch(err => {
      console.warn("[SGR Class] 서버 저장 실패 (로컬에는 저장됨):", err);
    });
  }
}

/** 서버에서 레슨 불러오기 (localStorage에 병합) */
export async function syncFromServer(): Promise<SGRLesson[]> {
  if (!_loadFromServer) return loadLessons();
  try {
    const serverLessons = await _loadFromServer();
    if (serverLessons && serverLessons.length > 0) {
      // 서버 데이터가 있으면 localStorage 갱신
      localStorage.setItem(SGR_STORAGE_KEY, JSON.stringify(serverLessons));
      window.dispatchEvent(new Event(SGR_EVENT));
      return serverLessons;
    }
  } catch (err) {
    console.warn("[SGR Class] 서버 불러오기 실패 (로컬 사용):", err);
  }
  return loadLessons();
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Empty factories ───────────────────────────────
export function emptyLesson(): SGRLesson {
  return {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    unitNumber: "01",
    title: "New Lesson",
    subject: "영어",
    category: "",
    previewQuestion: "",
    previewCards: [emptyPreviewCard(), emptyPreviewCard(), emptyPreviewCard()],
    vocabularyPreview: [],
    vocabPreviewInstruction: "Write the correct word next to its meaning.",
    passageTitle: "",
    passageParagraphs: [emptyParagraph()],
    questions: [],
    vocabReview: { wordBank: [], items: [] },
    directReading: [],
  };
}

export function emptyPreviewCard(): PreviewCard {
  return { id: uid(), caption: "" };
}
export function emptyVocabPreview(): VocabPreviewItem {
  return { id: uid(), word: "", meaning: "" };
}
export function emptyParagraph(): PassageParagraph {
  return { id: uid(), content: "" };
}
export function emptyMcq(type: McqQuestion["type"] = "multiple_choice"): McqQuestion {
  return { id: uid(), type, question: "", options: ["", "", ""], answer: 0 };
}
export function emptyFillBlank(): FillBlankQuestion {
  return { id: uid(), type: "fill_blank", question: "", answer: "" };
}
export function emptyCompleteSentence(): CompleteSentenceQuestion {
  return {
    id: uid(),
    type: "complete_sentence",
    wordBank: [],
    sentences: [{ id: uid(), text: "", answer: "" }],
  };
}
export function emptyOutline(): OutlineQuestion {
  return {
    id: uid(),
    type: "outline",
    leftTitle: "",
    rightTitle: "",
    leftItems: [{ id: uid(), text: "", answer: "" }],
    rightItems: [{ id: uid(), text: "", answer: "" }],
  };
}
export function emptyTrueFalse(): TrueFalseQuestion {
  return {
    id: uid(),
    type: "true_false",
    statements: [{ id: uid(), text: "", answer: true }],
  };
}
export function emptyDirectReading(): DirectReadingItem {
  return { id: uid(), english: "", korean: "", chunks: [], grammarPoints: [] };
}
export function emptyVocabReviewItem(): VocabReviewItem {
  return { id: uid(), sentence: "", answer: "" };
}

// ─── Sample lesson (American Textbook 자리 채움) ─
export const SAMPLE_LESSON: SGRLesson = {
  id: "sample-us-geography",
  bookType: "american_textbook",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  unitNumber: "01",
  title: "The U.S. Geography",
  subject: "영어",
  category: "중등영어1-1",
  previewQuestion:
    "What are some features of the different regions in the United States?",
  previewCards: [
    { id: "c1", caption: "New York City is a large metropolitan area with millions of people." },
    { id: "c2", caption: "Farms cover huge amounts of land all throughout the American Midwest." },
    { id: "c3", caption: "The Rocky Mountains rise high above the land in the Mountain States." },
  ],
  vocabPreviewInstruction: "Write the correct word next to its meaning.",
  vocabularyPreview: [
    { id: "v1", word: "cash crop", meaning: "a crop that is grown to be sold for money" },
    { id: "v2", word: "prairie", meaning: "a flat area covered with tall grasses and few trees" },
    { id: "v3", word: "fertile", meaning: "rich; productive" },
    { id: "v4", word: "cropland", meaning: "land suitable for farming" },
    { id: "v5", word: "diverse", meaning: "varied; having many different types or variations" },
  ],
  passageTitle: "The Regions of the United States",
  passageParagraphs: [
    {
      id: "p1",
      content:
        "The United States can be divided into five geographic regions. Each region has its own **physical environment**, such as **landforms** and climate. These features set each region apart from the other ones.",
    },
    {
      id: "p2",
      content:
        "The Northeast region includes 11 states and the nation's capital, Washington, D.C. (District of Columbia). The Atlantic Coastal Plain and mountain ranges are the Northeast's major landforms. The Northeast is often divided into two subregions: New England and the Middle Atlantic States.",
    },
    {
      id: "p3",
      content:
        "In American history, many of the first settlers from Europe settled in the Northeast. New England is known for the early settlements by the Pilgrims and Puritans. The Middle Atlantic has some of the most densely populated areas and largest urban areas in the U.S., including New York City, Washington, D.C., and Philadelphia.",
    },
    {
      id: "p4",
      content:
        "The Southeast includes 12 states. The Mississippi River flows through the western part of the region. A warm climate and a long growing season in the Southeast help farmers grow many different kinds of **cash crops**. Tobacco and cotton were some of the first cash crops for early plantation owners. Peaches in Georgia and oranges in sunny Florida are two important cash crops for modern Southeast farmers.",
      imageCaption: "cash crop",
    },
    {
      id: "p5",
      content:
        "The Midwest is a region of plains and **prairies**. The Great Plains and the Central Plains are known for their rich fields of corn, soybeans, and wheat that **stretch** as far as the eye can see. The Mississippi River begins there, and four of the Great Lakes are in the Midwest. Its flat land and **fertile croplands** make this region a center for agriculture. People often call the Midwest \"the Breadbasket of the United States.\"",
      imageCaption: "prairie",
    },
    {
      id: "p6",
      content:
        "The Southwest includes Arizona, New Mexico, Texas, and Oklahoma. The region has many **arid** and range areas, so it contains several deserts. There are also numerous plateaus, canyons, mesas, and buttes. The Grand Canyon, one of the best known landforms in the U.S., is located in the Southwest.",
      imageCaption: "the Grand Canyon",
    },
    {
      id: "p7",
      content:
        "Finally, the West includes California, Nevada, Oregon, Washington, and the Mountain States. Alaska and Hawaii are in the western region, but they are separate from the continental United States. The region is a **diverse** area with many different environments. The Northwest is known for its long coastlines along the Pacific Ocean while the Southwest is dry and contains many deserts. Much of the Mountain States is **dominated** by the Rocky Mountains.",
      imageCaption: "the rocky coastline of California",
    },
  ],
  questions: [
    {
      id: "q1",
      type: "main_idea",
      question: "What is the passage mainly about?",
      options: [
        "Where each region in the United States is",
        "What the name of each region in the U.S. is",
        "How each region in the U.S. is different from the others",
      ],
      answer: 2,
      explanation: "The passage focuses on the differences between regions.",
    },
    {
      id: "q2",
      type: "multiple_choice",
      question: "Tobacco, cotton, and peaches are important cash crops in the ___.",
      options: ["Northeast", "Southwest", "Southeast"],
      answer: 2,
    },
    {
      id: "q3",
      type: "multiple_choice",
      question: "Why do people call the Midwest \"the Breadbasket of the United States\"?",
      options: [
        "It is an important farming center in the country.",
        "The people living there enjoy many kinds of bread.",
        "Much of the land in the Midwest is flat.",
      ],
      answer: 0,
    },
    {
      id: "q4",
      type: "vocabulary",
      question: "What does densely mean?",
      options: ["partially", "heavily", "actively"],
      answer: 1,
    },
    {
      id: "q5",
      type: "complete_sentence",
      wordBank: [],
      sentences: [
        { id: "s1", text: "There are many large ___ areas in the Northeast.", answer: "urban" },
        { id: "s2", text: "Farmers in the ___ grow corn, soybeans, and wheat.", answer: "Midwest" },
        { id: "s3", text: "Neither Alaska nor ___ borders any other states in the U.S.", answer: "Hawaii" },
      ],
    },
    {
      id: "q6",
      type: "outline",
      leftTitle: "American Regions",
      rightTitle: "American Landforms",
      leftItems: [
        { id: "l1", text: "___ = has 11 states plus Washington, D.C.", answer: "Northeast" },
        { id: "l2", text: "Southeast = has 12 states" },
        { id: "l3", text: "Midwest = includes many states with plains and prairies" },
        { id: "l4", text: "___ = Arizona, New Mexico, Texas, and Oklahoma", answer: "Southwest" },
        { id: "l5", text: "West = California, Nevada, Oregon, Washington, and the ___", answer: "Mountain States" },
      ],
      rightItems: [
        { id: "r1", text: "Coastal areas = land next to water" },
        { id: "r2", text: "Urban areas = densely ___ areas like New York City and Boston", answer: "populated" },
        { id: "r3", text: "Freshwater areas = the Mississippi and the Great Lakes areas" },
        { id: "r4", text: "Croplands = land with farms on them" },
        { id: "r5", text: "Arid and ___ areas = deserts", answer: "range" },
      ],
    },
    {
      id: "q7",
      type: "true_false",
      statements: [
        { id: "t1", text: "There are two smaller regions found within the Northeast.", answer: true },
        { id: "t2", text: "The breadbasket of the United States is the Southeast.", answer: false },
        { id: "t3", text: "The Grand Canyon is located in the Mountain States.", answer: false },
      ],
    },
  ],
  vocabReview: {
    wordBank: ["physical environment", "arid", "stretch", "landform", "dominate"],
    items: [
      { id: "vr1", sentence: "The ___ of a region includes its landforms and climate.", answer: "physical environment" },
      { id: "vr2", sentence: "Plains and prairies are major ___ in the Midwest.", answer: "landforms" },
      { id: "vr3", sentence: "___ regions get very little rainfall all throughout the year.", answer: "Arid" },
      { id: "vr4", sentence: "The Midwest region is ___ by croplands.", answer: "dominated" },
      { id: "vr5", sentence: "The continental United States ___ from Canada to Mexico.", answer: "stretches" },
    ],
  },
  directReading: [
    {
      id: "d1",
      english: "The United States can be divided into five geographic regions.",
      korean: "미국은 다섯 개의 지리적 지역으로 나뉠 수 있다.",
      chunks: ["The United States", "can be divided", "into five geographic regions"],
      paragraphId: 1,
      paragraphTitle: "지리적 구분",
      importance: "high",
      difficulty: "easy",
      isKeyExam: true,
      grammarPoints: [
        { type: "수동태", label: "can be divided", description: "can be + p.p: ~될 수 있다 (수동형 조동사)", highlight: "can be divided" },
      ],
    },
    {
      id: "d2",
      english: "Each region has its own physical environment, such as landforms and climate.",
      korean: "각 지역은 지형과 기후 같은 고유의 자연환경을 가지고 있다.",
      chunks: ["Each region", "has its own", "physical environment,", "such as landforms and climate"],
      paragraphId: 1,
      paragraphTitle: "지리적 구분",
      importance: "mid",
      difficulty: "medium",
      isKeyExam: false,
      grammarPoints: [
        { type: "전치사구", label: "such as ~", description: "such as: ~와 같은 (예시 열거)", highlight: "such as landforms and climate" },
      ],
    },
    {
      id: "d3",
      english: "The Northeast region is known for its dense forests and heavy snowfall in winter.",
      korean: "북동부 지역은 울창한 숲과 겨울의 많은 강설로 알려져 있다.",
      chunks: ["The Northeast region", "is known for", "its dense forests", "and heavy snowfall", "in winter"],
      paragraphId: 2,
      paragraphTitle: "북동부 지역",
      importance: "high",
      difficulty: "medium",
      isKeyExam: true,
      grammarPoints: [
        { type: "수동태", label: "is known for", description: "be known for: ~로 알려져 있다", highlight: "is known for" },
      ],
    },
    {
      id: "d4",
      english: "The Midwest is often called the breadbasket of the nation because of its vast croplands.",
      korean: "중서부는 광활한 경작지 때문에 국가의 곡창으로 자주 불린다.",
      chunks: ["The Midwest", "is often called", "the breadbasket of the nation", "because of", "its vast croplands"],
      paragraphId: 2,
      paragraphTitle: "중서부 지역",
      importance: "high",
      difficulty: "hard",
      isKeyExam: true,
      grammarPoints: [
        { type: "수동태", label: "is called", description: "be called: ~라고 불리다 (5형식 수동)", highlight: "is often called" },
        { type: "전치사구", label: "because of", description: "because of + 명사: ~때문에 (전치사구)", highlight: "because of its vast croplands" },
      ],
    },
    {
      id: "d5",
      english: "The West region stretches from the Rocky Mountains to the Pacific coast, offering diverse landscapes.",
      korean: "서부 지역은 로키 산맥에서 태평양 해안까지 뻗어 있어, 다양한 풍경을 제공한다.",
      chunks: ["The West region", "stretches from", "the Rocky Mountains", "to the Pacific coast,", "offering diverse landscapes"],
      paragraphId: 3,
      paragraphTitle: "서부 지역",
      importance: "mid",
      difficulty: "hard",
      isKeyExam: false,
      grammarPoints: [
        { type: "분사구문", label: "offering ~", description: "현재분사(offer+ing): ~하며 (연속 동작)", highlight: "offering diverse landscapes" },
        { type: "숙어", label: "stretch from A to B", description: "A에서 B까지 뻗어 있다", highlight: "stretches from the Rocky Mountains to the Pacific coast" },
      ],
    },
  ],
};

// ─── Sample lesson (Reading Explorer 자리 채움 · 실제 컨텐츠는 CMS/CSV에서 등록) ─
export const SAMPLE_READING_EXPLORE_LESSON: SGRLesson = {
  id: "sample-reading-explore",
  bookType: "reading_explore",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  unitNumber: "01",
  title: "Sample Reading Explorer Unit",
  subject: "영어",
  category: "샘플",
  previewQuestion: "",
  previewCards: [],
  vocabularyPreview: [],
  vocabPreviewInstruction: "",
  passageTitle: "",
  passageParagraphs: [],
  questions: [],
  vocabReview: { wordBank: [], items: [] },
  directReading: [],
  readingExplore: {
    reading: {
      headline: "SAMPLE",
      headlineAccent: "PLACEHOLDER",
      intro: "This unit is a structural placeholder — replace with your own passage in the CMS.",
      paragraphs: [
        {
          id: "p1",
          label: "A",
          content:
            "Type your first paragraph here. You can mark ==key vocab== to render in red, wrap key phrases in **bold**, or add __underline__ where useful.",
        },
        {
          id: "p2",
          label: "B",
          content:
            "This is the second paragraph slot. Add as many as you need. Each paragraph gets its own letter label on the left.",
          imageCaption: "Image caption goes here",
        },
      ],
      subheads: [],
      footnotes: [
        { id: "f1", marker: "1", text: "Add short vocabulary notes here." },
      ],
    },
    comprehension: {
      mcq: [
        {
          id: "cq1",
          category: "MAIN IDEA",
          question: "What is the main idea of the passage?",
          options: [
            "Option A placeholder.",
            "Option B placeholder.",
            "Option C placeholder.",
          ],
          answer: 0,
        },
        {
          id: "cq2",
          category: "DETAIL",
          question: "Which detail matches the passage?",
          options: [
            "Detail option A.",
            "Detail option B.",
            "Detail option C.",
          ],
          answer: 1,
        },
      ],
      matching: {
        category: "APPLYING IDEAS",
        instruction:
          "Read the statements (1-4). Match each statement to a choice (a-c).",
        choices: [
          { letter: "a", text: "Choice A description." },
          { letter: "b", text: "Choice B description." },
          { letter: "c", text: "Choice C description." },
        ],
        items: [
          { id: "m1", statement: "Sample statement one.", answer: "a" },
          { id: "m2", statement: "Sample statement two.", answer: "b" },
          { id: "m3", statement: "Sample statement three.", answer: "c" },
          { id: "m4", statement: "Sample statement four.", answer: "a" },
        ],
      },
    },
    readingSkill: {
      title: "Organizing Information — Creating a Concept Map",
      intro:
        "Fill in the blanks in this concept map with information drawn from your reading passage.",
      nodes: [
        { id: "n_center", kind: "center", text: "Main Topic" },
        { id: "n_major1", kind: "major", parentId: "n_center", text: "Key Idea 1" },
        { id: "n_major2", kind: "major", parentId: "n_center", text: "Key Idea 2" },
        {
          id: "n_leaf1",
          kind: "leaf",
          parentId: "n_major1",
          text: "Detail: ___ supports Key Idea 1.",
          answers: ["evidence"],
        },
        {
          id: "n_leaf2",
          kind: "leaf",
          parentId: "n_major2",
          text: "Detail: uses ___ as an example.",
          answers: ["example"],
        },
      ],
    },
    vocabPractice: {
      completion: {
        bank: ["word1", "word2", "word3", "word4"],
        text:
          "Use the words in the box to complete this short paragraph. First blank goes here ___. Second blank goes here ___. Third blank ___. Final blank ___.",
        answers: ["word1", "word2", "word3", "word4"],
      },
      definitionMatch: [
        { id: "d1", word: "word1", definition: "definition of word 1" },
        { id: "d2", word: "word2", definition: "definition of word 2" },
        { id: "d3", word: "word3", definition: "definition of word 3" },
        { id: "d4", word: "word4", definition: "definition of word 4" },
      ],
      wordForms: {
        explanation:
          "Some adjectives end with -ed or -ing. The -ed form describes how you feel; the -ing form describes what causes the feeling.",
        items: [
          {
            id: "wf1",
            sentence: "1. I felt very ___ during the lecture.",
            options: ["bored", "boring"],
            answer: 0,
          },
          {
            id: "wf2",
            sentence: "2. The movie was really ___.",
            options: ["excited", "exciting"],
            answer: 1,
          },
        ],
      },
    },
  },
};

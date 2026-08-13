// SGR HSK — 중국어(HSK) 학습 콘텐츠 타입 정의
// SGR Class 를 참고하되 HSK 특성(한자·병음·성조·급수)에 맞춰 슬림화

// ─── 어휘 항목 ────────────────────────────────────
export interface HSKVocabItem {
  id: string;
  hanzi: string;          // 汉字
  pinyin: string;         // pīnyīn (성조 포함)
  meaning: string;        // 한국어 뜻
  partOfSpeech?: string;  // 명, 동, 형 등
  example?: string;       // 예문(한자)
  examplePinyin?: string; // 예문 병음
  exampleKorean?: string; // 예문 한국어
}

// ─── 지문 문단 ────────────────────────────────────
export interface HSKPassageParagraph {
  id: string;
  hanzi: string;   // 한자 원문
  pinyin: string;  // 병음 (문단 전체, 공백 구분)
  korean: string;  // 한국어 번역
  audio?: string;  // 선택: 음원 URL
}

// ─── 문제 ─────────────────────────────────────────
export type HSKQuestionType =
  | "multiple_choice"       // 객관식 (한자 or 병음 or 한국어 지문)
  | "fill_blank"            // 빈칸 채우기
  | "translation_zh_ko"     // 중→한 번역
  | "translation_ko_zh"     // 한→중 번역
  | "pinyin_match"          // 한자 → 병음 매칭
  | "tone_pick";            // 성조 고르기

export interface HSKQuestion {
  id: string;
  type: HSKQuestionType;
  question: string;         // 문제 지문 (한자/한국어 혼용 가능)
  questionPinyin?: string;  // 병음(선택)
  options?: string[];       // 객관식/성조 옵션
  answer: string | number;  // 정답
  explanation?: string;     // 해설(한국어)
}

// ─── 직독직해 (문장 단위 청크) ─────────────────────
export interface HSKDirectReadingItem {
  id: string;
  hanzi: string;
  pinyin: string;
  korean: string;
  chunks?: string[];  // 청크로 끊어 읽기용 (선택)
  grammarPoint?: string;  // 문법 포인트(한국어 설명)
}

// ─── 레슨 ─────────────────────────────────────────
export type HSKLevel = "1" | "2" | "3" | "4" | "5" | "6" | "7-9";

export const HSK_LEVEL_META: Record<HSKLevel, { label: string; color: string; description: string }> = {
  "1":    { label: "HSK 1급", color: "from-emerald-500 to-teal-600", description: "기초 (150 단어)" },
  "2":    { label: "HSK 2급", color: "from-lime-500 to-green-600",   description: "초급 (300 단어)" },
  "3":    { label: "HSK 3급", color: "from-yellow-500 to-amber-600", description: "초중급 (600 단어)" },
  "4":    { label: "HSK 4급", color: "from-orange-500 to-red-600",   description: "중급 (1,200 단어)" },
  "5":    { label: "HSK 5급", color: "from-red-500 to-rose-600",     description: "중상급 (2,500 단어)" },
  "6":    { label: "HSK 6급", color: "from-fuchsia-500 to-purple-600", description: "고급 (5,000+ 단어)" },
  "7-9":  { label: "HSK 7~9급", color: "from-purple-600 to-indigo-700", description: "최고급 (11,000+ 단어)" },
};

export function normalizeHSKLevel(l?: string | null): HSKLevel {
  if (!l) return "3";
  const s = String(l).trim();
  if (s === "1" || s === "2" || s === "3" || s === "4" || s === "5" || s === "6" || s === "7-9") return s;
  return "3";
}

export interface HSKLesson {
  id: string;
  createdAt: number;
  updatedAt: number;

  hskLevel: HSKLevel;         // "3"
  unitNumber: string;         // "01"
  title: string;              // 한자 제목
  titlePinyin?: string;       // 병음
  titleKorean?: string;       // 한국어 제목
  subject: string;            // "중국어" 고정
  category?: string;          // e.g., "HSK 3급 · 실전 독해"

  // Preview
  previewQuestion: string;    // 학생용 워밍업 질문 (한국어)
  previewCards: Array<{ id: string; caption: string }>; // 이미지 캡션(선택)

  // Passage
  passageTitle: string;
  passageTitlePinyin?: string;
  passageTitleKorean?: string;
  passageParagraphs: HSKPassageParagraph[];

  // Vocabulary
  vocab: HSKVocabItem[];

  // Questions
  questions: HSKQuestion[];

  // Direct reading (직독직해)
  directReading: HSKDirectReadingItem[];
}

// ─── Storage / Events ─────────────────────────────
export const SGR_HSK_STORAGE_KEY = "sgrHSK_lessons";
export const SGR_HSK_EVENT = "sgrHSKUpdated";

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Empty factories ──────────────────────────────
export function emptyVocab(): HSKVocabItem {
  return { id: uid(), hanzi: "", pinyin: "", meaning: "" };
}
export function emptyPassageParagraph(): HSKPassageParagraph {
  return { id: uid(), hanzi: "", pinyin: "", korean: "" };
}
export function emptyQuestion(type: HSKQuestionType = "multiple_choice"): HSKQuestion {
  return { id: uid(), type, question: "", options: ["", "", "", ""], answer: 0 };
}
export function emptyDirectReading(): HSKDirectReadingItem {
  return { id: uid(), hanzi: "", pinyin: "", korean: "" };
}
export function emptyLesson(): HSKLesson {
  return {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hskLevel: "3",
    unitNumber: "01",
    title: "",
    subject: "중국어",
    category: "",
    previewQuestion: "",
    previewCards: [],
    passageTitle: "",
    passageParagraphs: [emptyPassageParagraph()],
    vocab: [],
    questions: [],
    directReading: [],
  };
}

// ─── Sample lesson (HSK 3급 예시) ─────────────────
export const SAMPLE_HSK_LESSON: HSKLesson = {
  id: "sample-hsk3-lesson-01",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  hskLevel: "3",
  unitNumber: "01",
  title: "我的一天",
  titlePinyin: "Wǒ de yì tiān",
  titleKorean: "나의 하루",
  subject: "중국어",
  category: "HSK 3급 · 일상 회화",
  previewQuestion: "당신의 하루 일과를 중국어로 어떻게 표현할까요?",
  previewCards: [
    { id: "c1", caption: "早上七点起床" },
    { id: "c2", caption: "上午在学校学习" },
    { id: "c3", caption: "晚上跟家人一起吃饭" },
  ],
  passageTitle: "我的一天",
  passageTitlePinyin: "Wǒ de yì tiān",
  passageTitleKorean: "나의 하루",
  passageParagraphs: [
    {
      id: "p1",
      hanzi: "我每天早上七点起床。起床以后我先刷牙，洗脸，然后吃早饭。",
      pinyin: "Wǒ měi tiān zǎoshang qī diǎn qǐchuáng. Qǐchuáng yǐhòu wǒ xiān shuāyá, xǐliǎn, ránhòu chī zǎofàn.",
      korean: "저는 매일 아침 7시에 일어납니다. 일어난 후에 먼저 이를 닦고, 세수를 하고, 그런 다음 아침을 먹습니다.",
    },
    {
      id: "p2",
      hanzi: "早饭以后我坐公共汽车去学校。我在学校学习汉语和数学。中午在学校的食堂吃午饭。",
      pinyin: "Zǎofàn yǐhòu wǒ zuò gōnggòng qìchē qù xuéxiào. Wǒ zài xuéxiào xuéxí Hànyǔ hé shùxué. Zhōngwǔ zài xuéxiào de shítáng chī wǔfàn.",
      korean: "아침 식사 후에 저는 버스를 타고 학교에 갑니다. 학교에서 중국어와 수학을 공부합니다. 정오에는 학교 식당에서 점심을 먹습니다.",
    },
    {
      id: "p3",
      hanzi: "下午四点放学以后，我常常跟朋友一起打篮球。晚上做作业，看书，然后十点睡觉。",
      pinyin: "Xiàwǔ sì diǎn fàngxué yǐhòu, wǒ chángcháng gēn péngyou yìqǐ dǎ lánqiú. Wǎnshang zuò zuòyè, kànshū, ránhòu shí diǎn shuìjiào.",
      korean: "오후 4시에 하교한 후에는 자주 친구와 함께 농구를 합니다. 저녁에는 숙제를 하고 책을 읽고, 그 다음 10시에 잠을 잡니다.",
    },
  ],
  vocab: [
    { id: "v1", hanzi: "起床",   pinyin: "qǐchuáng", meaning: "일어나다",   partOfSpeech: "동사" },
    { id: "v2", hanzi: "刷牙",   pinyin: "shuāyá",   meaning: "이를 닦다",  partOfSpeech: "동사" },
    { id: "v3", hanzi: "洗脸",   pinyin: "xǐliǎn",   meaning: "세수하다",   partOfSpeech: "동사" },
    { id: "v4", hanzi: "然后",   pinyin: "ránhòu",   meaning: "그런 다음",  partOfSpeech: "접속사" },
    { id: "v5", hanzi: "公共汽车", pinyin: "gōnggòng qìchē", meaning: "버스", partOfSpeech: "명사" },
    { id: "v6", hanzi: "食堂",   pinyin: "shítáng",  meaning: "식당",       partOfSpeech: "명사" },
    { id: "v7", hanzi: "放学",   pinyin: "fàngxué",  meaning: "하교하다",   partOfSpeech: "동사" },
    { id: "v8", hanzi: "常常",   pinyin: "chángcháng", meaning: "자주",     partOfSpeech: "부사" },
    { id: "v9", hanzi: "作业",   pinyin: "zuòyè",    meaning: "숙제",       partOfSpeech: "명사" },
    { id: "v10", hanzi: "睡觉",  pinyin: "shuìjiào", meaning: "잠자다",     partOfSpeech: "동사" },
  ],
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      question: "我每天早上几点起床？",
      questionPinyin: "Wǒ měi tiān zǎoshang jǐ diǎn qǐchuáng?",
      options: ["六点", "七点", "八点", "九点"],
      answer: 1,
      explanation: "본문 첫 문장 「我每天早上七点起床」 에서 7시.",
    },
    {
      id: "q2",
      type: "fill_blank",
      question: "早饭以后我坐 ___ 去学校。",
      answer: "公共汽车",
      explanation: "본문의 「坐公共汽车去学校」 참고.",
    },
    {
      id: "q3",
      type: "translation_zh_ko",
      question: "晚上做作业，看书，然后十点睡觉。",
      answer: "저녁에는 숙제를 하고 책을 읽고, 그 다음 10시에 잠을 잡니다.",
    },
    {
      id: "q4",
      type: "tone_pick",
      question: "「起床」 의 성조 조합은?",
      options: ["1성+3성", "3성+2성", "3성+2성(변조)", "2성+3성"],
      answer: 2,
      explanation: "qǐ(3성) + chuáng(2성). 뒤 음절이 2성이라 앞 3성은 그대로 3성이지만 실제 회화에서는 반3성으로 발음되는 경우가 많음.",
    },
  ],
  directReading: [
    {
      id: "d1",
      hanzi: "我 / 每天 / 早上七点 / 起床。",
      pinyin: "Wǒ / měi tiān / zǎoshang qī diǎn / qǐchuáng.",
      korean: "나 / 매일 / 아침 7시에 / 일어난다.",
      chunks: ["我", "每天", "早上七点", "起床"],
      grammarPoint: "시간 표현은 「时段 + 时刻」 순서. 每天 → 早上 → 七点.",
    },
    {
      id: "d2",
      hanzi: "起床以后 / 我 / 先刷牙，洗脸， / 然后 / 吃早饭。",
      pinyin: "Qǐchuáng yǐhòu / wǒ / xiān shuāyá, xǐliǎn, / ránhòu / chī zǎofàn.",
      korean: "일어난 후에 / 나는 / 먼저 이 닦고, 세수하고, / 그런 다음 / 아침을 먹는다.",
      chunks: ["起床以后", "我", "先刷牙，洗脸，", "然后", "吃早饭"],
      grammarPoint: "先~，然后~ : 시간·순서 접속사. 「먼저 A, 그다음 B」.",
    },
    {
      id: "d3",
      hanzi: "我 / 坐公共汽车 / 去 / 学校。",
      pinyin: "Wǒ / zuò gōnggòng qìchē / qù / xuéxiào.",
      korean: "나 / 버스를 타고 / 가다 / 학교에.",
      chunks: ["我", "坐公共汽车", "去", "学校"],
      grammarPoint: "연동문: 앞 동사 「坐(타다)」가 수단, 뒤 동사 「去(가다)」가 주 동작.",
    },
  ],
};

// ─── Persistence ──────────────────────────────────
function migrate(list: HSKLesson[]): HSKLesson[] {
  return list.map(l => ({
    ...l,
    hskLevel: normalizeHSKLevel((l as any).hskLevel),
    subject: l.subject || "중국어",
  }));
}

function initialSeed(): HSKLesson[] {
  return [SAMPLE_HSK_LESSON];
}

export function loadLessons(): HSKLesson[] {
  try {
    const raw = localStorage.getItem(SGR_HSK_STORAGE_KEY);
    if (!raw) return initialSeed();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialSeed();
    return migrate(parsed);
  } catch {
    return initialSeed();
  }
}

export function saveLessons(lessons: HSKLesson[]) {
  localStorage.setItem(SGR_HSK_STORAGE_KEY, JSON.stringify(lessons));
  window.dispatchEvent(new Event(SGR_HSK_EVENT));
  // 서버(Supabase)에 upsert (fire-and-forget)
  saveLessonsToServer(lessons);
}

// ─── Server sync (upsert-by-id: SGR Class의 전체 교체 버그 재발 방지) ──
let _saveOneToServer: ((lesson: HSKLesson) => Promise<void>) | null = null;
let _deleteFromServer: ((id: string) => Promise<void>) | null = null;
let _loadFromServer: (() => Promise<HSKLesson[]>) | null = null;

export function registerServerUpserter(fn: (lesson: HSKLesson) => Promise<void>) {
  _saveOneToServer = fn;
}
export function registerServerDeleter(fn: (id: string) => Promise<void>) {
  _deleteFromServer = fn;
}
export function registerServerLoader(fn: () => Promise<HSKLesson[]>) {
  _loadFromServer = fn;
}

/**
 * 개별 upsert. 저장은 항상 per-id 로만 이루어지므로 다른 클라이언트가
 * 갖고 있는 레슨을 실수로 삭제하지 않는다.
 */
function saveLessonsToServer(lessons: HSKLesson[]) {
  if (!_saveOneToServer) return;
  for (const l of lessons) {
    _saveOneToServer(l).catch(err => {
      console.warn(`[SGR HSK] 서버 upsert 실패 (id=${l.id}):`, err);
    });
  }
}

/** 서버에서 명시적으로 레슨 삭제 */
export async function deleteLesson(id: string): Promise<void> {
  const next = loadLessons().filter(l => l.id !== id);
  localStorage.setItem(SGR_HSK_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SGR_HSK_EVENT));
  if (_deleteFromServer) {
    try {
      await _deleteFromServer(id);
    } catch (err) {
      console.warn(`[SGR HSK] 서버 삭제 실패 (id=${id}):`, err);
    }
  }
}

/** 서버에서 레슨 병합 로드 */
export async function syncFromServer(): Promise<HSKLesson[]> {
  if (!_loadFromServer) return loadLessons();
  try {
    const serverLessons = await _loadFromServer();
    if (serverLessons && serverLessons.length > 0) {
      // 서버 데이터를 진실의 원본으로 갱신
      localStorage.setItem(SGR_HSK_STORAGE_KEY, JSON.stringify(serverLessons));
      window.dispatchEvent(new Event(SGR_HSK_EVENT));
      return serverLessons;
    }
  } catch (err) {
    console.warn("[SGR HSK] 서버 로드 실패 (로컬 사용):", err);
  }
  return loadLessons();
}

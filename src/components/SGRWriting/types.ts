// ===================== SGR Writing Types =====================
// Based on gemini-code-1784514468160.py structure

export interface WritingWord {
  id: string;
  hint: string;      // 첫 글자 힌트 (예: "e")
  kr: string;        // 한국어 뜻 (예: "말을 잘하는, 웅변조의")
  ans: string;       // 정답 (예: "eloquent")
}

export interface WritingExpression {
  id: string;
  title: string;     // 표현 제목 (예: "1. side with [명사] = ~의 편을 들다")
  note: string;      // NOTE 설명
  exampleKr: string; // 연습 한글 문장
  exampleEn: string; // 연습 영어 문장
  challengeKr: string; // 도전 한글 문장
  challengeEn: string; // 도전 영어 문장 (정답)
}

export interface WritingReview {
  id: string;
  kr: string;        // 한글 문장
  guide: string;     // 어순 가이드
  ans: string;       // 영어 정답
}

export interface SGRWritingLesson {
  id: string;
  createdAt: number;
  updatedAt: number;
  
  // 메타
  unitNumber: string;    // "05"
  title: string;         // "CHAPTER 5 | EASY WRITING"
  bookTitle: string;     // "Animal Farm"
  notice: string;        // 공지 텍스트
  quoteEn: string;       // 인용문 영어
  quoteKr: string;       // 인용문 한글
  
  // 1페이지: 핵심 단어
  words: WritingWord[];
  
  // 1페이지: 오늘의 핵심 표현
  keyExpression: string;   // "be forced to [동사원형] = 어쩔 수 없이 ~해야만 하다"
  previewEn: string;       // 미리보기 영어 문장
  previewKr: string;       // 미리보기 한글 문장
  
  // 2페이지: 주요 표현 학습 (3개)
  expressions: WritingExpression[];
  
  // 3페이지: 복습 응용 영작 (3개)
  reviews: WritingReview[];
  
  // 과목/카테고리
  subject: string;
  category?: string;
}

export const SGR_WRITING_STORAGE_KEY = "sgrWriting_lessons";
export const SGR_WRITING_EVENT = "sgrWritingUpdated";

export function loadWritingLessons(): SGRWritingLesson[] {
  try {
    const raw = localStorage.getItem(SGR_WRITING_STORAGE_KEY);
    if (!raw) return [SAMPLE_WRITING_LESSON];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [SAMPLE_WRITING_LESSON];
  } catch {
    return [SAMPLE_WRITING_LESSON];
  }
}

export function saveWritingLessons(lessons: SGRWritingLesson[]) {
  localStorage.setItem(SGR_WRITING_STORAGE_KEY, JSON.stringify(lessons));
  window.dispatchEvent(new Event(SGR_WRITING_EVENT));
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyWritingLesson(): SGRWritingLesson {
  return {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    unitNumber: "01",
    title: "CHAPTER 1 | EASY WRITING",
    bookTitle: "Book Title",
    notice: "공지: 내용을 입력하세요",
    quoteEn: "",
    quoteKr: "",
    words: [emptyWritingWord()],
    keyExpression: "",
    previewEn: "",
    previewKr: "",
    expressions: [emptyWritingExpression(), emptyWritingExpression(), emptyWritingExpression()],
    reviews: [emptyWritingReview(), emptyWritingReview(), emptyWritingReview()],
    subject: "영어",
    category: "",
  };
}

export function emptyWritingWord(): WritingWord {
  return { id: uid(), hint: "", kr: "", ans: "" };
}

export function emptyWritingExpression(): WritingExpression {
  return {
    id: uid(),
    title: "",
    note: "",
    exampleKr: "",
    exampleEn: "",
    challengeKr: "",
    challengeEn: "",
  };
}

export function emptyWritingReview(): WritingReview {
  return { id: uid(), kr: "", guide: "", ans: "" };
}

// Sample lesson based on Animal Farm Chapter 5
export const SAMPLE_WRITING_LESSON: SGRWritingLesson = {
  id: "sample-animal-farm-ch5",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  unitNumber: "05",
  title: "CHAPTER 5 | EASY WRITING",
  bookTitle: "Animal Farm",
  notice: "공지: 스노볼의 추방과 풍차 건설 계획의 찬탈",
  quoteEn: "“Snowball was set upon by nine enormous dogs and was forced to flee for his life.”",
  quoteKr: "(스노볼은 아홉 마리의 거대한 개들에게 기습을 당해 목숨을 건지기 위해 달아나야만 했습니다.)",
  words: [
    { id: "w1", hint: "e", kr: "말을 잘하는, 웅변조의", ans: "eloquent" },
    { id: "w2", hint: "c", kr: "설득력 있는, 강력한", ans: "compelling" },
    { id: "w3", hint: "f", kr: "진영, 파벌, 분파", ans: "faction" },
    { id: "w4", hint: "p", kr: "구실, 핑계, 빌미", ans: "pretext" },
    { id: "w5", hint: "e", kr: "추방하다, 쫓아내다", ans: "expel" },
  ],
  keyExpression: "be forced to [동사원형] = 어쩔 수 없이 ~해야만 하다 / ~하도록 강요당하다",
  previewEn: "Snowball was forced to flee for his life.",
  previewKr: "스노볼은 목숨을 건지기 위해 어쩔 수 없이 달아나야만 했습니다.",
  expressions: [
    {
      id: "e1",
      title: "1. side with [명사] = ~의 편을 들다 / ~를 지지하다",
      note: "NOTE: 논쟁이나 갈등 상황에서 특정 인물, 그룹, 또는 의견을 옹호하고 연대할 때 자주 사용됩니다.",
      exampleKr: "[연습] 의견 대립 중에 그는 그의 오랜 동료의 편을 들었습니다.",
      exampleEn: "→ During the disagreement, he sided with his long-time colleague.",
      challengeKr: "[도전] 일부 동물들은 풍차 건설에 대해 스노볼의 편을 들었습니다.",
      challengeEn: "Some animals sided with Snowball on the windmill construction.",
    },
    {
      id: "e2",
      title: "2. carry out [명사] = (계획·명령 등을) 실행하다 / 수행하다",
      note: "NOTE: 약속된 일, 지시사항, 혹은 체계적인 계획을 실제로 행동에 옮겨 완성해 낼 때 씁니다.",
      exampleKr: "[연습] 그들은 아묵운 불평 없이 우리의 지시를 실행했습니다.",
      exampleEn: "→ They carried out our instructions without any complaints.",
      challengeKr: "[도전] 나폴옹은 스노볼의 원래 풍차 계획을 실행하겠다고 전격 발표했습니다.",
      challengeEn: "Napoleon suddenly announced that they would carry out Snowball's original windmill plan.",
    },
    {
      id: "e3",
      title: "3. come to an end = 끝나다 / 막을 내리다",
      note: "NOTE: 일정한 기간, 행사, 상태, 혹은 긴 논쟁이 자연스럽거나 갑작스럽게 종결되는 상황을 묘사합니다.",
      exampleKr: "[연습] 수년간의 분쟁이 마침내 평화롭게 막을 날렀습니다.",
      exampleEn: "→ Years of conflict finally came to an end peacefully.",
      challengeKr: "[도전] 동물들의 자유롭고 민주적인 토론은 완전히 막을 날렀습니다.",
      challengeEn: "The free and democratic debates of the animals came to an end completely.",
    },
  ],
  reviews: [
    {
      id: "r1",
      kr: "1. 우리는 그 비양심적인 계획을 어쩔 수 없이 실행해야만 했습니다.",
      guide: "(어순 가이드: 우리는 어쩔 수 없이 실행해야만 했습니다 / 그 비양심적인 계획을)",
      ans: "1. We were forced to carry out the unscrupulous plan.",
    },
    {
      id: "r2",
      kr: "2. 그 관료주의적인 조직은 마침내 그들의 오랜 프로젝트를 끝냈습니다.",
      guide: "(어순 가이드: 그 관료주의적인 조직은 / 마침내 / 그들의 오랜 프로젝트를 끝냈습니다)",
      ans: "2. The bureaucratic organization finally brought their long project to an end.",
    },
    {
      id: "r3",
      kr: "3. 그녀는 그 논쟁에서 아무의 편도 들지 않기로 결정했습니다.",
      guide: "(어순 가이드: 그녀는 결정했습니다 / 편을 들지 않기로 / 아무의 / 그 논쟁에서)",
      ans: "3. She decided not to side with anyone in the disagreement.",
    },
  ],
  subject: "영어",
  category: "중등영어1-1",
};

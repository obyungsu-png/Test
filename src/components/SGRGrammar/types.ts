// ===================== SGR Grammar Types =====================
// 수업용 SGR Grammar 자료. 하나의 단원(Unit)은 여러 컨텐츠 유형을 갖는다.
// - Textbook: 여러 유형(첫 유형: "문법 writing")
// - Workbook: 여러 유형(첫 유형: "문법 writing workbook", 추후 구현)

export type GrammarKind = "textbook" | "workbook";

/** Textbook 유형 슬러그 */
export type TextbookTypeId = "grammar_writing" | string;

/** Workbook 유형 슬러그 */
export type WorkbookTypeId = "grammar_writing_workbook" | string;

// ─── 문법 Writing (Textbook) ────────────────────────
// A/B 등 설명 섹션 + 문장 훈련(MCQ) + 문장 정확하게 쓰기(배열+오류수정)
// + 통문장 실제로 쓰기(우리말 → 영어)

/** 한글 해설 + 영어 예문 + 밑줄/굵게 표시 정보 */
export interface GrammarExample {
  id: string;
  /** 한국어 해석 */
  korean: string;
  /** 영어 문장. **bold**, __underline__ 인라인 마킹 지원 */
  english: string;
  /** 아래에 다는 짧은 라벨 (ex. "동사의 목적어") */
  note?: string;
}

/** 우측 규칙 박스 (여러 줄) */
export interface RuleBox {
  id: string;
  title?: string;
  /** 규칙 리스트. 각 라인은 굵게/이탤릭 인라인 마킹 지원 */
  lines: string[];
}

export interface ExplanationSection {
  id: string;
  /** 섹션 라벨 (A, B, C …) — 자동 생성해도 됨 */
  label: string;
  /** 섹션 제목 (예: "동명사의 기능") */
  title: string;
  /** 섹션 요약 설명 (한국어) */
  summary: string;
  /** 예문 그룹 */
  examples: GrammarExample[];
  /** 우측 규칙 박스 (선택) */
  rules: RuleBox[];
}

/** 문장 속 문법 훈련하기 - 괄호 선택형 */
export interface BracketMcqItem {
  id: string;
  /** 문장. 정답이 될 후보를 (A / B) 형태로 표기 */
  sentence: string;
  /** 선택지 배열 (2개 이상) */
  options: string[];
  /** 정답 인덱스 */
  answer: number;
  /** 부가 설명 (선택) */
  note?: string;
}

/** 알맞은 말 골라 알맞은 형태로 쓰기 */
export interface WordBankFillItem {
  id: string;
  /** 문장, 빈칸은 ___ 사용 */
  sentence: string;
  /** 정답 단어 (원형) */
  baseWord: string;
  /** 정답 형태 (예: "going", "not doing") */
  answer: string;
}

/** 주어진 말 바르게 배열하여 쓰기 */
export interface RearrangeItem {
  id: string;
  /** 한글 뜻 */
  korean: string;
  /** 도입부(주어진 부분). 예: "The topic", "He" */
  starter?: string;
  /** 후미 힌트 (선택). 예: "with your unwashed hands." */
  ending?: string;
  /** 배열해야 할 단어/구 (원본 배열) */
  words: string[];
  /** 정답 문장 */
  answer: string;
}

/** 틀린 부분 고쳐 문장 다시 쓰기 */
export interface ErrorCorrectionItem {
  id: string;
  /** 한글 뜻 */
  korean: string;
  /** 틀린 원문 */
  wrong: string;
  /** 정답 문장 */
  answer: string;
}

/** 통문장 실제로 쓰기 (우리말 → 영어) */
export interface TranslationItem {
  id: string;
  /** 한글 문장 */
  korean: string;
  /** 사용 가능 힌트 단어 배열 */
  hints: string[];
  /** 정답 영어 문장 */
  answer: string;
}

/** 빈칸에 알맞은 말 넣어 대화 완성하기 (자유 형식 대화) */
export interface DialogueLine {
  id: string;
  speaker: string;
  /** ___ 로 빈칸 표시 */
  text: string;
  /** 빈칸 정답 순서대로 */
  answers: string[];
}

export interface DialogueBlock {
  id: string;
  intro?: string;
  lines: DialogueLine[];
  /** 각 화자별 힌트 단어 그룹 (선택) */
  hintGroups?: Array<{ label: string; words: string[] }>;
}

// ─── 문법 Writing 컨텐츠 ────────────────────────────
export interface GrammarWritingContent {
  typeId: "grammar_writing";
  /** 설명 섹션(A, B, …) */
  sections: ExplanationSection[];
  /** 문장 속 문법 훈련하기 */
  bracketMcq: BracketMcqItem[];
  /** 알맞은 말 골라 알맞은 형태로 쓰기 */
  wordBankFill: {
    bank: string[];
    items: WordBankFillItem[];
  };
  /** 문장 정확하게 쓰기 - 배열 */
  rearrange: RearrangeItem[];
  /** 문장 정확하게 쓰기 - 오류 수정 */
  errorCorrection: ErrorCorrectionItem[];
  /** 통문장 실제로 쓰기 */
  translation: TranslationItem[];
  /** 빈칸에 알맞은 말 넣어 대화 완성하기 */
  dialogue?: DialogueBlock;
}

// ─── Textbook Content Union ─────────────────────────
export type TextbookContent = GrammarWritingContent; // 후속 유형 추가 시 union 확장

// ─── Workbook Content Union (placeholder) ───────────
export interface GrammarWritingWorkbookContent {
  typeId: "grammar_writing_workbook";
  /** 문법 writing workbook 세부 유형은 추후 정의 */
  notes?: string;
}
export type WorkbookContent = GrammarWritingWorkbookContent;

// ─── Unit / Lesson ──────────────────────────────────
export interface GrammarUnit {
  id: string;
  createdAt: number;
  updatedAt: number;
  unitNumber: string; // "15"
  unitTitle: string; // "동명사"
  /** 소제목 (선택) */
  subtitle?: string;
  textbook: {
    types: Array<{
      id: TextbookTypeId;
      label: string; // 예: "문법 writing"
      content: TextbookContent;
    }>;
  };
  workbook: {
    types: Array<{
      id: WorkbookTypeId;
      label: string; // 예: "문법 writing workbook"
      content: WorkbookContent;
    }>;
  };
}

// ─── uid + storage ──────────────────────────────────
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const STORAGE_KEY = "sgr_grammar_units_v1";
export const SGR_GRAMMAR_EVENT = "sgr-grammar-update";

export function loadUnits(): GrammarUnit[] {
  if (typeof window === "undefined") return [SAMPLE_UNIT];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [SAMPLE_UNIT];
    const parsed = JSON.parse(raw) as GrammarUnit[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [SAMPLE_UNIT];
  } catch {
    return [SAMPLE_UNIT];
  }
}

export function saveUnits(units: GrammarUnit[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
  window.dispatchEvent(new CustomEvent(SGR_GRAMMAR_EVENT));
}

// ─── Sample Unit (자리 채움용 · 실제 컨텐츠는 CMS에서 등록) ─
export const SAMPLE_UNIT: GrammarUnit = {
  id: "sample-unit-01",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  unitNumber: "01",
  unitTitle: "Sample 문법",
  subtitle: "구조 확인용 샘플 단원",
  textbook: {
    types: [
      {
        id: "grammar_writing",
        label: "문법 writing",
        content: {
          typeId: "grammar_writing",
          sections: [
            {
              id: uid(),
              label: "A",
              title: "핵심 문법의 기능",
              summary:
                "샘플 설명 — 실제 컨텐츠는 CMS에서 등록해주세요. 여기에는 문법 규칙과 사용 상황에 대한 요약을 작성합니다.",
              examples: [
                {
                  id: uid(),
                  korean: "예문 한글 해석을 여기에 입력하세요.",
                  english:
                    "This is a __sample__ English sentence with an **underlined** phrase.",
                  note: "샘플 라벨",
                },
              ],
              rules: [
                {
                  id: uid(),
                  title: "규칙 요약",
                  lines: [
                    "규칙 1 — 사용 상황을 간단히 서술",
                    "규칙 2 — 예외 사항을 표시",
                  ],
                },
              ],
            },
          ],
          bracketMcq: [
            {
              id: uid(),
              sentence: "( Sample / Samples ) is only a placeholder.",
              options: ["Sample", "Samples"],
              answer: 0,
            },
          ],
          wordBankFill: {
            bank: ["study", "write", "read"],
            items: [
              {
                id: uid(),
                sentence: "My plan is ___ hard this year.",
                baseWord: "study",
                answer: "studying",
              },
            ],
          },
          rearrange: [
            {
              id: uid(),
              korean: "샘플 배열 문제입니다.",
              starter: "The topic",
              words: ["is", "reading", "books"],
              answer: "The topic is reading books.",
            },
          ],
          errorCorrection: [
            {
              id: uid(),
              korean: "샘플 오류 수정 문제입니다.",
              wrong: "Make a choice of career is difficult.",
              answer: "Making a choice of career is difficult.",
            },
          ],
          translation: [
            {
              id: uid(),
              korean: "샘플 통문장 쓰기 문제입니다.",
              hints: ["the topic", "save", "energy"],
              answer: "The topic is saving energy.",
            },
          ],
        },
      },
    ],
  },
  workbook: {
    types: [
      {
        id: "grammar_writing_workbook",
        label: "문법 writing workbook",
        content: {
          typeId: "grammar_writing_workbook",
          notes:
            "Workbook 유형 상세 포맷은 추후 정의됩니다. Textbook을 먼저 등록해주세요.",
        },
      },
    ],
  },
};

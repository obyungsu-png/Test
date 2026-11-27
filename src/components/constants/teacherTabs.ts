// 교사·강사 과목 (한국학교) — 학생용 자료 외에 수업·채점·평가·숙제에 쓰는 자료를 모은다.
// 탭(콘텐츠 타입)별로 관리자 > "교사·강사 자료"에서 올린 파일이 표시되고,
// "SGR 수업 교재" 탭은 SGR Series 메뉴(Novels·Writing·Grammar·Voca)를 연다.

export const TEACHER_SUBJECT = "교사·강사";
export const TEACHER_SGR_TAB = "SGR 수업 교재";
export const TEACHER_TABS = ["수업 자료", TEACHER_SGR_TAB, "정답·해설", "평가·문제은행", "숙제·과제"];
/** 파일을 올리는 탭 (SGR 수업 교재는 SGR 관리 메뉴에서 따로 관리) */
export const TEACHER_FILE_TABS = TEACHER_TABS.filter((tab) => tab !== TEACHER_SGR_TAB);

// ─── 대상 학년 범위 ─────────────────────────────────
// 자료마다 과목 + 범위(전 학년 / 학교급 전체 / 한 학년)를 정해 올린다.
// 분류(category) 문자열: "국어 · 전 학년", "국어 · 초등 전체", "국어 · 초등 3학년"
export const TEACHER_AREAS = ["국어", "영어", "수학", "과학", "사회", "공통"];
export const TEACHER_STAGES = [
  { name: "초등", short: "초", grades: 6 },
  { name: "중등", short: "중", grades: 3 },
  { name: "고등", short: "고", grades: 3 },
];

export interface TeacherScope {
  area: string;
  /** null = 전 학년 */
  stage: string | null;
  /** null = 학교급 전체 */
  grade: number | null;
}

export const teacherScopeLabel = ({ stage, grade }: Omit<TeacherScope, "area">) =>
  !stage ? "전 학년" : grade ? `${stage} ${grade}학년` : `${stage} 전체`;

export const teacherCategory = (scope: TeacherScope) => `${scope.area} · ${teacherScopeLabel(scope)}`;

export function parseTeacherCategory(category: string): TeacherScope | null {
  const m = /^(.+?) · (?:전 학년|(초등|중등|고등) (?:전체|(\d+)학년))$/.exec(category || "");
  if (m) return { area: m[1], stage: m[2] || null, grade: m[3] ? Number(m[3]) : null };
  // 이전 분류 ("초등 국어", "전 과목 공통")
  const old = /^(초등|중등|고등) (.+)$/.exec(category || "");
  if (old) return { area: old[2], stage: old[1], grade: null };
  if (category === "전 과목 공통") return { area: "공통", stage: null, grade: null };
  return null;
}

/**
 * 고른 범위와 자료의 범위가 겹치면 보여 준다.
 * - 한 학년(초3)을 고르면: 초3 + 초등 전체 + 전 학년 자료
 * - 학교급(초등 전체)을 고르면: 초등 모든 학년 자료 + 전 학년 자료
 * - 전 학년을 고르면: 그 과목의 모든 자료
 */
export function teacherScopesOverlap(materialCategory: string, selectedCategory: string): boolean {
  const a = parseTeacherCategory(materialCategory);
  const b = parseTeacherCategory(selectedCategory);
  if (!a || !b) return materialCategory === selectedCategory;
  if (a.area !== b.area) return false;
  if (!a.stage || !b.stage) return true;
  if (a.stage !== b.stage) return false;
  return !a.grade || !b.grade || a.grade === b.grade;
}

/** 업로드 대상 학년 선택지 (전 학년 → 학교급 전체 → 학년) */
export function teacherScopeOptions(area: string): { category: string; label: string }[] {
  const options = [{ category: teacherCategory({ area, stage: null, grade: null }), label: "전 학년" }];
  for (const stage of TEACHER_STAGES) {
    options.push({ category: teacherCategory({ area, stage: stage.name, grade: null }), label: `${stage.name} 전체` });
    for (let g = 1; g <= stage.grades; g++) {
      options.push({ category: teacherCategory({ area, stage: stage.name, grade: g }), label: `${stage.name} ${g}학년` });
    }
  }
  return options;
}

/** 탭 안내 — 무엇을 올리는 곳인지 (사이트와 관리자 화면에 함께 표시) */
export const TEACHER_TAB_INFO: Record<string, { description: string; examples: string[]; upcoming?: string[] }> = {
  "수업 자료": {
    description: "수업 시간에 바로 쓰는 자료",
    examples: ["수업용 PPT", "판서 노트", "활동지·워크시트", "수업 지도안"],
  },
  [TEACHER_SGR_TAB]: {
    description: "SGR 수업용 교재 — 화면에 띄워 함께 읽고 풀어 보는 수업 자료",
    examples: ["Novels", "Writing", "Grammar", "Voca"],
  },
  "정답·해설": {
    description: "학생용 시험지·교재의 정답과 풀이",
    examples: ["정답지", "해설지", "서술형 채점 기준표"],
  },
  "평가·문제은행": {
    description: "시험을 직접 만들고 고칠 때 쓰는 원본과 문항",
    examples: ["시험지 원본(Word·한글)", "단원평가 문제은행", "쪽지시험", "수행평가 루브릭"],
  },
  "숙제·과제": {
    description: "숙제로 나눠 줄 과제지와 숙제 검사",
    examples: ["과제지", "단어 시험지", "오답 노트 양식"],
    upcoming: ["숙제 내기 (반·기한 지정)", "제출 현황 확인", "객관식 자동 채점", "서술형 첨삭·피드백"],
  },
};

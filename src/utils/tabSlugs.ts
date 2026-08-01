// 탭 표시명 ↔ URL 슬러그 변환 유틸리티 (HashRouter 라우팅용)

export const TAB_SLUG_MAP: Record<string, string> = {
  "국어": "korean",
  "단원별 요약": "unit-summary",
  "모의고사": "mock-exam",
  "직전 대비": "pre-exam",
  "우리학교 기출": "school-past",
  "보조자료": "resources",
  "SGR Novels": "sgr-novels",
  "Voca": "voca",
  "SGR Class": "sgr-class",
  "SGR Writing": "sgr-writing",
  "SGR Voca": "sgr-voca",
  "SGR Grammar": "sgr-grammar",
  "Subject": "subject",
  "전체보기": "all",
  "Key Notes": "key-notes",
  "Exam Questions": "exam-questions",
  "Practice Test": "practice-test",
  "Past Papers": "past-papers",
  "Practice Tests": "practice-tests",
  "Mock Exams": "mock-exams",
  "실전문제": "real-exam",
  "교과서 뽀개기": "textbook",
};

// 모드별 기본 탭 슬러그
export const MODE_DEFAULT_TAB_SLUG: Record<string, string> = {
  korean: "korean",
  international: "subject",
  cert: "all",
};

// 모드별 기본 탭 표시명
export const MODE_DEFAULT_TAB: Record<string, string> = {
  korean: "국어",
  international: "Subject",
  cert: "전체보기",
};

/** 탭 표시명 → 슬러그 (커스텀 탭은 encodeURIComponent 폴백) */
export function tabToSlug(tabName: string): string {
  return TAB_SLUG_MAP[tabName] || encodeURIComponent(tabName);
}

/** 슬러그 → 탭 표시명 (커스텀 탭은 decodeURIComponent 폴백) */
export function slugToTab(mode: string, slug: string | undefined): string {
  if (!slug) {
    return MODE_DEFAULT_TAB[mode] || "전체보기";
  }
  const entry = Object.entries(TAB_SLUG_MAP).find(([, s]) => s === slug);
  if (entry) return entry[0];
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** mode → { schoolType, isCertificationMode } 파생 */
export function modeToSchoolType(mode: string): {
  schoolType: "korean" | "international";
  isCertificationMode: boolean;
} {
  if (mode === "cert") {
    return { schoolType: "international", isCertificationMode: true };
  }
  if (mode === "international") {
    return { schoolType: "international", isCertificationMode: false };
  }
  return { schoolType: "korean", isCertificationMode: false };
}

/** schoolType + isCertificationMode → mode */
export function schoolTypeToMode(
  schoolType: "korean" | "international" | null,
  isCertificationMode: boolean
): string {
  if (isCertificationMode) return "cert";
  if (schoolType === "international") return "international";
  return "korean";
}

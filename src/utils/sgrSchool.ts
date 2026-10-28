// SGR Series 자료의 학교 구분 — 한국학교와 국제학교 SGR Series 는 자료를 공유하지 않는다.
// 저장소(localStorage·서버)는 같이 쓰되 자료마다 school 값으로 나누고,
// school 값이 없는 기존 자료는 한국학교 자료로 본다.

export type SGRSchool = "korean" | "international";

export const SGR_SCHOOL_LABEL: Record<SGRSchool, string> = {
  korean: "한국학교",
  international: "국제학교",
};

type Scoped = { school?: SGRSchool };

export function schoolOf(item: Scoped): SGRSchool {
  return item.school === "international" ? "international" : "korean";
}

/** 해당 학교 자료만 */
export function pickSchool<T extends Scoped>(items: T[], school: SGRSchool): T[] {
  return items.filter((x) => schoolOf(x) === school);
}

/** 모든 자료에 학교 표시 */
export function tagSchool<T extends Scoped>(items: T[], school: SGRSchool): T[] {
  return items.map((x) => (x.school === school ? x : { ...x, school }));
}

/** 전체 목록에서 해당 학교 자료만 scoped 로 교체하고, 다른 학교 자료는 그대로 둔다 */
export function replaceSchool<T extends Scoped>(all: T[], school: SGRSchool, scoped: T[]): T[] {
  return [...tagSchool(scoped, school), ...all.filter((x) => schoolOf(x) !== school)];
}

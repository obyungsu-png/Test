// 한국학교 고등 과학 (2022 개정 교육과정)
// 사이드바: 고등과학 › 고1(공통) · 고2(일반선택) · 고3(진로·융합선택) › 세부 과목
// 관리자 업로드의 학습 단계(고1·고2·고3)·세부 과목도 이 목록을 쓴다.

export const HIGH_SCIENCE_GROUP = "고등과학";

export interface SidebarSection {
  /** 소제목 (없으면 소제목 없이 과목만) */
  title?: string;
  /** tag: 과목 옆 작은 꼬리표 (예: 물리) */
  items: { name: string; tag?: string }[];
}

export const HIGH_SCIENCE_LEVELS: { level: string; hint: string; sections: SidebarSection[] }[] = [
  {
    level: "고1",
    hint: "공통",
    sections: [{ items: [{ name: "통합과학1" }, { name: "통합과학2" }, { name: "과학탐구실험" }] }],
  },
  {
    level: "고2",
    hint: "일반선택",
    sections: [{ items: [{ name: "물리학" }, { name: "화학" }, { name: "생명과학" }, { name: "지구과학" }] }],
  },
  {
    level: "고3",
    hint: "진로·융합선택",
    sections: [
      {
        title: "진로선택",
        items: [
          { name: "역학과 에너지", tag: "물리" },
          { name: "전자기와 양자", tag: "물리" },
          { name: "물질과 에너지", tag: "화학" },
          { name: "화학 반응의 세계", tag: "화학" },
          { name: "세포와 물질대사", tag: "생명" },
          { name: "생물의 유전", tag: "생명" },
          { name: "지구시스템과학", tag: "지구" },
          { name: "행성우주과학", tag: "지구" },
        ],
      },
      {
        title: "융합선택",
        items: [{ name: "과학의 역사와 문화" }, { name: "기후변화와 환경생태" }, { name: "융합과학 탐구" }],
      },
    ],
  },
];

/** 학습 단계 → 세부 과목 (getSubjectStructure 용) */
export const highScienceStructure = (): Record<string, string[]> =>
  Object.fromEntries(HIGH_SCIENCE_LEVELS.map((l) => [l.level, l.sections.flatMap((s) => s.items.map((i) => i.name))]));

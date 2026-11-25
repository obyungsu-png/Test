// 교사·강사 과목 (한국학교) — 학생용 자료 외에 수업·채점·평가·숙제에 쓰는 자료를 모은다.
// 탭(콘텐츠 타입)별로 관리자 > "교사·강사 자료"에서 올린 파일이 표시되고,
// "SGR 수업 교재" 탭은 SGR Series 메뉴(Novels·Writing·Grammar·Voca)를 연다.

export const TEACHER_SUBJECT = "교사·강사";
export const TEACHER_SGR_TAB = "SGR 수업 교재";
export const TEACHER_TABS = ["수업 자료", TEACHER_SGR_TAB, "정답·해설", "평가·문제은행", "숙제·과제"];
/** 파일을 올리는 탭 (SGR 수업 교재는 SGR 관리 메뉴에서 따로 관리) */
export const TEACHER_FILE_TABS = TEACHER_TABS.filter((tab) => tab !== TEACHER_SGR_TAB);

/** 사이드바·업로드에서 쓰는 과목 > 학년 구분 (학년 이름은 과목끼리 겹치지 않게) */
export const TEACHER_STRUCTURE: Record<string, string[]> = {
  국어: ["초등 국어", "중등 국어", "고등 국어"],
  영어: ["초등 영어", "중등 영어", "고등 영어"],
  수학: ["초등 수학", "중등 수학", "고등 수학"],
  과학: ["초등 과학", "중등 과학", "고등 과학"],
  사회: ["초등 사회", "중등 사회", "고등 사회"],
  공통: ["전 과목 공통"],
};

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

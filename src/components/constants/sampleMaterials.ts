import englishSampleExamPdf from "../../assets/samples/english-sample-exam.pdf?url";

// 시험보기·다운로드 동작 확인용 샘플 자료 (한국학교 > 영어 > 첫 탭 맨 위에 표시)
export const ENGLISH_SAMPLE_EXAM = {
  id: "sample-english-exam",
  title: "[샘플 PDF] 고1 영어 1학기 중간고사 대비 실전 모의고사 (12문제)",
  count: "[0]",
  isNew: true,
  isDefault: true,
  uploadData: {
    fileName: "english-sample-exam.pdf",
    fileType: "application/pdf",
    fileSize: 358256,
    fileData: englishSampleExamPdf,
  },
};

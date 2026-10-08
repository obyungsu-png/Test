import englishSampleExamPdf from "../../assets/samples/english-sample-exam.pdf?url";
import englishSampleExamDocx from "../../assets/samples/english-sample-exam.docx?url";

// 시험보기·다운로드 동작 확인용 샘플 자료 (한국학교 > 영어 > 첫 탭 맨 위에 표시)
export const ENGLISH_SAMPLE_EXAM = {
  id: "sample-english-exam",
  title: "[샘플 PDF·Word] 고1 영어 1학기 중간고사 대비 실전 모의고사 (12문제)",
  count: "[0]",
  isNew: true,
  isDefault: true,
  uploadData: {
    fileName: "english-sample-exam.pdf",
    fileType: "application/pdf",
    fileSize: 358256,
    fileData: englishSampleExamPdf,
  },
  // 다운로드 > Word 에서 내려주는 같은 내용의 Word 파일
  wordFile: {
    fileName: "english-sample-exam.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 17152,
    fileData: englishSampleExamDocx,
  },
};

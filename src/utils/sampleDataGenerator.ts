// LMS 샘플 데이터 생성기
import type { UploadedMaterial } from './lmsApi';

export function generateSampleMaterials(): UploadedMaterial[] {
  const samples: UploadedMaterial[] = [];
  
  // 한국학교 샘플 (국어, 영어, 수학, 과학, 사회)
  const koreanSubjects = [
    { subject: '국어', levels: ['전체', '중1', '중2', '중3', '고1', '고2', '고3'] },
    { subject: '영어', levels: ['전체', '중1', '중2', '중3', '고1', '고2', '고3'] },
    { subject: '수학', levels: ['전체', '중1', '중2', '중3', '고1', '고2', '고3'] },
    { subject: '과학', levels: ['전체', '중1', '중2', '중3', '고1', '고2', '고3'] },
    { subject: '사회', levels: ['전체', '중1', '중2', '중3', '고1', '고2', '고3'] },
  ];

  const contentTypes = ['시험지', '학습자료', '과제', '참고자료'];
  
  koreanSubjects.forEach(({ subject, levels }) => {
    levels.forEach(level => {
      contentTypes.forEach(contentType => {
        const sampleText = generateSampleContent(subject, level, contentType);
        const encoder = new TextEncoder();
        const bytes = encoder.encode(sampleText);
        const base64 = btoa(String.fromCharCode(...bytes));
        
        samples.push({
          id: `sample-korean-${subject}-${level}-${contentType}-${Date.now()}-${Math.random()}`,
          title: `[샘플] ${subject} ${contentType} - ${level}`,
          description: `${subject} ${level} 학생을 위한 ${contentType} 샘플입니다. 이 자료는 자동 생성된 샘플 데이터입니다.`,
          subject: subject,
          level: level,
          category: subject,
          schoolType: 'korean' as const,
          contentType: contentType,
          uploadDate: new Date().toISOString(),
          password: '',
          downloadCount: 0,
          fileSize: `${sampleText.length} bytes`,
          isUploaded: true,
          source: 'content-management' as const,
          uploadData: {
            fileName: `${subject}_${contentType}_${level}.txt`,
            fileType: 'text/plain',
            fileData: `data:text/plain;base64,${base64}`,
            fileSize: sampleText.length,
            uploadDate: new Date().toISOString(),
          },
        });
      });
    });
  });

  // 국제학교 샘플 (Math, Science, English, History, Geography)
  const intlSubjects = [
    { subject: 'Math', levels: ['All', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
    { subject: 'Science', levels: ['All', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
    { subject: 'English', levels: ['All', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
    { subject: 'History', levels: ['All', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
  ];

  const intlContentTypes = ['Test', 'Study Material', 'Assignment', 'Reference'];

  intlSubjects.forEach(({ subject, levels }) => {
    levels.forEach(level => {
      intlContentTypes.slice(0, 2).forEach(contentType => {
        const sampleText = generateSampleContent(subject, level, contentType);
        const encoder = new TextEncoder();
        const bytes = encoder.encode(sampleText);
        const base64 = btoa(String.fromCharCode(...bytes));
        
        samples.push({
          id: `sample-intl-${subject}-${level}-${contentType}-${Date.now()}-${Math.random()}`,
          title: `[Sample] ${subject} ${contentType} - ${level}`,
          description: `${subject} ${contentType} for ${level} students. This is auto-generated sample data.`,
          subject: subject,
          level: level,
          category: subject,
          schoolType: 'international' as const,
          contentType: contentType,
          uploadDate: new Date().toISOString(),
          password: '',
          downloadCount: 0,
          fileSize: `${sampleText.length} bytes`,
          isUploaded: true,
          source: 'content-management' as const,
          uploadData: {
            fileName: `${subject}_${contentType}_${level}.txt`,
            fileType: 'text/plain',
            fileData: `data:text/plain;base64,${base64}`,
            fileSize: sampleText.length,
            uploadDate: new Date().toISOString(),
          },
        });
      });
    });
  });

  // 인증시험 샘플 (SAT, TOEFL, ACT, IELTS)
  const certSubjects = ['SAT', 'TOEFL', 'ACT', 'IELTS'];
  const certContentTypes = ['Practice Test', 'Study Guide', 'Vocabulary'];

  certSubjects.forEach(subject => {
    certContentTypes.forEach(contentType => {
      const sampleText = generateSampleContent(subject, 'All', contentType);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(sampleText);
      const base64 = btoa(String.fromCharCode(...bytes));
      
      samples.push({
        id: `sample-cert-${subject}-${contentType}-${Date.now()}-${Math.random()}`,
        title: `[Sample] ${subject} ${contentType}`,
        description: `${subject} ${contentType} preparation material. Auto-generated sample data.`,
        subject: subject,
        level: 'All',
        category: subject,
        schoolType: 'certification' as const,
        contentType: contentType,
        uploadDate: new Date().toISOString(),
        password: '',
        downloadCount: 0,
        fileSize: `${sampleText.length} bytes`,
        isUploaded: true,
        source: 'content-management' as const,
        uploadData: {
          fileName: `${subject}_${contentType}.txt`,
          fileType: 'text/plain',
          fileData: `data:text/plain;base64,${base64}`,
          fileSize: sampleText.length,
          uploadDate: new Date().toISOString(),
        },
      });
    });
  });

  return samples;
}

function generateSampleContent(subject: string, level: string, contentType: string): string {
  const date = new Date().toLocaleDateString('ko-KR');
  
  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ${subject} ${contentType} - ${level}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 생성일: ${date}
📚 과목: ${subject}
📊 학년: ${level}
📄 유형: ${contentType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 샘플 콘텐츠

이 파일은 All My Exam LMS 시스템의 샘플 자료입니다.
실제 사용을 위해서는 직접 콘텐츠를 업로드하거나
시험지 작성 도구를 활용하여 새로운 자료를 생성하세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 주요 기능:

1. 콘텐츠 업로드
   - PDF, Word, 이미지 파일 지원
   - 비밀번호 보호 가능
   - 미리보기 및 다운로드 기능

2. 시험지 작성 도구
   - 객관식/주관식 문제 출제
   - PDF 자동 생성
   - TXT 미리보기 제공

3. 카테고리 관리
   - 과목별 분류
   - 학년별 필터링
   - 커스텀 카테고리 설정

4. 학습 자료 관리
   - 다운로드 횟수 추적
   - 학습 자료 검색
   - 태그 및 분류 기능

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 사용 팁:

• LMS 관리 > 콘텐츠 관리에서 새 자료를 추가하세요
• 시험지 작성 도구로 맞춤형 시험지를 생성하세요
• 비밀번호를 설정하여 자료를 보호하세요
• 카테고리를 커스터마이징하여 효율적으로 관리하세요

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 All My Exam - 학습을 더 스마트하게!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

export function getSampleDataStats(materials: UploadedMaterial[]): {
  total: number;
  bySchoolType: { [key: string]: number };
  bySubject: { [key: string]: number };
  byContentType: { [key: string]: number };
} {
  const bySchoolType: { [key: string]: number } = {};
  const bySubject: { [key: string]: number } = {};
  const byContentType: { [key: string]: number } = {};

  materials.forEach(material => {
    bySchoolType[material.schoolType] = (bySchoolType[material.schoolType] || 0) + 1;
    bySubject[material.subject] = (bySubject[material.subject] || 0) + 1;
    byContentType[material.contentType] = (byContentType[material.contentType] || 0) + 1;
  });

  return {
    total: materials.length,
    bySchoolType,
    bySubject,
    byContentType,
  };
}

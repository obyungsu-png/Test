// 해커스 보카 양식 다운로드 함수들
export const createHackersVocaTestSheet = (
  selectedWords: any[],
  selectedExam: string,
  dayRange: string
): string => {
  // 2단 레이아웃 생성
  const leftColumn: string[] = [];
  const rightColumn: string[] = [];
  
  selectedWords.forEach((word, i) => {
    const line = `${i + 1}. ${word.english}     ${'_'.repeat(30)}`;
    if (i < Math.ceil(selectedWords.length / 2)) {
      leftColumn.push(line);
    } else {
      rightColumn.push(line);
    }
  });
  
  // 열 길이 맞추기
  while (leftColumn.length < rightColumn.length) {
    leftColumn.push('');
  }
  
  let content = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  content += `                  해커스보카 ${selectedExam} 단어 시험지\n\n`;
  content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  content += `이름: ___________________      망각문제: ${selectedWords.length}개\n\n`;
  content += `출제 범위: ${dayRange}\n\n`;
  content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  content += `☞ 현직 영단어의 우리말 뜻을 빈칸에 쓰시오.\n\n`;
  
  // 2단 레이아웃
  const maxRows = Math.max(leftColumn.length, rightColumn.length);
  for (let i = 0; i < maxRows; i++) {
    const left = leftColumn[i] || '';
    const right = rightColumn[i] || '';
    content += `${left.padEnd(50)}    ${right}\n`;
  }
  
  content += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  content += `                  유학 커뮤니티 1위 고우해커스 goHackers.com\n`;
  content += `       저작권자의 동의없이 본 해커스자료 단어 시험지는 교육 목적 외로 배포를 금지합니다.\n\n`;
  content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  return content;
};

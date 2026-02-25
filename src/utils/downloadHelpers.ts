// 단어 시험지 다운로드 헬퍼 함수들

interface Word {
  english: string;
  korean: string;
  synonyms?: string;
}

export const downloadHackersVocaPDF = (
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string
) => {
  // 2단 레이아웃 생성 (왼쪽/오른쪽 절반씩)
  const halfCount = Math.ceil(selectedWords.length / 2);
  const leftColumn: string[] = [];
  const rightColumn: string[] = [];
  
  selectedWords.forEach((word, i) => {
    const number = i + 1;
    const line = `${number}. ${word.english}`;
    
    if (i < halfCount) {
      leftColumn.push(line);
    } else {
      rightColumn.push(line);
    }
  });
  
  // 열 길이 맞추기
  while (leftColumn.length < rightColumn.length) {
    leftColumn.push('');
  }
  while (rightColumn.length < leftColumn.length) {
    rightColumn.push('');
  }
  
  // 상단 배너
  let content = `╔═══════════════════════════════════════════════════════════════════════════════╗\n`;
  content += `║                                                                               ║\n`;
  content += `║          해커스 보카 단어 시험지                                              ║\n`;
  content += `║                                                                               ║\n`;
  content += `║   이름: ___________________      망각문제: ${selectedWords.length}개                          ║\n`;
  content += `║                                                                               ║\n`;
  content += `║   출제 범위: ${dayRange}                                                      ║\n`;
  content += `║                                                                               ║\n`;
  content += `╚═══════════════════════════════════════════════════════════════════════════════╝\n\n`;
  
  content += `※ 영단어의 우리말 뜻을 빈칸에 쓰세요.\n\n`;
  
  // 2단 레이아웃 (1-25 왼쪽, 26-50 오른쪽)
  const maxRows = Math.max(leftColumn.length, rightColumn.length);
  for (let i = 0; i < maxRows; i++) {
    const left = leftColumn[i] || '';
    const right = rightColumn[i] || '';
    const leftWithLine = left ? `${left.padEnd(30)} ${'_'.repeat(25)}` : ' '.repeat(55);
    const rightWithLine = right ? `${right.padEnd(30)} ${'_'.repeat(25)}` : '';
    
    content += `${leftWithLine}      ${rightWithLine}\n\n`;
  }
  
  // 하단 배너
  content += `\n╔═══════════════════════════════════════════════════════════════════════════════╗\n`;
  content += `║                                                                               ║\n`;
  content += `║             유학 커뮤니티 1위 고우해커스 goHackers.com                         ║\n`;
  content += `║                                                                               ║\n`;
  content += `║   저작권자의 동의없이 본 해커스자료 단어 시험지는 교육 목적 외로 배포를 금지합니다.   ║\n`;
  content += `║                                                                               ║\n`;
  content += `╚═══════════════════════════════════════════════════════════════════════════════╝\n`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `해커스보카_${selectedExam}_단어시험지_${dayRange}_${new Date().toISOString().split('T')[0]}.txt`;
  link.click();
};

export const downloadHackersVocaWord = (
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string
) => {
  // 2단 레이아웃 생성 (왼쪽/오른쪽 절반씩)
  const halfCount = Math.ceil(selectedWords.length / 2);
  const leftColumn: string[] = [];
  const rightColumn: string[] = [];
  
  selectedWords.forEach((word, i) => {
    const number = i + 1;
    const line = `${number}. ${word.english}`;
    
    if (i < halfCount) {
      leftColumn.push(line);
    } else {
      rightColumn.push(line);
    }
  });
  
  // 열 길이 맞추기
  while (leftColumn.length < rightColumn.length) {
    leftColumn.push('');
  }
  while (rightColumn.length < leftColumn.length) {
    rightColumn.push('');
  }
  
  // 상단 배너
  let content = `╔═══════════════════════════════════════════════════════════════════════════════╗\n`;
  content += `║                                                                               ║\n`;
  content += `║          해커스 보카 단어 시험지                                              ║\n`;
  content += `║                                                                               ║\n`;
  content += `║   이름: ___________________      망각문제: ${selectedWords.length}개                          ║\n`;
  content += `║                                                                               ║\n`;
  content += `║   출제 범위: ${dayRange}                                                      ║\n`;
  content += `║                                                                               ║\n`;
  content += `╚═══════════════════════════════════════════════════════════════════════════════╝\n\n`;
  
  content += `※ 영단어의 우리말 뜻을 빈칸에 쓰세요.\n\n`;
  
  // 2단 레이아웃 (1-25 왼쪽, 26-50 오른쪽)
  const maxRows = Math.max(leftColumn.length, rightColumn.length);
  for (let i = 0; i < maxRows; i++) {
    const left = leftColumn[i] || '';
    const right = rightColumn[i] || '';
    const leftWithLine = left ? `${left.padEnd(30)} ${'_'.repeat(25)}` : ' '.repeat(55);
    const rightWithLine = right ? `${right.padEnd(30)} ${'_'.repeat(25)}` : '';
    
    content += `${leftWithLine}      ${rightWithLine}\n\n`;
  }
  
  // 하단 배너
  content += `\n╔═══════════════════════════════════════════════════════════════════════════════╗\n`;
  content += `║                                                                               ║\n`;
  content += `║             유학 커뮤니티 1위 고우해커스 goHackers.com                         ║\n`;
  content += `║                                                                               ║\n`;
  content += `║   저작권자의 동의없이 본 해커스자료 단어 시험지는 교육 목적 외로 배포를 금지합니다.   ║\n`;
  content += `║                                                                               ║\n`;
  content += `╚═══════════════════════════════════════════════════════════════════════════════╝\n`;
  
  const blob = new Blob([content], { type: 'application/msword;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `해커스보카_${selectedExam}_단어시험지_${dayRange}_${new Date().toISOString().split('T')[0]}.doc`;
  link.click();
};

export const downloadHackersVocaHWP = (
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string
) => {
  // 2단 레이아웃 생성 (왼쪽/오른쪽 절반씩)
  const halfCount = Math.ceil(selectedWords.length / 2);
  const leftColumn: string[] = [];
  const rightColumn: string[] = [];
  
  selectedWords.forEach((word, i) => {
    const number = i + 1;
    const line = `${number}. ${word.english}`;
    
    if (i < halfCount) {
      leftColumn.push(line);
    } else {
      rightColumn.push(line);
    }
  });
  
  // 열 길이 맞추기
  while (leftColumn.length < rightColumn.length) {
    leftColumn.push('');
  }
  while (rightColumn.length < leftColumn.length) {
    rightColumn.push('');
  }
  
  // 상단 배너
  let content = `╔═══════════════════════════════════════════════════════════════════════════════╗\n`;
  content += `║                                                                               ║\n`;
  content += `║          해커스 보카 단어 시험지                                              ║\n`;
  content += `║                                                                               ║\n`;
  content += `║   이름: ___________________      망각문제: ${selectedWords.length}개                          ║\n`;
  content += `║                                                                               ║\n`;
  content += `║   출제 범위: ${dayRange}                                                      ║\n`;
  content += `║                                                                               ║\n`;
  content += `╚═══════════════════════════════════════════════════════════════════════════════╝\n\n`;
  
  content += `※ 영단어의 우리말 뜻을 빈칸에 쓰세요.\n\n`;
  
  // 2단 레이아웃 (1-25 왼쪽, 26-50 오른쪽)
  const maxRows = Math.max(leftColumn.length, rightColumn.length);
  for (let i = 0; i < maxRows; i++) {
    const left = leftColumn[i] || '';
    const right = rightColumn[i] || '';
    const leftWithLine = left ? `${left.padEnd(30)} ${'_'.repeat(25)}` : ' '.repeat(55);
    const rightWithLine = right ? `${right.padEnd(30)} ${'_'.repeat(25)}` : '';
    
    content += `${leftWithLine}      ${rightWithLine}\n\n`;
  }
  
  // 하단 배너
  content += `\n╔═══════════════════════════════════════════════════════════════════════════════╗\n`;
  content += `║                                                                               ║\n`;
  content += `║             유학 커뮤니티 1위 고우해커스 goHackers.com                         ║\n`;
  content += `║                                                                               ║\n`;
  content += `║   저작권자의 동의없이 본 해커스자료 단어 시험지는 교육 목적 외로 배포를 금지합니다.   ║\n`;
  content += `║                                                                               ║\n`;
  content += `╚═══════════════════════════════════════════════════════════════════════════════╝\n`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `해커스보카_${selectedExam}_단어시험지_${dayRange}_${new Date().toISOString().split('T')[0]}.hwp.txt`;
  link.click();
};
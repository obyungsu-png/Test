# 📚 VOCA 시스템 완전 패키지

Voca(단어 학습) 시스템의 모든 파일과 코드를 정리한 문서입니다.

---

## 📁 파일 구조

```
/components/
  ├── VocaPage.tsx              # 메인 페이지 (단어 시험 생성)
  ├── VocaManagement.tsx        # LMS 단어 관리 페이지
  ├── WordTest.tsx              # 단어 시험 컴포넌트
  ├── vocaWordSets.ts           # 7,500개 단어 자동 생성 (Fisher-Yates)
  └── VocaDownloadFunctions.tsx # 다운로드 함수 (미사용, 대체됨)

/utils/
  └── downloadHelpers.ts        # PDF/Word/HWP 다운로드 헬퍼 함수

/data/ (필요시 생성)
  └── vocaData.ts               # 단어 데이터 타입 정의 (선택사항)
```

---

## 🔧 주요 기능

### 1. **VocaPage.tsx** - 단어 시험 생성
- 5개 시험 교재 선택 (TOEFL, SAT, IELTS, ACT, TOEIC)
- DAY 1-30+ 범위 선택 (동적 확장 가능)
- 출제 문제수 설정:
  - 영어 → 한글 뜻 쓰기 (표제어/동의어)
  - 한글 뜻 → 영어 쓰기 (표제어/동의어)
  - 영영풀이 → 영어 쓰기 (SAT 전용)
- Step 1: 단어 선택 (검색/필터)
- Step 2: 다운로드 옵션
  - PDF 다운로드
  - Word 다운로드
  - HWP 다운로드
  - 미니 시험 (객관식/주관식/혼합)

### 2. **VocaManagement.tsx** - LMS 단어 관리
- 시험별 / Day별 단어 CRUD
- Day 이름 커스터마이징
- 일괄 입력 (텍스트 붙여넣기)
- CSV 업로드
- Excel 다운로드
- LocalStorage 기반 데이터 관리

### 3. **WordTest.tsx** - 미니 시험
- 객관식 문제 (4지선다)
- 주관식 문제 (직접 입력)
- 혼합형 문제
- 실시간 정답/오답 표시
- 오답 문제 재시도
- 사운드 효과 (정답/오답)

### 4. **vocaWordSets.ts** - 자동 단어 생성
- Fisher-Yates 셔플 알고리즘
- 시험별 7,500개 단어 풀
- DAY 1-30 자동 배분 (250단어/Day)
- 시험별 특성 반영:
  - TOEFL: 학술 단어
  - SAT: 고급 어휘 + 영영풀이
  - IELTS: 일상/학술 단어
  - ACT: 대학 수준 어휘
  - TOEIC: 비즈니스 단어

### 5. **downloadHelpers.ts** - 다운로드 함수
- `downloadHackersVocaPDF()` - PDF 생성
- `downloadHackersVocaWord()` - Word 문서 생성
- `downloadHackersVocaHWP()` - HWP 문서 생성

---

## 📦 필수 Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "motion": "^10.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "latest",
    "sonner": "^2.0.3"
  }
}
```

**Import 방식:**
```typescript
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "motion/react";
```

---

## 💾 LocalStorage 구조

### 1. `vocaWords` - 단어 데이터
```typescript
interface VocaWord {
  id: string;
  exam: 'TOEFL' | 'SAT' | 'IELTS' | 'ACT' | 'TOEIC';
  day: number; // 1-30+
  english: string;
  korean: string;
  definition?: string; // SAT 영영풀이
  synonyms: string; // 쉼표로 구분
}

// 예시
[
  {
    id: "1234567890",
    exam: "TOEFL",
    day: 1,
    english: "abandon",
    korean: "버리다, 포기하다",
    synonyms: "desert, forsake, leave"
  }
]
```

### 2. `vocaDayNames` - Day 이름 매핑
```typescript
interface DayNameMapping {
  [exam: string]: {
    [day: number]: string;
  };
}

// 예시
{
  "TOEFL": {
    1: "Day 1 - Basic Words",
    2: "Day 2 - Academic Terms",
    3: "Day 3"
  },
  "SAT": {
    1: "Week 1",
    2: "Week 2"
  }
}
```

---

## 🚀 설치 방법

### Step 1: 파일 복사
1. `/components/VocaPage.tsx` 복사
2. `/components/VocaManagement.tsx` 복사
3. `/components/WordTest.tsx` 복사
4. `/components/vocaWordSets.ts` 복사
5. `/utils/downloadHelpers.ts` 복사

### Step 2: 라우팅 설정
```typescript
// App.tsx or Router
import { VocaPage } from "./components/VocaPage";
import { VocaManagement } from "./components/VocaManagement";

// LMS 콘텐츠 관리 탭에 추가
<Tabs>
  <TabsContent value="voca">
    <VocaManagement />
  </TabsContent>
</Tabs>

// 메인 페이지 또는 별도 라우트
<Route path="/voca" element={<VocaPage />} />
```

### Step 3: 초기 데이터 생성 (선택사항)
VocaManagement 페이지에서:
1. 시험 선택 (예: TOEFL)
2. Day 선택 (예: Day 1)
3. "7500단어 자동 생성" 버튼 클릭
4. 모든 시험에 대해 반복

---

## 📝 사용 가이드

### VocaManagement (LMS 관리자용)

#### 1. 단어 추가 (개별)
```
1. 시험 선택: TOEFL
2. Day 선택: Day 1
3. 영어 단어 입력
4. 한글 뜻 입력
5. (선택) 영영풀이 입력 (SAT만)
6. (선택) 동의어 입력 (쉼표로 구분)
7. "추가" 버튼 클릭
```

#### 2. 단어 일괄 입력
```
1. "일괄 입력" 버튼 클릭
2. 형식: 영어단어 | 한글뜻 | 동의어
   예시:
   abandon | 버리다 | desert, forsake
   ability | 능력 | capability, capacity
3. "저장" 버튼 클릭
```

#### 3. CSV 업로드
```
CSV 형식:
english,korean,synonyms,definition
abandon,버리다,"desert,forsake",to leave permanently
ability,능력,"capability,capacity",the power to do something

1. CSV 파일 준비
2. "CSV 업로드" 버튼 클릭
3. 파일 선택
```

#### 4. Day 이름 변경
```
1. Day 옆의 "편집" 아이콘 클릭
2. 새 이름 입력 (예: "Week 1 - Basics")
3. 체크 아이콘 클릭
```

#### 5. 새 Day 추가
```
1. "새 Day 추가" 버튼 클릭
2. Day 31, 32... 순서로 추가됨
3. 단어 추가 시작
```

### VocaPage (학생/선생님용)

#### 1. 시험지 생성
```
Step 1: 교재 선택
- TOEFL / SAT / IELTS / ACT / TOEIC 중 선택

Step 2: 출제범위 선택
- 개별 Day 선택 또는 전체선택
- 예: Day 1, 3-5, 7-8

Step 3: 출제 문제수 설정
- 영어 → 한글 뜻 쓰기
  └ 표제어: 10문제
  └ 동의어: 5문제
- 한글 뜻 → 영어 쓰기
  └ 표제어: 10문제
  └ 동의어: 5문제
- (SAT) 영영풀이 → 영어 쓰기
  └ 표제어: 10문제
  └ 동의어: 5문제

Step 4: 시험 문제 미리 만들기
- 출제 단어 선택/해제
- 검색으로 특정 단어 찾기

Step 5: 다운로드 또는 미니 시험
- PDF 다운로드
- Word 다운로드
- HWP 다운로드
- 미니 시험 시작 (객관식/주관식/혼합)
```

#### 2. 미니 시험 보기
```
1. "미니 시험 시작" 클릭
2. 시험 유형 선택:
   - 객관식 테스트 (4지선다)
   - 주관식 테스트 (직접 입력)
   - 혼합형 테스트
3. 문제 풀이
4. 틀린 문제 재시도
5. 다시 풀기
```

---

## 🎨 UI 컴포넌트

### 사용된 Shadcn UI 컴포넌트
- `Button` - 버튼
- `Input` - 입력 필드
- `Textarea` - 텍스트 영역
- `Tabs` / `TabsList` / `TabsContent` - 탭
- `Card` / `CardContent` / `CardHeader` - 카드
- `Dialog` - 모달
- `Badge` - 뱃지
- `ScrollArea` - 스크롤 영역

### Lucide Icons
```typescript
import {
  Plus, Trash2, Edit2, Save, X, Search,
  BookOpen, Upload, Download, 
  FileSpreadsheet, FileText,
  GraduationCap, Award, Globe, BookOpenCheck, Library
} from "lucide-react";
```

---

## 🔄 데이터 동기화

### Event System
```typescript
// 단어 업데이트 이벤트
window.dispatchEvent(new Event('vocaWordsUpdated'));
window.addEventListener('vocaWordsUpdated', () => {
  // 데이터 리로드
});

// Day 이름 업데이트 이벤트
window.dispatchEvent(new Event('vocaDayNamesUpdated'));
window.addEventListener('vocaDayNamesUpdated', () => {
  // Day 이름 리로드
});
```

### 데이터 접근 함수
```typescript
// VocaManagement.tsx에서 export
export const getVocaWords = (): VocaWord[] => {
  const stored = localStorage.getItem('vocaWords');
  return stored ? JSON.parse(stored) : [];
};

export const saveVocaWords = (words: VocaWord[]) => {
  localStorage.setItem('vocaWords', JSON.stringify(words));
  window.dispatchEvent(new Event('vocaWordsUpdated'));
};

export const getDayNames = (): DayNameMapping => {
  const stored = localStorage.getItem('vocaDayNames');
  return stored ? JSON.parse(stored) : {};
};

export const saveDayNames = (names: DayNameMapping) => {
  localStorage.setItem('vocaDayNames', JSON.stringify(names));
  window.dispatchEvent(new Event('vocaDayNamesUpdated'));
};

export const getMaxDay = (words: VocaWord[], exam: string): number => {
  const examWords = words.filter(w => w.exam === exam);
  if (examWords.length === 0) return 30;
  return Math.max(...examWords.map(w => w.day), 30);
};
```

---

## 🎯 주요 알고리즘

### 1. Fisher-Yates 셔플 (vocaWordSets.ts)
```typescript
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(seededRandom() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = 
    [shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled;
}
```

### 2. 객관식 문제 생성 (WordTest.tsx)
```typescript
const generateTestOptions = (
  correctAnswer: string, 
  allWords: any[], 
  seed: number
) => {
  // 정답 단어 찾기
  const currentWord = allWords.find(w => w.definition === correctAnswer);
  
  // 오답 3개 선택
  const incorrectOptions = allWords
    .filter(w => w.word !== currentWord?.word)
    .sort(() => seededRandom() - 0.5)
    .slice(0, 3)
    .map(w => w.word);
  
  // 정답 + 오답 3개 섞기
  const allOptions = [currentWord?.word, ...incorrectOptions];
  return allOptions.sort(() => seededRandom() - 0.5);
};
```

### 3. 단어 필터링 및 선택
```typescript
const getAvailableWords = () => {
  const selectedDays = getSelectedDays();
  return allWords.filter(
    (word) => word.exam === selectedExam && 
              selectedDays.includes(word.day)
  );
};

const getHeadwordCount = () => {
  return getAvailableWords().length;
};

const getSynonymCount = () => {
  return getAvailableWords().reduce((total, word) => {
    if (word.synonyms && word.synonyms.trim()) {
      const synonyms = word.synonyms.split(',')
        .map(s => s.trim())
        .filter(s => s);
      return total + synonyms.length;
    }
    return total;
  }, 0);
};
```

---

## 🔊 사운드 효과 (WordTest.tsx)

```typescript
// Web Audio API를 사용한 사운드 생성
const playSound = (isCorrect: boolean) => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (isCorrect) {
    // 정답: 밝은 2음 (C5 -> E5)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } else {
    // 오답: 낮은 단음
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  }
};
```

---

## 📊 통계 및 분석

### 출제 가능 문제수 계산
```typescript
const availableWordsCount = getHeadwordCount(); // 표제어
const availableSynonymsCount = getSynonymCount(); // 동의어
const maxQuestions = availableWordsCount + availableSynonymsCount;
```

### 진행률 표시
```typescript
const completedCount = Object.values(testAnswers).filter(Boolean).length;
const totalQuestions = selectedWords.length;
const progress = (completedCount / totalQuestions) * 100;
```

---

## ⚙️ 설정 및 커스터마이징

### 1. 시험 종류 추가
```typescript
// VocaManagement.tsx
const exams = ['TOEFL', 'SAT', 'IELTS', 'ACT', 'TOEIC', 'NEW_EXAM'];

// vocaWordSets.ts
export const examWordSets: ExamWordSets = {
  // ...기존 시험들
  NEW_EXAM: {
    words: [...],
    seed: 67890
  }
};
```

### 2. Day 개수 변경
```typescript
// 기본값: 30 Days
// 동적으로 확장 가능 (사용자가 "새 Day 추가" 클릭)
const maxDay = getMaxDay(words, selectedExam); // 자동 계산
```

### 3. 문제수 제한 변경
```typescript
// VocaPage.tsx
<p className="text-xs text-gray-500 mt-2">
  * 한 번에 최대 400문제 출제 가능
</p>

// 제한 제거 또는 변경 가능
```

### 4. 색상 테마 변경
```typescript
// examData의 color 속성 변경
const examData = [
  {
    name: "TOEFL",
    color: "#B3E5FC", // 밝은 청록색
    // ...
  }
];
```

---

## 🐛 트러블슈팅

### 1. LocalStorage 데이터 초기화
```javascript
// 브라우저 콘솔에서 실행
localStorage.removeItem('vocaWords');
localStorage.removeItem('vocaDayNames');
location.reload();
```

### 2. 단어가 표시되지 않음
```typescript
// 1. localStorage 확인
console.log(JSON.parse(localStorage.getItem('vocaWords')));

// 2. 시험과 Day가 일치하는지 확인
console.log(words.filter(w => w.exam === 'TOEFL' && w.day === 1));

// 3. 이벤트 리스너 확인
window.addEventListener('vocaWordsUpdated', () => {
  console.log('Words updated!');
});
```

### 3. 다운로드 안 됨
```typescript
// downloadHelpers.ts 함수 확인
// Blob 생성 및 링크 클릭 확인
const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = 'filename.txt';
link.click();
```

### 4. 미니 시험 문제 생성 안 됨
```typescript
// selectedWords 확인
console.log('Selected words:', selectedWords);

// wordSelections 상태 확인
console.log('Word selections:', wordSelections);

// 필터링 로직 확인
const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
```

---

## 📚 예시 데이터

### 단어 샘플 (TOEFL Day 1)
```json
[
  {
    "id": "1",
    "exam": "TOEFL",
    "day": 1,
    "english": "abandon",
    "korean": "버리다, 포기하다",
    "synonyms": "desert, forsake, leave, quit"
  },
  {
    "id": "2",
    "exam": "TOEFL",
    "day": 1,
    "english": "ability",
    "korean": "능력",
    "synonyms": "capability, capacity, competence"
  },
  {
    "id": "3",
    "exam": "TOEFL",
    "day": 1,
    "english": "abolish",
    "korean": "폐지하다",
    "synonyms": "eliminate, eradicate, annul"
  }
]
```

### SAT 단어 샘플 (영영풀이 포함)
```json
[
  {
    "id": "101",
    "exam": "SAT",
    "day": 1,
    "english": "aberration",
    "korean": "일탈, 변칙",
    "definition": "a departure from what is normal or expected",
    "synonyms": "deviation, anomaly, irregularity"
  },
  {
    "id": "102",
    "exam": "SAT",
    "day": 1,
    "english": "abhor",
    "korean": "혐오하다",
    "definition": "to regard with disgust and hatred",
    "synonyms": "detest, loathe, despise"
  }
]
```

---

## 🚀 업그레이드 아이디어

### 1. 서버 연동
- LocalStorage → Database (MySQL, MongoDB)
- 사용자별 진도 관리
- 멀티 디바이스 동기화

### 2. AI 기능
- 자동 문장 생성 (단어 활용)
- 발음 연습 (Speech Recognition)
- 맞춤형 복습 추천

### 3. 게임화
- 레벨 시스템
- 배지 및 업적
- 리더보드
- 연속 학습 스트릭

### 4. 고급 통계
- 학습 시간 추적
- 정답률 분석
- 약한 단어 리스트
- 복습 알림

### 5. 공유 기능
- 단어장 공유
- 시험지 템플릿 공유
- 학급 관리 (선생님용)

---

## 📄 라이센스 및 크레딧

**개발자:** N Study Hub Team  
**버전:** 2.0  
**최종 업데이트:** 2024-12-02

### 사용된 기술:
- React 18
- TypeScript
- Motion (Framer Motion)
- Lucide Icons
- Sonner (Toast)
- Shadcn UI
- Web Audio API
- LocalStorage API

---

## 📞 지원

문제가 발생하거나 질문이 있으면:
1. GitHub Issues
2. 이메일: support@nstudyhub.com
3. 고객 지원 채팅

---

**🎉 Voca 시스템을 성공적으로 구축하세요!**

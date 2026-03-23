// Voca 데이터 마이그레이션: localStorage → Supabase
import { saveVocaWords, saveDayNames } from '../components/VocaManagement';
import { generateWordsForDay } from '../components/vocaWordSets';
import { toast } from 'sonner@2.0.3';

export interface VocaWord {
  id: string;
  exam: string;
  day: number;
  english: string;
  korean: string;
  definition?: string;
  synonyms: string;
}

export interface DayNameMapping {
  [exam: string]: {
    [day: number]: string;
  };
}

// localStorage에서 모든 단어 가져오기 (동기)
export function getLocalStorageWords(): VocaWord[] {
  const stored = localStorage.getItem('vocaWords');
  return stored ? JSON.parse(stored) : [];
}

// localStorage에서 Day 이름 가져오기 (동기)
export function getLocalStorageDayNames(): DayNameMapping {
  const stored = localStorage.getItem('vocaDayNames');
  return stored ? JSON.parse(stored) : {};
}

// 7,500개 샘플 단어 + 한국학교 초등영어 60개 생성
export function generateAllSampleWords(): VocaWord[] {
  const exams: string[] = ['TOEFL', 'SAT', 'IELTS', 'ACT', 'TOEIC'];
  const sampleWords: VocaWord[] = [];

  // 인증시험 샘플 (5개 시험 × 30일 × 50단어)
  exams.forEach((exam) => {
    for (let day = 1; day <= 30; day++) {
      const dayWords = generateWordsForDay(exam, day);
      
      dayWords.forEach((word, index) => {
        sampleWords.push({
          id: `${exam}-${day}-${index}-${Date.now()}`,
          exam: exam,
          day: day,
          english: word.english,
          korean: word.korean,
          definition: (word as any).definition,
          synonyms: word.synonyms,
        });
      });
    }
  });

  // 한국학교 초등영어 전학년 (Day 1~12: 1학년 1학기 ~ 6학년 2학기)
  const krExam = 'KR-초등영어';
  for (let day = 1; day <= 12; day++) {
    const dayWords = generateWordsForDay(krExam, day);
    dayWords.forEach((word, index) => {
      sampleWords.push({
        id: `${krExam}-${day}-${index}-${Date.now()}`,
        exam: krExam,
        day: day,
        english: word.english,
        korean: word.korean,
        definition: (word as any).definition,
        synonyms: word.synonyms,
      });
    });
  }

  return sampleWords;
}

// localStorage → Supabase 마이그레이션
export async function migrateLocalStorageToSupabase(): Promise<{
  success: boolean;
  wordCount: number;
  error?: string;
}> {
  try {
    console.log('🚀 Starting migration from localStorage to Supabase...');

    // 1. localStorage에서 데이터 가져오기
    const localWords = getLocalStorageWords();
    const localDayNames = getLocalStorageDayNames();

    console.log(`📦 Found ${localWords.length} words in localStorage`);
    console.log(`📛 Found ${Object.keys(localDayNames).length} exam day name mappings`);

    // 2. Supabase에 저장
    if (localWords.length > 0) {
      await saveVocaWords(localWords);
      console.log(`✅ Migrated ${localWords.length} words to Supabase`);
    }

    if (Object.keys(localDayNames).length > 0) {
      await saveDayNames(localDayNames);
      console.log(`✅ Migrated day names to Supabase`);
    }

    return {
      success: true,
      wordCount: localWords.length,
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      wordCount: 0,
      error: String(error),
    };
  }
}

// 7,500개 샘플 단어를 Supabase에 저장
export async function uploadSampleWordsToSupabase(): Promise<{
  success: boolean;
  wordCount: number;
  error?: string;
}> {
  try {
    console.log('🚀 Generating and uploading sample words to Supabase...');

    const sampleWords = generateAllSampleWords();
    console.log(`📦 Generated ${sampleWords.length} sample words (5 exams × 30 days × 50 words + 초등영어 전학년 300단어)`);

    await saveVocaWords(sampleWords);
    console.log(`✅ Successfully uploaded ${sampleWords.length} words to Supabase`);

    // 초등영어 Day 이름도 함께 저장 (1학년~6학년)
    const { KR_ELEM_DAY_NAMES } = await import('../components/vocaWordSets');
    const existingDayNames = JSON.parse(localStorage.getItem('vocaDayNames') || '{}');
    const mergedDayNames = { ...existingDayNames, ...KR_ELEM_DAY_NAMES };
    await saveDayNames(mergedDayNames);
    console.log('✅ Saved KR-초등영어 day names');

    return {
      success: true,
      wordCount: sampleWords.length,
    };
  } catch (error) {
    console.error('❌ Sample words upload failed:', error);
    return {
      success: false,
      wordCount: 0,
      error: String(error),
    };
  }
}

// localStorage 데이터 삭제 (마이그레이션 완료 후)
export function clearLocalStorage(): void {
  localStorage.removeItem('vocaWords');
  localStorage.removeItem('vocaDayNames');
  console.log('🗑️ Cleared localStorage voca data');
}

// 데이터 통계 조회
export function getDataStats(words: VocaWord[]): {
  totalWords: number;
  byExam: { [exam: string]: number };
  byDay: { [exam: string]: { [day: number]: number } };
} {
  const byExam: { [exam: string]: number } = {};
  const byDay: { [exam: string]: { [day: number]: number } } = {};

  words.forEach((word) => {
    // Exam별 카운트
    byExam[word.exam] = (byExam[word.exam] || 0) + 1;

    // Day별 카운트
    if (!byDay[word.exam]) {
      byDay[word.exam] = {};
    }
    byDay[word.exam][word.day] = (byDay[word.exam][word.day] || 0) + 1;
  });

  return {
    totalWords: words.length,
    byExam,
    byDay,
  };
}
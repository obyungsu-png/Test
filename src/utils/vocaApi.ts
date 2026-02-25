// Voca API - Supabase 서버와 통신
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3`;

interface VocaWord {
  id: string;
  exam: 'TOEFL' | 'SAT' | 'IELTS' | 'ACT' | 'TOEIC';
  day: number;
  english: string;
  korean: string;
  definition?: string;
  synonyms: string;
}

interface DayNameMapping {
  [exam: string]: {
    [day: number]: string;
  };
}

// 모든 단어 조회
export async function fetchVocaWords(): Promise<VocaWord[]> {
  try {
    const response = await fetch(`${API_BASE}/voca/words`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch words: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.words || [];
  } catch (error) {
    console.error('Error fetching voca words:', error);
    throw error;
  }
}

// 단어 저장 (전체 교체)
export async function saveVocaWords(words: VocaWord[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ words }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save words: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully saved voca words to server');
  } catch (error) {
    console.error('Error saving voca words:', error);
    throw error;
  }
}

// 단어 일괄 추가
export async function bulkAddVocaWords(words: VocaWord[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/words/bulk-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ words }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to bulk add words: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully bulk added words to server');
  } catch (error) {
    console.error('Error bulk adding words:', error);
    throw error;
  }
}

// 단어 삭제
export async function deleteVocaWord(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/words/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete word: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully deleted word from server');
  } catch (error) {
    console.error('Error deleting word:', error);
    throw error;
  }
}

// 단어 수정
export async function updateVocaWord(id: string, word: Partial<VocaWord>): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/words/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update word: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully updated word on server');
  } catch (error) {
    console.error('Error updating word:', error);
    throw error;
  }
}

// Day 이름 조회
export async function fetchDayNames(): Promise<DayNameMapping> {
  try {
    const response = await fetch(`${API_BASE}/voca/day-names`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch day names: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.dayNames || {};
  } catch (error) {
    console.error('Error fetching day names:', error);
    throw error;
  }
}

// Day 이름 저장
export async function saveDayNames(dayNames: DayNameMapping): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/day-names`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ dayNames }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save day names: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully saved day names to server');
  } catch (error) {
    console.error('Error saving day names:', error);
    throw error;
  }
}
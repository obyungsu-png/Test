import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner@2.0.3";
import { Plus, Trash2, Edit2, Save, X, Search, BookOpen, Upload, Download, FileSpreadsheet, FileText, CloudUpload, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Textarea } from "./ui/textarea";
import { generateWordsForDay } from "./vocaWordSets";
import * as vocaApi from "../utils/vocaApi";
import { migrateLocalStorageToSupabase, uploadSampleWordsToSupabase, getDataStats } from "../utils/vocaMigration";

export interface VocaWord {
  id: string;
  exam: 'TOEFL' | 'SAT' | 'IELTS' | 'ACT' | 'TOEIC';
  day: number; // 1-30+
  english: string;
  korean: string;
  definition?: string; // 영영풀이 (SAT 전용)
  synonyms: string; // 쉼표로 구분
}

// Day 이름 매핑 인터페이스
export interface DayNameMapping {
  [exam: string]: {
    [day: number]: string;
  };
}

// Supabase에서 Day 이름 매핑 가져오기
export const getDayNames = async (): Promise<DayNameMapping> => {
  try {
    return await vocaApi.fetchDayNames();
  } catch (error) {
    console.error('Failed to fetch day names from server, using localStorage fallback:', error);
    const stored = localStorage.getItem('vocaDayNames');
    return stored ? JSON.parse(stored) : {};
  }
};

// Supabase에 Day 이름 매핑 저장
export const saveDayNames = async (names: DayNameMapping) => {
  try {
    await vocaApi.saveDayNames(names);
    // 로컬에도 백업 저장
    localStorage.setItem('vocaDayNames', JSON.stringify(names));
    window.dispatchEvent(new Event('vocaDayNamesUpdated'));
  } catch (error) {
    console.error('Failed to save day names to server:', error);
    toast.error('서버 저장 실패. 로컬에만 저장됩니다.');
    localStorage.setItem('vocaDayNames', JSON.stringify(names));
    window.dispatchEvent(new Event('vocaDayNamesUpdated'));
  }
};

// 최대 Day 번호 가져오기
export const getMaxDay = (words: VocaWord[], exam: string): number => {
  const examWords = words.filter(w => w.exam === exam);
  if (examWords.length === 0) return 30;
  return Math.max(...examWords.map(w => w.day), 30);
};

// Supabase에서 단어 데이터 가져오기
export const getVocaWords = async (): Promise<VocaWord[]> => {
  try {
    return await vocaApi.fetchVocaWords();
  } catch (error) {
    console.error('Failed to fetch words from server, using localStorage fallback:', error);
    const stored = localStorage.getItem('vocaWords');
    return stored ? JSON.parse(stored) : [];
  }
};

// Supabase에 단어 데이터 저장
export const saveVocaWords = async (words: VocaWord[]) => {
  try {
    await vocaApi.saveVocaWords(words);
    // 로컬에도 백업 저장
    localStorage.setItem('vocaWords', JSON.stringify(words));
    window.dispatchEvent(new Event('vocaWordsUpdated'));
  } catch (error) {
    console.error('Failed to save words to server:', error);
    toast.error('서버 저장 실패. 로컬에만 저장됩니다.');
    localStorage.setItem('vocaWords', JSON.stringify(words));
    window.dispatchEvent(new Event('vocaWordsUpdated'));
  }
};

export function VocaManagement() {
  const [words, setWords] = useState<VocaWord[]>([]);
  const [selectedExam, setSelectedExam] = useState<'TOEFL' | 'SAT' | 'IELTS' | 'ACT' | 'TOEIC'>('TOEFL');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ english: "", korean: "", definition: "", synonyms: "" });
  const [newWord, setNewWord] = useState({ english: "", korean: "", definition: "", synonyms: "" });
  const [loading, setLoading] = useState(false);
  
  // 일괄 입력 & 업로드 모달
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [uploadMode, setUploadMode] = useState<"manual" | "csv">("manual");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Day 이름 관리
  const [dayNames, setDayNames] = useState<DayNameMapping>({});
  const [editingDayName, setEditingDayName] = useState<number | null>(null);
  const [dayNameInput, setDayNameInput] = useState("");
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  
  // 마이그레이션 모달
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  const exams = ['TOEFL', 'SAT', 'IELTS', 'ACT', 'TOEIC'];
  const maxDay = getMaxDay(words, selectedExam);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  useEffect(() => {
    loadWords();
    loadDayNames();
    
    // Day 이름 업데이트 이벤트 리스너
    const handleDayNamesUpdate = () => loadDayNames();
    window.addEventListener('vocaDayNamesUpdated', handleDayNamesUpdate);
    return () => window.removeEventListener('vocaDayNamesUpdated', handleDayNamesUpdate);
  }, []);

  const loadWords = async () => {
    setLoading(true);
    try {
      const fetchedWords = await getVocaWords();
      setWords(fetchedWords);
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('단어 로딩 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };
  
  const loadDayNames = async () => {
    try {
      const names = await getDayNames();
      setDayNames(names);
    } catch (error) {
      console.error('Error loading day names:', error);
    }
  };
  
  // Day 이름 가져오기 헬퍼 함수
  const getDayName = (exam: string, day: number): string => {
    return dayNames[exam]?.[day] || `Day ${day}`;
  };
  
  // Day 이름 수정
  const handleSaveDayName = async () => {
    if (!dayNameInput.trim()) {
      toast.error("Day 이름을 입력해주세요.");
      return;
    }
    
    const newDayNames = { ...dayNames };
    if (!newDayNames[selectedExam]) {
      newDayNames[selectedExam] = {};
    }
    newDayNames[selectedExam][editingDayName!] = dayNameInput.trim();
    
    setDayNames(newDayNames);
    await saveDayNames(newDayNames);
    setEditingDayName(null);
    setDayNameInput("");
    toast.success("Day 이름이 변경되었습니다.");
  };
  
  // 새 Day 추가
  const handleAddNewDay = () => {
    const newDay = maxDay + 1;
    setSelectedDay(newDay);
    setShowAddDayModal(false);
    toast.success(`Day ${newDay}가 추가되었습니다. 단어를 추가해주세요.`);
  };

  const filteredWords = words.filter(
    (word) =>
      word.exam === selectedExam &&
      word.day === selectedDay &&
      (searchTerm === "" ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.korean.includes(searchTerm))
  );

  const handleAddWord = async () => {
    if (!newWord.english.trim() || !newWord.korean.trim()) {
      toast.error("영어 단어와 한글 뜻을 입력해주세요.");
      return;
    }

    const word: VocaWord = {
      id: Date.now().toString(),
      exam: selectedExam,
      day: selectedDay,
      english: newWord.english.trim(),
      korean: newWord.korean.trim(),
      definition: newWord.definition?.trim(),
      synonyms: newWord.synonyms.trim(),
    };

    const updatedWords = [...words, word];
    setWords(updatedWords);
    await saveVocaWords(updatedWords);
    setNewWord({ english: "", korean: "", definition: "", synonyms: "" });
    toast.success("단어가 추가되었습니다.");
  };

  const handleEditWord = (word: VocaWord) => {
    setEditingId(word.id);
    setEditForm({
      english: word.english,
      korean: word.korean,
      definition: word.definition || "",
      synonyms: word.synonyms,
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.english.trim() || !editForm.korean.trim()) {
      toast.error("영어 단어와 한글 뜻을 입력해주세요.");
      return;
    }

    const updatedWords = words.map((word) =>
      word.id === editingId
        ? {
            ...word,
            english: editForm.english.trim(),
            korean: editForm.korean.trim(),
            definition: editForm.definition?.trim(),
            synonyms: editForm.synonyms.trim(),
          }
        : word
    );

    setWords(updatedWords);
    await saveVocaWords(updatedWords);
    setEditingId(null);
    toast.success("단어가 수정되었습니다.");
  };

  const handleDeleteWord = async (id: string) => {
    const updatedWords = words.filter((word) => word.id !== id);
    setWords(updatedWords);
    await saveVocaWords(updatedWords);
    toast.success("단어가 삭제되었습니다.");
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) {
      toast.error("단어 데이터를 입력해주세요.");
      return;
    }

    const lines = bulkText.trim().split('\n');
    const newWords: VocaWord[] = [];
    let errorCount = 0;

    lines.forEach((line, index) => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length < 2) {
        errorCount++;
        return;
      }

      const [english, korean, definition = "", synonyms = ""] = parts;
      if (english && korean) {
        newWords.push({
          id: `${Date.now()}-${index}`,
          exam: selectedExam,
          day: selectedDay,
          english: english.trim(),
          korean: korean.trim(),
          definition: definition.trim(),
          synonyms: synonyms.trim(),
        });
      } else {
        errorCount++;
      }
    });

    if (newWords.length === 0) {
      toast.error("추가할 수 있는 단어가 없습니다.");
      return;
    }

    const updatedWords = [...words, ...newWords];
    setWords(updatedWords);
    await saveVocaWords(updatedWords);
    setBulkText("");
    setShowBulkModal(false);
    
    toast.success(`${newWords.length}개의 단어가 추가되었습니다.${errorCount > 0 ? ` (${errorCount}개 오류)` : ''}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newWords: VocaWord[] = [];
      let errorCount = 0;

      // Skip header row
      lines.slice(1).forEach((line, index) => {
        if (!line.trim()) return;
        
        const parts = line.split(/[,\t]/).map(p => p.trim().replace(/"/g, ''));
        if (parts.length < 2) {
          errorCount++;
          return;
        }

        const [english, korean, definition = "", synonyms = ""] = parts;
        if (english && korean) {
          newWords.push({
            id: `${Date.now()}-${index}`,
            exam: selectedExam,
            day: selectedDay,
            english: english.trim(),
            korean: korean.trim(),
            definition: definition.trim(),
            synonyms: synonyms.trim(),
          });
        } else {
          errorCount++;
        }
      });

      if (newWords.length === 0) {
        toast.error("추가할 수 있는 단어가 없습니다.");
        return;
      }

      const updatedWords = [...words, ...newWords];
      setWords(updatedWords);
      saveVocaWords(updatedWords);
      setShowBulkModal(false);
      
      toast.success(`${newWords.length}개의 단어가 추가되었습니다.${errorCount > 0 ? ` (${errorCount}개 오류)` : ''}`);
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const template = `영어,한글,영영풀이,유의어
abandon,버리다,desert; leave
abundant,풍부한,plentiful; ample
achieve,성취하다,accomplish; attain`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `단어_업로드_양식_${selectedExam}_DAY${selectedDay}.csv`;
    link.click();
    toast.success("양식 파일이 다운로드되었습니다.");
  };

  const handleExportWords = () => {
    if (filteredWords.length === 0) {
      toast.error("내보낼 단어가 없습니다.");
      return;
    }

    const csvContent = [
      '영어,한글,영영풀이,유의어',
      ...filteredWords.map(word => `${word.english},${word.korean},${word.definition},${word.synonyms}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `단어목록_${selectedExam}_DAY${selectedDay}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(`${filteredWords.length}개 단어가 내보내졌습니다.`);
  };

  const handleGenerateSampleWords = async () => {
    const confirm = window.confirm('7,500개의 샘플 단어를 생성하시겠습니까?\n\n포함 내용:\n• TOEFL, SAT, IELTS, ACT, TOEIC (5개 시험)\n• 각 시험별 DAY 1-30 (30일)\n• 각 Day별 50개 단어\n\n이 작업은 몇 초 소요될 수 있습니다.');
    
    if (!confirm) return;

    setLoading(true);
    toast.loading('샘플 단어 생성 중...', { id: 'generate-sample' });

    try {
      const result = await uploadSampleWordsToSupabase();
      
      if (result.success) {
        await loadWords(); // 다시 로드
        toast.success(`✅ ${result.wordCount}개의 샘플 단어가 Supabase에 저장되었습니다!`, { id: 'generate-sample' });
      } else {
        toast.error(`❌ 샘플 단어 생성 실패: ${result.error}`, { id: 'generate-sample' });
      }
    } catch (error) {
      toast.error(`❌ 오류 발생: ${String(error)}`, { id: 'generate-sample' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllSampleWords = async () => {
    if (window.confirm('생성된 샘플 단어를 모두 삭제하시겠습니까?')) {
      // ID 패턴으로 샘플 단어 식별 (EXAM-DAY-INDEX-TIMESTAMP 형식)
      const filteredWords = words.filter(word => {
        const idParts = word.id.split('-');
        // 샘플 단어는 4개 부분으로 구성됨 (예: TOEFL-1-0-1234567890)
        return idParts.length !== 4 || !exams.includes(idParts[0]);
      });
      
      const deletedCount = words.length - filteredWords.length;
      setWords(filteredWords);
      await saveVocaWords(filteredWords);
      toast.success(`${deletedCount}개의 샘플 단어가 삭제되었습니다.`);
    }
  };

  const handleMigrateToSupabase = async () => {
    const confirm = window.confirm('localStorage의 단어 데이터를 Supabase로 마이그레이션하시겠습니까?\n\n이 작업은 기존 데이터를 덮어씁니다.');
    
    if (!confirm) return;

    setLoading(true);
    toast.loading('마이그레이션 중...', { id: 'migrate' });

    try {
      const result = await migrateLocalStorageToSupabase();
      
      if (result.success) {
        await loadWords(); // 다시 로드
        toast.success(`✅ ${result.wordCount}개의 단어가 Supabase로 마이그레이션되었습니다!`, { id: 'migrate' });
      } else {
        toast.error(`❌ 마이그레이션 실패: ${result.error}`, { id: 'migrate' });
      }
    } catch (error) {
      toast.error(`❌ 오류 발생: ${String(error)}`, { id: 'migrate' });
    } finally {
      setLoading(false);
    }
  };

  const handleShowStats = () => {
    const stats = getDataStats(words);
    
    let message = `📊 단어 통계\n\n총 단어: ${stats.totalWords}개\n\n시험별 단어 수:\n`;
    
    Object.entries(stats.byExam).forEach(([exam, count]) => {
      message += `• ${exam}: ${count}개\n`;
    });

    alert(message);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-cyan-600" />
          <h1 className="text-2xl font-bold text-gray-800">단어 관리</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setShowBulkModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            일괄 입력/업로드
          </Button>
          <Button
            onClick={handleGenerateSampleWords}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={loading}
          >
            <CloudUpload className="w-4 h-4 mr-2" />
            샘플 생성 (7,500개)
          </Button>
          <Button
            onClick={handleMigrateToSupabase}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            <Cloud className="w-4 h-4 mr-2" />
            localStorage → Supabase
          </Button>
          <Button
            onClick={handleShowStats}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            📊 통계 보기
          </Button>
          <Button
            onClick={handleDeleteAllSampleWords}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            샘플 삭제
          </Button>
        </div>
      </div>

      {/* 시험 및 Day 선택 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시험 선택
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-cyan-500 focus:outline-none"
            >
              {exams.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DAY 선택
            </label>
            <div className="flex gap-2">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:border-cyan-500 focus:outline-none"
              >
                {days.map((day) => {
                  const isCustomDay = day > 30;
                  return (
                    <option 
                      key={day} 
                      value={day}
                      style={isCustomDay ? { color: '#ef4444', fontWeight: 'bold' } : {}}
                    >
                      {getDayName(selectedExam, day)} {isCustomDay ? '(추가됨)' : ''}
                    </option>
                  );
                })}
              </select>
              <Button
                onClick={() => {
                  setEditingDayName(selectedDay);
                  setDayNameInput(getDayName(selectedExam, selectedDay));
                }}
                variant="outline"
                size="sm"
                className="px-3"
                title="Day 이름 변경"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowAddDayModal(true)}
                variant="outline"
                size="sm"
                className="px-3 border-red-300 text-red-600 hover:bg-red-50"
                title="새 Day 추가"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="단어 검색..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 새 단어 추가 */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border-2 border-cyan-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            새 단어 추가 ({selectedExam} - {getDayName(selectedExam, selectedDay)})
          </h2>
          {selectedDay > 30 && (
            <Button
              onClick={() => {
                setEditingDayName(selectedDay);
                setDayNameInput(getDayName(selectedExam, selectedDay));
              }}
              variant="outline"
              size="sm"
              className="px-3"
              title="Day 이름 변경"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              이름 변경
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">영어 단어 *</label>
            <Input
              value={newWord.english}
              onChange={(e) => setNewWord({ ...newWord, english: e.target.value })}
              placeholder="예: abandon"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">한글 뜻 *</label>
            <Input
              value={newWord.korean}
              onChange={(e) => setNewWord({ ...newWord, korean: e.target.value })}
              placeholder="예: 버리다, 포기하다"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">영영풀이 (선택)</label>
            <Input
              value={newWord.definition}
              onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
              placeholder="예: desert, leave"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">유의어 (선택)</label>
            <Input
              value={newWord.synonyms}
              onChange={(e) => setNewWord({ ...newWord, synonyms: e.target.value })}
              placeholder="예: desert, leave"
            />
          </div>
        </div>
        <Button
          onClick={handleAddWord}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          단어 추가
        </Button>
      </div>

      {/* 단어 목록 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            등록된 단어 ({filteredWords.length}개)
          </h2>
          {filteredWords.length > 0 && (
            <Button
              onClick={handleExportWords}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV 내보내기
            </Button>
          )}
        </div>

        {filteredWords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">등록된 단어가 없습니다.</p>
            <p className="text-sm">위에서 단어를 추가해주세요.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {filteredWords.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingId === word.id ? (
                    // 편집 모드
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            영어 단어
                          </label>
                          <Input
                            value={editForm.english}
                            onChange={(e) =>
                              setEditForm({ ...editForm, english: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            한글 뜻
                          </label>
                          <Input
                            value={editForm.korean}
                            onChange={(e) =>
                              setEditForm({ ...editForm, korean: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            영영풀이
                          </label>
                          <Input
                            value={editForm.definition}
                            onChange={(e) =>
                              setEditForm({ ...editForm, definition: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            유의어
                          </label>
                          <Input
                            value={editForm.synonyms}
                            onChange={(e) =>
                              setEditForm({ ...editForm, synonyms: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          저장
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-1" />
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // 보기 모드
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-500 w-8">
                        {index + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">영어</div>
                          <div className="font-medium text-gray-800">
                            {word.english}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">한글</div>
                          <div className="text-gray-700">{word.korean}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">영영풀이</div>
                          <div className="text-gray-600 text-sm">
                            {word.definition || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">유의어</div>
                          <div className="text-gray-600 text-sm">
                            {word.synonyms || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditWord(word)}
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteWord(word.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 일괄 입력/업로드 모달 */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">단어 일괄 입력/업로드</h2>
                    <p className="text-sm text-white/90 mt-1">
                      {selectedExam} - DAY {selectedDay}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* 탭 */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setUploadMode("manual")}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      uploadMode === "manual"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <FileText className="w-5 h-5 inline-block mr-2" />
                    직접 입력
                  </button>
                  <button
                    onClick={() => setUploadMode("csv")}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      uploadMode === "csv"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5 inline-block mr-2" />
                    CSV/엑셀 업로드
                  </button>
                </div>

                {uploadMode === "manual" ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">입력 형식</h3>
                      <p className="text-sm text-blue-700 mb-2">
                        각 줄에 하나씩 입력하세요. 탭(Tab)으로 구분합니다.
                      </p>
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <code className="text-sm text-gray-700">
                          영어단어 [TAB] 한글뜻 [TAB] 영영풀이(선택) [TAB] 유의어(선택)
                        </code>
                        <div className="text-xs text-gray-500 mt-2">
                          예시:<br />
                          <span className="text-teal-600">abandon	버리다	desert, leave</span><br />
                          <span className="text-teal-600">abundant	풍부한	plentiful, ample</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        단어 데이터 입력
                      </label>
                      <Textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="abandon	버리다	desert, leave
abundant	풍부한	plentiful, ample
achieve	성취하다	accomplish, attain"
                        className="h-64 font-mono text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">CSV/엑셀 업로드</h3>
                      <p className="text-sm text-purple-700 mb-3">
                        표준 양식을 다운로드하여 작성한 후 업로드하세요.
                      </p>
                      <Button
                        onClick={handleDownloadTemplate}
                        variant="outline"
                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        표준 양식 다운로드 (.csv)
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors">
                      <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-4">
                        CSV 파일을 선택하거나 드래그하여 업로드하세요
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          파일 선택
                        </Button>
                      </label>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">파일 형식 안내</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 첫 번째 줄은 헤더(영어, 한글, 영영풀이, 유의어)로 작성</li>
                        <li>• 각 열은 쉼표(,) 또는 탭(Tab)으로 구분</li>
                        <li>• UTF-8 인코딩 권장</li>
                        <li>• 최대 1,000개 단어까지 한 번에 업로드 가능</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* 푸터 */}
              {uploadMode === "manual" && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleBulkImport}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      일괄 등록하기
                    </Button>
                    <Button
                      onClick={() => {
                        setShowBulkModal(false);
                        setBulkText("");
                      }}
                      variant="outline"
                      className="px-6"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 새 Day 추가 모달 */}
      <AnimatePresence>
        {showAddDayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddDayModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800">새 Day 추가</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedExam}에 Day {maxDay + 1}을(를) 추가하시겠습니까?
                </p>
              </div>

              {/* 내용 */}
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    • 현재 교재: <span className="font-semibold">{selectedExam}</span>
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    • 추가될 Day: <span className="font-semibold">Day {maxDay + 1}</span>
                  </p>
                  <p className="text-sm text-blue-800 mt-2">
                    Day가 추가되면 해당 Day에 단어를 등록할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 푸터 */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
                <Button
                  onClick={handleAddNewDay}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Day 추가
                </Button>
                <Button
                  onClick={() => setShowAddDayModal(false)}
                  variant="outline"
                  className="px-6"
                >
                  취소
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day 이름 변경 모달 */}
      <AnimatePresence>
        {editingDayName !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setEditingDayName(null);
              setDayNameInput("");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800">Day 이름 변경</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedExam} - Day {editingDayName}의 이름을 변경합니다.
                </p>
              </div>

              {/* 내용 */}
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 이름 *
                  </label>
                  <Input
                    value={dayNameInput}
                    onChange={(e) => setDayNameInput(e.target.value)}
                    placeholder="예: 핵심 어휘 1, 고난도 단어 등"
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveDayName();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-800">
                    💡 <strong>팁:</strong> Day 1-30은 기본 단어장이며, Day 31 이상은 사용자 정의 학습 세트입니다.
                  </p>
                  <p className="text-xs text-amber-800 mt-2">
                    예시: "핵심 어휘", "오답노트", "추가 학습" 등
                  </p>
                </div>
              </div>

              {/* 푸터 */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
                <Button
                  onClick={handleSaveDayName}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
                <Button
                  onClick={() => {
                    setEditingDayName(null);
                    setDayNameInput("");
                  }}
                  variant="outline"
                  className="px-6"
                >
                  취소
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
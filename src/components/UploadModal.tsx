import { useState } from "react";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSubject: string;
}

export function UploadModal({ isOpen, onClose, selectedSubject }: UploadModalProps) {
  const [uploadType, setUploadType] = useState<'content' | 'notice' | 'manage'>('content');
  const [uploadData, setUploadData] = useState({
    subject: selectedSubject,
    level: "",
    category: "",
    subcategory: "",
    title: "",
    description: "",
    password: ""
  });
  const [noticeData, setNoticeData] = useState({
    title: "",
    content: "",
    priority: "normal" as "high" | "normal" | "low"
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploadedNotices, setUploadedNotices] = useState<any[]>([]);

  const subjectHierarchy = {
    "국어": {
      "중등": ["중등국어1-1", "중등국어1-2", "중등국어2-1", "중등국어2-2", "중등국어3-1", "중등국어3-2"],
      "고등": ["공통국어1", "공통국어2", "문학", "언어와매체", "독서"]
    },
    "영어": {
      "중등": ["중등영어1-1", "중등영어1-2", "중등영어2-1", "중등영어2-2", "중등영어3-1", "중등영어3-2"],
      "고등": ["고등영어1-1", "고등영어1-2", "고등영어2-1", "고등영어2-2", "고등영어3-1", "고등영어3-2"]
    },
    "수학": {
      "중등": ["중등수학1", "중등수학2", "중등수학3"],
      "고등": ["수학", "수학I", "수학II", "미적분", "확률과통계", "기하"]
    },
    "과학": {
      "중등": ["중등과학1", "중등과학2", "중등과학3", "통합과학"],
      "고등": ["물리학I", "물리학II", "화학I", "화학II", "생명과학I", "생명과학II", "지구과학I", "지구과학II"]
    },
    "사회": {
      "중등": ["중등사회1", "중등사회2", "중등역사1", "중등역사2"],
      "고등": ["한국지리", "세계지리", "한국사", "세계사", "정치와법", "경제", "사회문화"]
    },
    "기타": {
      "예술": ["음악", "미술", "체육"],
      "기술가정": ["기술가정", "정보", "제2외국어"]
    }
  };

  const contentTypes = ["교과서 뽀개기", "단원별 요약", "모의고사", "직전 대비", "우리학교 기출", "보조자료"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadType === 'notice') {
      if (!noticeData.title || !noticeData.content) {
        toast.error("공지사항 제목과 내용을 입력해주세요.");
        return;
      }

      // Store notice in localStorage
      const noticeItem = {
        id: Date.now().toString(),
        title: noticeData.title,
        content: noticeData.content,
        priority: noticeData.priority,
        uploadDate: new Date().toISOString()
      };

      const existingNotices = JSON.parse(localStorage.getItem('notices') || '[]');
      existingNotices.push(noticeItem);
      localStorage.setItem('notices', JSON.stringify(existingNotices));

      toast.success("공지사항이 성공적으로 등록되었습니다!");
      setNoticeData({ title: "", content: "", priority: "normal" });
    } else {
      if (!file) {
        toast.error("파일을 선택해주세요.");
        return;
      }
      
      if (!uploadData.password) {
        toast.error("다운로드 비밀번호를 설정해주세요.");
        return;
      }
      
      if (!uploadData.level || !uploadData.category || !uploadData.subcategory) {
        toast.error("모든 분류를 선택해주세요.");
        return;
      }

      // Store content in localStorage
      const uploadItem = {
        id: Date.now().toString(),
        ...uploadData,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        downloadCount: 0
      };

      const existingUploads = JSON.parse(localStorage.getItem('uploads') || '[]');
      existingUploads.push(uploadItem);
      localStorage.setItem('uploads', JSON.stringify(existingUploads));

      toast.success("파일이 성공적으로 업로드되었습니다!");
      setUploadData({
        subject: selectedSubject,
        level: "",
        category: "",
        subcategory: "",
        title: "",
        description: "",
        password: ""
      });
      setFile(null);
    }
    
    onClose();
  };

  const currentLevels = subjectHierarchy[uploadData.subject] || {};
  const currentCategories = currentLevels[uploadData.level] || [];

  // Load uploaded files and notices for management
  React.useEffect(() => {
    if (uploadType === 'manage') {
      const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
      const notices = JSON.parse(localStorage.getItem('notices') || '[]');
      setUploadedFiles(uploads);
      setUploadedNotices(notices);
    }
  }, [uploadType]);

  const handleDeleteFile = (fileId: string) => {
    const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
    const updatedUploads = uploads.filter((upload: any) => upload.id !== fileId);
    localStorage.setItem('uploads', JSON.stringify(updatedUploads));
    setUploadedFiles(updatedUploads);
    toast.success('파일이 삭제되었습니다.');
  };

  const handleDeleteNotice = (noticeId: string) => {
    const notices = JSON.parse(localStorage.getItem('notices') || '[]');
    const updatedNotices = notices.filter((notice: any) => notice.id !== noticeId);
    localStorage.setItem('notices', JSON.stringify(updatedNotices));
    setUploadedNotices(updatedNotices);
    toast.success('공지사항이 삭제되었습니다.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-800">
            {uploadType === 'content' ? '자료 업로드' : uploadType === 'notice' ? '공지사항 등록' : '자료 관리'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Upload Type Selection */}
        <div className="grid grid-cols-3 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUploadType('content')}
            className={`py-2 px-3 rounded-md transition-colors text-sm ${
              uploadType === 'content' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            콘텐츠 업로드
          </button>
          <button
            type="button"
            onClick={() => setUploadType('notice')}
            className={`py-2 px-3 rounded-md transition-colors text-sm ${
              uploadType === 'notice' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            공지사항 등록
          </button>
          <button
            type="button"
            onClick={() => setUploadType('manage')}
            className={`py-2 px-3 rounded-md transition-colors text-sm ${
              uploadType === 'manage' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            자료 관리
          </button>
        </div>

        {uploadType === 'manage' ? (
          <div className="space-y-6">
            {/* File Management */}
            <div>
              <h3 className="text-lg text-gray-800 mb-4">업로드된 파일</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadedFiles.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">업로드된 파일이 없습니다.</p>
                ) : (
                  uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{file.title}</p>
                        <p className="text-xs text-gray-500">
                          {file.subject} / {file.level} / {file.category}
                        </p>
                        <p className="text-xs text-gray-400">
                          다운로드: {file.downloadCount || 0}회
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteFile(file.id)}
                        variant="outline"
                        size="sm"
                        className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notice Management */}
            <div>
              <h3 className="text-lg text-gray-800 mb-4">등록된 공지사항</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadedNotices.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">등록된 공지사항이 없습니다.</p>
                ) : (
                  uploadedNotices.map((notice) => (
                    <div key={notice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{notice.title}</p>
                        <p className="text-xs text-gray-500">
                          우선순위: {notice.priority === 'high' ? '높음' : notice.priority === 'normal' ? '보통' : '낮음'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(notice.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteNotice(notice.id)}
                        variant="outline"
                        size="sm"
                        className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={onClose}
                variant="outline"
              >
                닫기
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {uploadType === 'notice' ? (
              <>
                {/* Notice Title */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">공지사항 제목</label>
                  <Input
                    value={noticeData.title}
                    onChange={(e) => setNoticeData({...noticeData, title: e.target.value})}
                    placeholder="공지사항 제목을 입력하세요"
                    required
                  />
                </div>

                {/* Notice Content */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">공지사항 내용</label>
                  <textarea
                    value={noticeData.content}
                    onChange={(e) => setNoticeData({...noticeData, content: e.target.value})}
                    placeholder="공지사항 내용을 입력하세요"
                    className="w-full p-3 border border-gray-300 rounded-md resize-none h-32 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Notice Priority */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">우선순위</label>
                  <Select
                    value={noticeData.priority}
                    onValueChange={(value: "high" | "normal" | "low") => setNoticeData({...noticeData, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="normal">보통</SelectItem>
                      <SelectItem value="low">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
            <>
          {/* Subject Selection */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">과목</label>
            <Select
              value={uploadData.subject}
              onValueChange={(value) => setUploadData({...uploadData, subject: value, level: "", category: "", subcategory: ""})}
            >
              <SelectTrigger>
                <SelectValue placeholder="과목을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(subjectHierarchy).map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Selection */}
          {uploadData.subject && (
            <div>
              <label className="block text-sm text-gray-600 mb-2">학습 단계</label>
              <Select
                value={uploadData.level}
                onValueChange={(value) => setUploadData({...uploadData, level: value, category: "", subcategory: ""})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="학습 단계를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(currentLevels).map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Selection */}
          {uploadData.level && (
            <div>
              <label className="block text-sm text-gray-600 mb-2">세부 과목</label>
              <Select
                value={uploadData.category}
                onValueChange={(value) => setUploadData({...uploadData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="세부 과목을 선택��세요" />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Content Type */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">콘텐츠 타입</label>
            <Select
              value={uploadData.subcategory}
              onValueChange={(value) => setUploadData({...uploadData, subcategory: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="콘텐츠 타입을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">제목</label>
            <Input
              value={uploadData.title}
              onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
              placeholder="자료 제목을 입력하세요"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">설명</label>
            <textarea
              value={uploadData.description}
              onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
              placeholder="자료 설명을 입력하세요 (선택사항)"
              className="w-full p-3 border border-gray-300 rounded-md resize-none h-24 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">파일</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-3 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {file && (
              <p className="text-sm text-gray-500 mt-2">
                선택된 파일: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Download Password */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">다운로드 비밀번호</label>
            <Input
              type="password"
              value={uploadData.password}
              onChange={(e) => setUploadData({...uploadData, password: e.target.value})}
              placeholder="다운로드시 필요한 비밀번호를 설정하세요"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              이 비밀번호는 사용자가 자료를 다운로드할 때 필요합니다.
            </p>
          </div>
            </>
          )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploadType === 'content' ? '업로드' : '등록'}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
import { useState } from "react";
import { motion } from "motion/react";
import { X, Lock, FileText, FileDown, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string, format: 'word' | 'pdf') => void;
  materialTitle: string;
}

export function PasswordModal({ isOpen, onClose, onSubmit, materialTitle }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<'word' | 'pdf'>('pdf');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password, selectedFormat);
    setPassword("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center sm:p-4 z-50">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md shadow-xl border-t sm:border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-8 sm:h-8 bg-cyan-50 sm:bg-gray-100 rounded-xl sm:rounded-lg flex items-center justify-center">
                <Download className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-cyan-600 sm:text-gray-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">자료 다운로드</h2>
                <p className="text-[10px] sm:hidden text-gray-400">비밀번호를 입력하세요</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 sm:p-1.5 rounded-lg hover:bg-gray-100 transition-colors -mr-1"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Material Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-lg p-3.5 mb-4 sm:mb-5">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">선택된 자료</p>
            <p className="text-sm font-medium text-gray-900 leading-snug">{materialTitle}</p>
          </div>

          {/* Format Selection */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-2.5">
              다운로드 형식
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setSelectedFormat('pdf')}
                className={`flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-lg border-2 transition-all ${
                  selectedFormat === 'pdf'
                    ? 'border-cyan-500 sm:border-gray-900 bg-cyan-50 sm:bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl sm:rounded-lg flex items-center justify-center ${
                  selectedFormat === 'pdf' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <FileDown className={`w-4.5 h-4.5 ${selectedFormat === 'pdf' ? 'text-red-600' : 'text-gray-500'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${selectedFormat === 'pdf' ? 'text-gray-900' : 'text-gray-700'}`}>PDF</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400">시험지 형식</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFormat('word')}
                className={`flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-lg border-2 transition-all ${
                  selectedFormat === 'word'
                    ? 'border-cyan-500 sm:border-gray-900 bg-cyan-50 sm:bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl sm:rounded-lg flex items-center justify-center ${
                  selectedFormat === 'word' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <FileText className={`w-4.5 h-4.5 ${selectedFormat === 'word' ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${selectedFormat === 'word' ? 'text-gray-900' : 'text-gray-700'}`}>Word</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400">편집 가능</p>
                </div>
              </button>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                autoFocus
                className="h-12 sm:h-11 text-base sm:text-sm rounded-xl sm:rounded-lg"
              />
            </div>

            <div className="flex gap-2.5 pb-2 sm:pb-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 sm:h-11 text-sm rounded-xl sm:rounded-lg"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 sm:h-11 text-sm rounded-xl sm:rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg, #00bcd4, #0097a7)' }}
              >
                <Download className="w-4 h-4 mr-1.5" />
                다운로드
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

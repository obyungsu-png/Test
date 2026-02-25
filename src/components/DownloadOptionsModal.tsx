import { motion } from "motion/react";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";
import { X } from "lucide-react";
import { DownloadOptionButton } from "./download/DownloadOptionButton";
import { DOWNLOAD_OPTIONS, PAST_PAPERS_OPTION, TEACHER_OPTIONS } from "./constants/downloadOptions";

interface DownloadOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialTitle: string;
}

export function DownloadOptionsModal({ isOpen, onClose, materialTitle }: DownloadOptionsModalProps) {
  const handleOptionClick = (optionId: string, optionTitle: string) => {
    console.log(`Downloading ${optionId} for: ${materialTitle}`);
    toast.success(`${optionTitle} 형태로 "${materialTitle}" 자료를 다운로드합니다.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl text-gray-900 mb-2">자료 다운로드</h2>
            <p className="text-gray-600 text-sm">원하는 자료 형태를 선택하세요</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Material Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-700 mb-1">선택된 자료:</p>
          <p className="text-blue-900 truncate">{materialTitle}</p>
        </div>

        {/* Download Options Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {DOWNLOAD_OPTIONS.map((option) => (
            <DownloadOptionButton
              key={option.id}
              {...option}
              onClick={handleOptionClick}
            />
          ))}
        </div>

        {/* Past Papers - Single Row */}
        <div className="mb-8">
          <DownloadOptionButton
            {...PAST_PAPERS_OPTION}
            onClick={handleOptionClick}
            className="w-full"
          />
        </div>

        {/* Teacher Section */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg text-gray-700 mb-6">Made for teachers</h3>
          
          <div className="space-y-4">
            {TEACHER_OPTIONS.map((option) => (
              <DownloadOptionButton
                key={option.id}
                {...option}
                onClick={handleOptionClick}
                className="w-full"
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-8"
          >
            취소
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
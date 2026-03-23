import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { X, BookOpen, Eye, Download, Calendar, FileText, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner@2.0.3";

interface ContentRecord {
  id: string;
  materialTitle: string;
  subject: string;
  category: string;
  date: string;
  fileName: string;
  fileType: string;
  fileData: string;
  type: 'glimpse' | 'download';
}

interface MyContentRoomProps {
  onClose: () => void;
}

export function MyContentRoom({ onClose }: MyContentRoomProps) {
  const [activeTab, setActiveTab] = useState<'glimpse' | 'download'>('glimpse');
  const [contentRecords, setContentRecords] = useState<ContentRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ContentRecord | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Load content records from localStorage
  useEffect(() => {
    const loadRecords = () => {
      const stored = localStorage.getItem('myContentRecords');
      if (stored) {
        const records = JSON.parse(stored);
        // Sort by date (newest first)
        records.sort((a: ContentRecord, b: ContentRecord) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setContentRecords(records);
      }
    };

    loadRecords();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadRecords();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('contentRecordsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contentRecordsUpdated', handleStorageChange);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR', { 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const glimpseRecords = contentRecords.filter(r => r.type === 'glimpse');
  const downloadRecords = contentRecords.filter(r => r.type === 'download');

  const handleViewClick = (record: ContentRecord) => {
    setSelectedRecord(record);
    setShowPdfViewer(true);
  };

  const handleDownloadClick = (record: ContentRecord) => {
    // Create download link
    const link = document.createElement('a');
    link.href = record.fileData;
    link.download = record.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`"${record.materialTitle}" 파일을 다운로드합니다.`);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold">마이 콘텐츠 룸</h2>
                <p className="text-cyan-100 text-sm">내가 학습한 모든 자료를 복습하세요</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 hover:bg-white hover:bg-opacity-20 text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-gray-200 px-6">
              <TabsList className="grid w-full max-w-2xl grid-cols-2 h-14">
                <TabsTrigger value="glimpse" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  미리보기 기록
                  <span className="ml-1 px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-xs">
                    {glimpseRecords.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="download" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  다운받은 자료
                  <span className="ml-1 px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-xs">
                    {downloadRecords.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <TabsContent value="glimpse" className="mt-0">
                {glimpseRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Eye className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">미리보기 기록이 없습니다</h3>
                    <p className="text-sm text-gray-500">미리보기로 자료를 확인하면 여기에 기록됩니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {glimpseRecords.map((record) => (
                      <Card key={record.id} className="hover:shadow-lg transition-shadow border-2 hover:border-cyan-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base mb-1">{record.materialTitle}</CardTitle>
                              <CardDescription className="text-sm">
                                {record.subject} • {record.category}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewClick(record)}
                              className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              다시보기
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* File Info */}
                            <div className="flex items-center justify-between p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-100">
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-cyan-600" />
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={record.fileName}>
                                  {record.fileName}
                                </span>
                              </div>
                            </div>

                            {/* Date Info */}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{formatDate(record.date)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="download" className="mt-0">
                {downloadRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Download className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">다운받은 자료가 없습니다</h3>
                    <p className="text-sm text-gray-500">자료받기로 파일을 다운로드하면 여기에 기록됩니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {downloadRecords.map((record) => (
                      <Card key={record.id} className="hover:shadow-lg transition-shadow border-2 hover:border-green-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base mb-1">{record.materialTitle}</CardTitle>
                              <CardDescription className="text-sm">
                                {record.subject} • {record.category}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              {record.fileType === 'application/pdf' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewClick(record)}
                                  className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  보기
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadClick(record)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                재다운
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* File Info */}
                            <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={record.fileName}>
                                  {record.fileName}
                                </span>
                              </div>
                            </div>

                            {/* Date Info */}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{formatDate(record.date)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfViewer && selectedRecord && (
        <div className="fixed inset-0 z-[200] bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b flex items-center justify-between px-4 z-10">
            <h2 className="font-medium text-gray-800">
              {selectedRecord.materialTitle} - {selectedRecord.fileName}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPdfViewer(false);
                setSelectedRecord(null);
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* PDF Content - Full Screen */}
          <div className="absolute top-12 left-0 right-0 bottom-0">
            <iframe
              src={selectedRecord.fileData}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </>
  );
}
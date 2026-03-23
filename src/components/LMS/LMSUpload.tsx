import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { Upload, Trash2, File, Calendar, Download, Eye, EyeOff, FileUp } from "lucide-react";
import { 
  getSubjectStructure, 
  addUploadedMaterial, 
  getUploadedMaterials, 
  deleteUploadedMaterial,
  UploadedMaterial 
} from "../utils/dataManager";
import { KOREAN_SCHOOL_TABS, INTERNATIONAL_SCHOOL_TABS, CERTIFICATION_TABS } from "../constants/defaultContent";

interface LMSUploadProps {
  selectedSubject: string;
  onNavigateToContent?: () => void;
}

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  priority: "high" | "normal" | "low";
  uploadDate: string;
}

export default function LMSUpload({ selectedSubject, onNavigateToContent }: LMSUploadProps) {
  const [schoolType, setSchoolType] = useState<'korean' | 'international' | 'certification'>('korean');
  const [activeTab, setActiveTab] = useState<'upload' | 'notice'>('upload');
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
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMaterial[]>([]);
  const [uploadedNotices, setUploadedNotices] = useState<NoticeItem[]>([]);
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewDragging, setIsPreviewDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewFileInputRef = useRef<HTMLInputElement>(null);

  const subjectHierarchy = getSubjectStructure(schoolType);

  // Get content types based on school type
  const getContentTypes = () => {
    if (schoolType === 'international') {
      return INTERNATIONAL_SCHOOL_TABS;
    } else if (schoolType === 'certification') {
      return CERTIFICATION_TABS;
    }
    return KOREAN_SCHOOL_TABS;
  };

  const [contentTypes, setContentTypes] = useState(getContentTypes());

  // Load uploaded files and notices
  useEffect(() => {
    const loadData = async () => {
      const uploads = await getUploadedMaterials();
      const notices = JSON.parse(localStorage.getItem('notices') || '[]');
      setUploadedFiles(uploads);
      setUploadedNotices(notices);
    };

    loadData();
    
    // Update content types based on school type
    const updatedTypes = getContentTypes();
    setContentTypes(updatedTypes);

    // Listen for storage changes
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('materialsUpdated', handleStorageChange);
    const interval = setInterval(handleStorageChange, 5000); // reduced frequency

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('materialsUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, [activeTab, schoolType]);

  // Update content types when school type changes
  useEffect(() => {
    const updatedTypes = getContentTypes();
    setContentTypes(updatedTypes);
    // Reset subcategory when school type changes
    setUploadData(prev => ({ ...prev, subcategory: "" }));
  }, [schoolType]);

  const currentLevels = subjectHierarchy[uploadData.subject] || {};
  const currentCategories = currentLevels[uploadData.level] || [];

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("자료 받기용 파일을 선택해주세요.");
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

    try {
      // Convert main file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Convert preview file to base64 if exists
      let previewFileData = null;
      if (previewFile) {
        // Validate preview file is TXT
        if (!previewFile.name.toLowerCase().endsWith('.txt')) {
          toast.error("미리보기 파일은 TXT 형식만 가능합니다.");
          return;
        }
        
        console.log('[LMSUpload] Converting preview file to base64');
        console.log('[LMSUpload] Preview file name:', previewFile.name);
        console.log('[LMSUpload] Preview file type:', previewFile.type);
        console.log('[LMSUpload] Preview file size:', previewFile.size);
        
        previewFileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('[LMSUpload] Preview file converted to base64, length:', (reader.result as string).length);
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(previewFile);
        });
      }

      const uploadItem: UploadedMaterial = {
        id: Date.now().toString(),
        title: uploadData.title,
        description: uploadData.description,
        subject: uploadData.subject,
        level: uploadData.level,
        category: uploadData.category,
        schoolType: schoolType,
        contentType: uploadData.subcategory,
        uploadDate: new Date().toISOString(),
        password: uploadData.password,
        downloadCount: 0,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        isUploaded: true,
        uploadData: {
          id: Date.now().toString(),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileData: fileData, // Store base64 file data
          password: uploadData.password,
          downloadCount: 0
        },
        // Add preview file data if exists
        previewFileData: previewFileData ? {
          fileName: previewFile!.name,
          fileSize: previewFile!.size,
          fileType: previewFile!.type || 'text/plain',
          fileData: previewFileData
        } : undefined
      };

      console.log('[LMSUpload] Upload item created');
      console.log('[LMSUpload] Has previewFileData:', !!uploadItem.previewFileData);
      if (uploadItem.previewFileData) {
        console.log('[LMSUpload] Preview file details:', {
          fileName: uploadItem.previewFileData.fileName,
          fileType: uploadItem.previewFileData.fileType,
          dataLength: uploadItem.previewFileData.fileData.length
        });
      }

      addUploadedMaterial(uploadItem);
    } catch (error) {
      toast.error("파일 업로드 중 오류가 발생했습니다.");
      return;
    }

    toast.success("파일이 성공적으로 업로드되었습니다!");
    setUploadData({
      subject: "",
      level: "",
      category: "",
      subcategory: "",
      title: "",
      description: "",
      password: ""
    });
    setFile(null);
    setPreviewFile(null);
    const updatedFiles = await getUploadedMaterials();
    setUploadedFiles(updatedFiles);
    if (onNavigateToContent) {
      onNavigateToContent();
    }
  };

  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!noticeData.title || !noticeData.content) {
      toast.error("공지사항 제목과 내용을 입력해주세요.");
      return;
    }

    const noticeItem: NoticeItem = {
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
    setUploadedNotices(existingNotices);
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm("정말로 이 파일을 삭제하시겠습니까?")) {
      deleteUploadedMaterial(fileId).then(async () => {
        const updatedFiles = await getUploadedMaterials();
        setUploadedFiles(updatedFiles);
        toast.success('파일이 삭제되었습니다.');
      });
    }
  };

  const handleDeleteNotice = (noticeId: string) => {
    if (confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      const notices = JSON.parse(localStorage.getItem('notices') || '[]');
      const updatedNotices = notices.filter((notice: any) => notice.id !== noticeId);
      localStorage.setItem('notices', JSON.stringify(updatedNotices));
      setUploadedNotices(updatedNotices);
      toast.success('공지사항이 삭제되었습니다.');
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Drag and Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if leaving the drop zone itself
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      setFile(droppedFile);
      toast.success(`파일 "${droppedFile.name}"이(가) 추가되었습니다.`);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handlePreviewFileInputClick = () => {
    previewFileInputRef.current?.click();
  };

  // Preview file drag handlers
  const handlePreviewDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewDragging(true);
  };

  const handlePreviewDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsPreviewDragging(false);
    }
  };

  const handlePreviewDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePreviewDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (!droppedFile.name.toLowerCase().endsWith('.txt')) {
        toast.error("미리보기 파일은 TXT 형식만 가능합니다.");
        return;
      }
      setPreviewFile(droppedFile);
      toast.success(`미리보기 파일 "${droppedFile.name}"이(가) 추가되었습니다.`);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">높음</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800">보통</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">낮음</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-gray-900">자료 업로</h1>
        <p className="text-gray-600">교육 자료와 공지사항을 업로드하고 관리합니다</p>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-3 px-4 rounded-md transition-colors ${
            activeTab === 'upload' 
              ? 'bg-white text-cyan-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Upload className="w-4 h-4 mx-auto mb-1" />
          콘텐츠 업로드
        </button>
        <button
          onClick={() => setActiveTab('notice')}
          className={`py-3 px-4 rounded-md transition-colors ${
            activeTab === 'notice' 
              ? 'bg-white text-cyan-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <File className="w-4 h-4 mx-auto mb-1" />
          공지사항 등록
        </button>
      </div>

      {/* Content Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          {/* Regular File Upload Form */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              자료 업로드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContentSubmit} className="space-y-6">
              {/* School Type Selection */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">학교 타입</label>
                <Tabs 
                  value={schoolType} 
                  onValueChange={(value) => {
                    setSchoolType(value as 'korean' | 'international' | 'certification');
                    setUploadData({...uploadData, subject: "", level: "", category: "", subcategory: ""});
                  }}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="korean">한국학교</TabsTrigger>
                    <TabsTrigger value="international">국제학교</TabsTrigger>
                    <TabsTrigger value="certification">인증시험</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

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
                      <SelectValue placeholder="세부 과목을 선택하세요" />
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
                    <SelectValue placeholder="콘텐츠 타입을 선택하세" />
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
                  className="w-full p-3 border border-gray-300 rounded-md resize-none h-24 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* File Upload Section */}
              <div>
                {/* Main File Upload (자료 받기) */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    파일 업로드 (필수)
                  </label>
                  
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleFileInputClick}
                    className={`
                      relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                      ${isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    
                    <div className="flex flex-col items-center">
                      <FileUp className={`w-12 h-12 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                      
                      {file ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">선택된 파일:</p>
                          <p className="text-base text-gray-900 truncate max-w-full">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-base text-gray-700">
                            파일을 드래그하거나 클릭하여 선택하세요
                          </p>
                          <p className="text-sm text-gray-500">
                            PDF, Word, 이미지 등 모든 형식 가능
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">📌 파일 업로드 안내</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• 학생들이 다운로드할 실제 자료를 업로드하세요 (PDF, Word 등)</p>
                  <p>• 업로드 후 다운로드 비밀번호가 필요합니다</p>
                </div>
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                업로드
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Notice Upload Tab */}
      {activeTab === 'notice' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <File className="w-5 h-5 mr-2" />
              공지사항 등록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNoticeSubmit} className="space-y-6">
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
                  className="w-full p-3 border border-gray-300 rounded-md resize-none h-32 focus:border-cyan-500 focus:outline-none"
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <File className="w-4 h-4 mr-2" />
                공지사항 등록
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState, useEffect, useRef } from "react";
import TestFormBuilder from "./TestFormBuilder";
import { getUploadedMaterials, addUploadedMaterial, deleteUploadedMaterial, updateUploadedMaterial, getSubjectStructure } from "../utils/dataManager";
import { KOREAN_SCHOOL_TABS, INTERNATIONAL_SCHOOL_TABS, CERTIFICATION_TABS } from "../constants/defaultContent";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
import { FileText, Upload, Trash2, Download, Eye, Edit, File, BookOpen, Zap, Search, Filter, Image, X, ChevronDown, Pencil, Plus } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";


interface LMSContentManagementProps {
  selectedSubject: string;
  onSubjectSelect: (subject: string) => void;
}

export default function LMSContentManagement({ selectedSubject, onSubjectSelect }: LMSContentManagementProps) {
  const [activeTab, setActiveTab] = useState("builder");
  const [uploadedMaterials, setUploadedMaterials] = useState<any[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTab, setEditTab] = useState<"preview" | "download" | "meta">("preview");
  const [editedPdfFile, setEditedPdfFile] = useState<File | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedImageFile, setEditedImageFile] = useState<File | null>(null);
  
  // Bulk upload state
  const [bulkText, setBulkText] = useState("");
  const [bulkSchoolType, setBulkSchoolType] = useState<'korean' | 'international' | 'certification'>('korean');
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkLevel, setBulkLevel] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkContentType, setBulkContentType] = useState("");
  const [bulkPassword, setBulkPassword] = useState("matanboy00");
  
  // Edit tab filter state
  const [filterSchoolType, setFilterSchoolType] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterContentType, setFilterContentType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const materials = await getUploadedMaterials();
    const uploaded = materials.filter(m => m.isUploaded);
    setUploadedMaterials(uploaded);
  };

  // Bulk upload helpers
  const bulkSubjectHierarchy = getSubjectStructure(bulkSchoolType);
  const bulkLevels = bulkSubjectHierarchy[bulkSubject] || {};
  const bulkCategories = bulkLevels[bulkLevel] || [];
  const getBulkContentTypes = () => {
    if (bulkSchoolType === 'international') return INTERNATIONAL_SCHOOL_TABS;
    if (bulkSchoolType === 'certification') return CERTIFICATION_TABS;
    return KOREAN_SCHOOL_TABS;
  };

  const handleSaveTest = async (txtContent: string, testTitle: string, metadata?: {
    schoolType: string;
    subject: string;
    level: string;
    category: string;
    contentType: string;
    title: string;
    description: string;
    password: string;
  }, pdfFile?: File) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(txtContent);
    const base64 = btoa(String.fromCharCode(...bytes));
    const txtDataUrl = `data:text/plain;base64,${base64}`;

    let pdfDataUrl = null;
    let pdfFileName = '';
    let pdfFileSize = 0;
    
    if (pdfFile) {
      pdfDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(pdfFile);
      });
      pdfFileName = pdfFile.name;
      pdfFileSize = pdfFile.size;
    }

    const newMaterial = {
      id: `test-${Date.now()}`,
      title: metadata?.title || testTitle,
      description: metadata?.description || `시험지 작성 도구로 생성됨 - ${new Date().toLocaleDateString()}`,
      subject: metadata?.subject || selectedSubject || "국어",
      level: metadata?.level || "전체",
      category: metadata?.category || selectedSubject || "국어",
      schoolType: (metadata?.schoolType || "korean") as const,
      contentType: metadata?.contentType || "시험지",
      uploadDate: new Date().toISOString(),
      password: metadata?.password || "",
      downloadCount: 0,
      fileSize: pdfFile ? `${(pdfFileSize / 1024 / 1024).toFixed(2)} MB` : `${txtContent.length} bytes`,
      isUploaded: true,
      source: "content-management",
      uploadData: pdfDataUrl ? {
        fileName: pdfFileName,
        fileType: "application/pdf",
        fileData: pdfDataUrl,
        fileSize: pdfFileSize,
        uploadDate: new Date().toISOString()
      } : {
        fileName: `${metadata?.title || testTitle}.txt`,
        fileType: "text/plain",
        fileData: txtDataUrl,
        fileSize: txtContent.length,
        uploadDate: new Date().toISOString()
      },
      previewFileData: {
        fileName: `${metadata?.title || testTitle}.txt`,
        fileType: "text/plain",
        fileData: txtDataUrl,
        fileSize: txtContent.length
      },
      hasPreview: true,
      type: "객관식 문제"
    };

    addUploadedMaterial(newMaterial);
    toast.success(`"${metadata?.title || testTitle}" 시험지가 저장되었습니다!`, {
      description: pdfFile ? "PDF 파일은 다운로드에서, TXT는 퀴즈에서 확인할 수 있습니다." : "퀴즈에서 확인할 수 있습니다."
    });
    loadMaterials();
  };

  // Bulk upload handler - parse multiple questions at once
  const handleBulkUpload = () => {
    if (!bulkText.trim()) {
      toast.error("업로드할 내용을 입력해주세요.");
      return;
    }
    if (!bulkSubject || !bulkLevel || !bulkCategory || !bulkContentType) {
      toast.error("모든 분류를 선택해주세요.");
      return;
    }

    // Split by separator (--- or empty double newline sections)
    const sections = bulkText.split(/\n-{3,}\n/).filter(s => s.trim());
    
    if (sections.length === 0) {
      toast.error("유효한 문제를 찾을 수 없습니다.");
      return;
    }

    // Each section becomes one material
    let successCount = 0;
    sections.forEach((section, idx) => {
      const lines = section.trim().split('\n');
      // Try to extract title from first line or generate one
      const firstLine = lines[0]?.trim() || "";
      const titleMatch = firstLine.match(/^(?:제목|Title|#)\s*[:：]\s*(.+)/i);
      const title = titleMatch ? titleMatch[1].trim() : `${bulkSubject} ${bulkCategory} - ${idx + 1}번`;
      
      const content = titleMatch ? lines.slice(1).join('\n').trim() : section.trim();
      
      const encoder = new TextEncoder();
      const bytes = encoder.encode(content);
      const base64 = btoa(String.fromCharCode(...bytes));
      const txtDataUrl = `data:text/plain;base64,${base64}`;

      const newMaterial = {
        id: `bulk-${Date.now()}-${idx}`,
        title,
        description: `대용량 업로드 (${new Date().toLocaleDateString()})`,
        subject: bulkSubject,
        level: bulkLevel,
        category: bulkCategory,
        schoolType: bulkSchoolType,
        contentType: bulkContentType,
        uploadDate: new Date().toISOString(),
        password: bulkPassword,
        downloadCount: 0,
        fileSize: `${content.length} bytes`,
        isUploaded: true,
        source: "bulk-upload",
        uploadData: {
          fileName: `${title}.txt`,
          fileType: "text/plain",
          fileData: txtDataUrl,
          fileSize: content.length,
          uploadDate: new Date().toISOString()
        },
        previewFileData: {
          fileName: `${title}.txt`,
          fileType: "text/plain",
          fileData: txtDataUrl,
          fileSize: content.length
        },
        hasPreview: true,
        type: "객관식 문제"
      };

      addUploadedMaterial(newMaterial);
      successCount++;
    });

    toast.success(`${successCount}개 자료가 업로드되었습니다!`);
    setBulkText("");
    loadMaterials();
  };

  const handleDelete = (materialId: string) => {
    if (!confirm("정말로 이 자료를 삭제하시겠습니까?")) return;
    deleteUploadedMaterial(materialId);
    loadMaterials();
    toast.success("자료가 삭제되었습니다.");
  };

  const handleDownload = (material: any) => {
    if (material.uploadData?.fileData) {
      const link = document.createElement('a');
      link.href = material.uploadData.fileData;
      link.download = material.uploadData.fileName || `${material.title}.txt`;
      link.click();
      toast.success("파일이 다운로드되었습니다.");
    }
  };

  const handleEditClick = (material: any) => {
    setEditingMaterial(material);
    setEditTab("meta");
    setEditedPdfFile(null);
    setEditedImageFile(null);
    setEditedTitle(material.title || "");
    setEditedDescription(material.description || "");
    
    try {
      if (material.previewFileData?.fileData) {
        const base64Data = material.previewFileData.fileData.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8');
        setEditedContent(decoder.decode(bytes));
      } else {
        setEditedContent("");
      }
    } catch (error) {
      console.error('Error decoding content:', error);
      setEditedContent("");
    }
    
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMaterial) return;

    let updatedMaterial = { ...editingMaterial };
    let updateMessages: string[] = [];

    // Update title/description
    if (editedTitle !== editingMaterial.title) {
      updatedMaterial.title = editedTitle;
      updateMessages.push("제목 수정됨");
    }
    if (editedDescription !== editingMaterial.description) {
      updatedMaterial.description = editedDescription;
      updateMessages.push("설명 수정됨");
    }

    // Update preview (TXT)
    if (editedContent) {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(editedContent);
      const base64 = btoa(String.fromCharCode(...bytes));
      const txtDataUrl = `data:text/plain;base64,${base64}`;

      updatedMaterial.previewFileData = {
        fileName: `${editedTitle || editingMaterial.title}.txt`,
        fileType: "text/plain",
        fileData: txtDataUrl,
        fileSize: editedContent.length
      };
      updateMessages.push("퀴즈(TXT) 수정됨");
    }

    // Update download file (PDF)
    if (editedPdfFile) {
      const pdfDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(editedPdfFile);
      });

      updatedMaterial.uploadData = {
        fileName: editedPdfFile.name,
        fileType: editedPdfFile.type,
        fileData: pdfDataUrl,
        fileSize: editedPdfFile.size,
        uploadDate: new Date().toISOString()
      };
      updatedMaterial.fileSize = `${(editedPdfFile.size / 1024 / 1024).toFixed(2)} MB`;
      updateMessages.push("파일 교체됨");
    }

    // Add image attachment
    if (editedImageFile) {
      const imgDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(editedImageFile);
      });
      updatedMaterial.imageAttachment = {
        fileName: editedImageFile.name,
        fileType: editedImageFile.type,
        fileData: imgDataUrl,
        fileSize: editedImageFile.size
      };
      updateMessages.push("이미지 첨부됨");
    }

    updateUploadedMaterial(editingMaterial.id, updatedMaterial);
    
    toast.success(`"${editedTitle || editingMaterial.title}" 자료가 수정되었습니다!`, {
      description: updateMessages.length > 0 ? updateMessages.join(", ") : "변경 사항이 저장되었습니다."
    });
    
    loadMaterials();
    setShowEditDialog(false);
    setEditingMaterial(null);
    setEditedContent("");
    setEditedPdfFile(null);
    setEditedImageFile(null);
  };

  // Filter logic for edit tab
  const filteredMaterials = uploadedMaterials.filter(m => {
    if (filterSchoolType !== "all" && m.schoolType !== filterSchoolType) return false;
    if (filterSubject !== "all" && m.subject !== filterSubject) return false;
    if (filterContentType !== "all" && m.contentType !== filterContentType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q));
    }
    return true;
  });

  // Get unique values for filters
  const uniqueSubjects = [...new Set(uploadedMaterials.map(m => m.subject).filter(Boolean))];
  const uniqueContentTypes = [...new Set(uploadedMaterials.map(m => m.contentType).filter(Boolean))];

  const sampleFormat = `제목: 2025 수능 영어 1번~5번
1. 다음 글의 요지로 가장 적절한 것은?

[Passage]
The most fundamental principle of economics is that...
[/Passage]

A. 경제 원칙의 기본
B. 시장의 자유
C. 자원의 효율적 배분
D. 수요와 공급의 법칙
E. 정부의 개입

정답: C

[해설]
지문에서 경제의 가장 기본적인 원칙은...
[/해설]

---

제목: 2025 수능 영어 6번~10번
2. 다음 빈칸에 들어갈 말로 가장 적절한 것은?

The author suggests that __________.

A. technology improves communication
B. education drives innovation
C. research is essential
D. collaboration is key

정답: B

---

(여러 문제를 ---로 구분하여 한번에 업로드)`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900">콘텐츠 관리</h1>
        <p className="text-gray-600">시험지를 작성하고 교육 자료를 관리합니다</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder" className="text-xs sm:text-sm">
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            시험지 작성
          </TabsTrigger>
          <TabsTrigger value="bulk" className="text-xs sm:text-sm">
            <Zap className="w-4 h-4 mr-1 sm:mr-2" />
            대용량 업로드
          </TabsTrigger>
          <TabsTrigger value="edit" className="text-xs sm:text-sm">
            <Pencil className="w-4 h-4 mr-1 sm:mr-2" />
            편집 ({uploadedMaterials.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: 시험지 작성 (기존 TestFormBuilder) */}
        <TabsContent value="builder" className="space-y-4">
          <TestFormBuilder onSave={handleSaveTest} />
        </TabsContent>

        {/* Tab 2: 대용량 업로드 */}
        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Zap className="w-5 h-5 mr-2" style={{ color: '#00bcd4' }} />
                대용량 업로드
              </CardTitle>
              <p className="text-sm text-gray-500">여러 문제를 한번에 빠르게 업로드합니다. 수능/내신 시험 양식을 지원합니다.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Classification */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">학교 타입</label>
                  <Select value={bulkSchoolType} onValueChange={(v) => { setBulkSchoolType(v as any); setBulkSubject(""); setBulkLevel(""); setBulkCategory(""); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="korean">한국학교</SelectItem>
                      <SelectItem value="international">국제학교</SelectItem>
                      <SelectItem value="certification">인증시험</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">과목</label>
                  <Select value={bulkSubject} onValueChange={(v) => { setBulkSubject(v); setBulkLevel(""); setBulkCategory(""); }}>
                    <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(bulkSubjectHierarchy).map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">학습 단계</label>
                  <Select value={bulkLevel} onValueChange={(v) => { setBulkLevel(v); setBulkCategory(""); }}>
                    <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(bulkLevels).map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">세부 과목</label>
                  <Select value={bulkCategory} onValueChange={setBulkCategory}>
                    <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      {bulkCategories.map((c: string) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">콘텐츠 타입</label>
                  <Select value={bulkContentType} onValueChange={setBulkContentType}>
                    <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      {getBulkContentTypes().map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">비밀번호</label>
                  <Input value={bulkPassword} onChange={(e) => setBulkPassword(e.target.value)} placeholder="다운로드 비밀번호" />
                </div>
              </div>

              {/* Text area for bulk content */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">문제 내용 (---로 구분)</label>
                <Textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={sampleFormat}
                  className="font-mono text-sm min-h-[350px]"
                />
              </div>

              {/* Sample format toggle */}
              <details className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <summary className="text-sm font-medium text-cyan-800 cursor-pointer">
                  샘플 양식 보기 (수능/내신 시험 형식)
                </summary>
                <pre className="text-xs text-cyan-700 mt-3 whitespace-pre-wrap bg-white p-3 rounded border overflow-x-auto">
{sampleFormat}
                </pre>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setBulkText(sampleFormat); toast.success("샘플이 입력되었습니다."); }}
                    style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                  >
                    샘플 입력하기
                  </Button>
                </div>
              </details>

              {/* Upload button */}
              <Button
                onClick={handleBulkUpload}
                className="w-full"
                style={{ backgroundColor: '#00bcd4', color: 'white' }}
              >
                <Zap className="w-4 h-4 mr-2" />
                대용량 업로드 ({bulkText.split(/\n-{3,}\n/).filter(s => s.trim()).length || 0}개 감지)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: 편집 (기존 자료 불러오기 + 수정/삭제/이미지 첨부) */}
        <TabsContent value="edit" className="space-y-4">
          {/* Filter bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="자료 검색 (제목, 설명)..."
                    className="pl-9"
                  />
                </div>
                <Select value={filterSchoolType} onValueChange={setFilterSchoolType}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="학교 타입" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 학교</SelectItem>
                    <SelectItem value="korean">한국학교</SelectItem>
                    <SelectItem value="international">국제학교</SelectItem>
                    <SelectItem value="certification">인증시험</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="과목" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 과목</SelectItem>
                    {uniqueSubjects.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterContentType} onValueChange={setFilterContentType}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="콘텐츠 타입" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 타입</SelectItem>
                    {uniqueContentTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(filterSchoolType !== "all" || filterSubject !== "all" || filterContentType !== "all" || searchQuery) && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-500">필터 적용됨:</span>
                  <Badge variant="outline" className="text-xs">{filteredMaterials.length}개 결과</Badge>
                  <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => { setFilterSchoolType("all"); setFilterSubject("all"); setFilterContentType("all"); setSearchQuery(""); }}>
                    <X className="w-3 h-3 mr-1" /> 초기화
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Materials list */}
          {filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {uploadedMaterials.length === 0 ? "아직 업로드된 자료가 없습니다." : "검색 조건에 맞는 자료가 없습니다."}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {uploadedMaterials.length === 0 ? "시험지 작성 또는 대용량 업로드 탭에서 자료를 만들어보세요." : "필터를 변경해보세요."}
                </p>
                {uploadedMaterials.length === 0 && (
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("builder")}
                    style={{ backgroundColor: '#00bcd4', color: 'white' }}
                  >
                    시험지 작성하기
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-900 truncate">{material.title}</h3>
                          {material.source === "bulk-upload" && (
                            <Badge className="bg-purple-100 text-purple-700 text-[10px]">대용량</Badge>
                          )}
                          {material.imageAttachment && (
                            <Badge className="bg-green-100 text-green-700 text-[10px]">
                              <Image className="w-3 h-3 mr-0.5" />이미지
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          <Badge variant="outline" style={{ borderColor: '#00bcd4', color: '#00bcd4' }} className="text-[10px]">
                            {material.schoolType === 'korean' ? '한국학교' : material.schoolType === 'international' ? '국제학교' : '인증시험'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{material.subject || '미분류'}</Badge>
                          <Badge variant="outline" className="text-[10px]">{material.contentType || material.category || '기타'}</Badge>
                          <Badge variant="outline" className="text-[10px]">{material.level || '전체'}</Badge>
                        </div>
                        {material.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{material.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                          <span>{new Date(material.uploadDate || Date.now()).toLocaleDateString('ko-KR')}</span>
                          <span>{material.fileSize}</span>
                          {material.downloadCount > 0 && <span>다운로드 {material.downloadCount}회</span>}
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(material)} title="편집">
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(material)} title="다운로드">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(material.id)} title="삭제">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
            <DialogTitle>자료 편집</DialogTitle>
            <DialogDescription>
              {editingMaterial?.title} - 정보, 퀴즈(TXT), 파일을 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={editTab} onValueChange={(v) => setEditTab(v as any)} className="flex-1 flex flex-col overflow-hidden px-4">
            <TabsList className="grid w-full grid-cols-3 mt-3">
              <TabsTrigger value="meta">
                <Edit className="w-4 h-4 mr-2" />
                기본 정보
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                퀴즈 수정 (TXT)
              </TabsTrigger>
              <TabsTrigger value="download">
                <File className="w-4 h-4 mr-2" />
                파일/이미지
              </TabsTrigger>
            </TabsList>
            
            {/* Meta tab */}
            <TabsContent value="meta" className="flex-1 overflow-auto mt-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">제목</label>
                <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">설명</label>
                <Textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">과목</label>
                  <Input value={editingMaterial?.subject || ""} disabled className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">학교 타입</label>
                  <Input value={editingMaterial?.schoolType === 'korean' ? '한국학교' : editingMaterial?.schoolType === 'international' ? '국제학교' : '인증시험'} disabled className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">콘텐츠 타입</label>
                  <Input value={editingMaterial?.contentType || ""} disabled className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">업로드 날짜</label>
                  <Input value={new Date(editingMaterial?.uploadDate || Date.now()).toLocaleString('ko-KR')} disabled className="bg-gray-50" />
                </div>
              </div>
            </TabsContent>

            {/* Preview/quiz edit tab */}
            <TabsContent value="preview" className="flex-1 overflow-hidden mt-4 flex flex-col">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="flex-1 font-mono text-sm resize-none"
                placeholder="시험지 내용을 입력하세요..."
                style={{ minHeight: 'calc(99vh - 260px)' }}
              />
              <p className="text-xs text-gray-500 mt-2">
                TXT 파일 내용을 직접 수정하면 퀴즈에서 확인할 수 있습니다.
              </p>
            </TabsContent>
            
            {/* File/image tab */}
            <TabsContent value="download" className="flex-1 overflow-auto mt-4">
              <div className="space-y-6">
                {/* PDF replacement */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">파일 교체</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <File className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-3">
                      현재 파일: <span className="font-semibold">{editingMaterial?.uploadData?.fileName || '없음'}</span>
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditedPdfFile(file);
                          toast.success(`${file.name} 파일이 선택되었습니다.`);
                        }
                      }}
                      className="max-w-md mx-auto"
                    />
                    {editedPdfFile && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          새 파일: <span className="font-semibold">{editedPdfFile.name}</span> ({(editedPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image attachment */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" />
                    이미지 첨부
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {editingMaterial?.imageAttachment ? (
                      <div className="mb-3">
                        <img src={editingMaterial.imageAttachment.fileData} alt="첨부 이미지" className="max-h-32 mx-auto rounded" />
                        <p className="text-xs text-gray-500 mt-1">기존 이미지: {editingMaterial.imageAttachment.fileName}</p>
                      </div>
                    ) : (
                      <Image className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditedImageFile(file);
                          toast.success(`이미지 "${file.name}"이 선택되었습니다.`);
                        }
                      }}
                      className="max-w-md mx-auto"
                    />
                    {editedImageFile && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          새 이미지: <span className="font-semibold">{editedImageFile.name}</span> ({(editedImageFile.size / 1024).toFixed(0)} KB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4 px-4 pb-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setEditingMaterial(null);
                setEditedContent("");
                setEditedPdfFile(null);
                setEditedImageFile(null);
              }}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              style={{ backgroundColor: '#00bcd4', color: 'white' }}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

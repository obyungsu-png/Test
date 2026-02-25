import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState, useEffect } from "react";
import TestFormBuilder from "./TestFormBuilder";
import { getUploadedMaterials, addUploadedMaterial, deleteUploadedMaterial, updateUploadedMaterial } from "../utils/dataManager";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
import { FileText, Upload, Trash2, Download, Eye, Edit, File, BookOpen } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { VocaManagement } from "../VocaManagement";

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
  const [editTab, setEditTab] = useState<"preview" | "download">("preview");
  const [editedPdfFile, setEditedPdfFile] = useState<File | null>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const materials = await getUploadedMaterials();
    // Show all uploaded materials (from both content management and file upload)
    const uploaded = materials.filter(m => m.isUploaded);
    setUploadedMaterials(uploaded);
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
    // Convert TXT to base64 for storage (preview)
    const encoder = new TextEncoder();
    const bytes = encoder.encode(txtContent);
    const base64 = btoa(String.fromCharCode(...bytes));
    const txtDataUrl = `data:text/plain;base64,${base64}`;

    // Convert PDF to base64 for storage (download)
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

    // Create new material entry with metadata
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
      source: "content-management", // Mark as content management source
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

    // Add to materials
    addUploadedMaterial(newMaterial);

    toast.success(`"${metadata?.title || testTitle}" 시험지가 저장되었습니다!`, {
      description: pdfFile ? "PDF 파일은 다운로드에서, TXT는 퀴즈에서 확인할 수 있습니다." : "퀴즈에서 확인할 수 있습니다."
    });
    
    // Reload materials after save
    loadMaterials();
  };

  const handleDelete = (materialId: string) => {
    deleteUploadedMaterial(materialId);
    loadMaterials();
    toast.success("시험지가 삭제되었습니다.");
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
    setEditTab("preview");
    setEditedPdfFile(null);
    
    // Try to decode TXT content for preview tab
    try {
      if (material.previewFileData?.fileData) {
        const base64Data = material.previewFileData.fileData.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8');
        const decodedContent = decoder.decode(bytes);
        setEditedContent(decodedContent);
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

    // Update preview (TXT) if content was edited
    if (editedContent) {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(editedContent);
      const base64 = btoa(String.fromCharCode(...bytes));
      const txtDataUrl = `data:text/plain;base64,${base64}`;

      updatedMaterial.previewFileData = {
        fileName: `${editingMaterial.title}.txt`,
        fileType: "text/plain",
        fileData: txtDataUrl,
        fileSize: editedContent.length
      };
      
      updateMessages.push("퀴즈(TXT) 수정됨");
    }

    // Update download (PDF) if file was changed
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
      updateMessages.push("자료받기(PDF) 교체됨");
    }

    updateUploadedMaterial(editingMaterial.id, updatedMaterial);
    
    toast.success(`"${editingMaterial.title}" 시험지가 수정되었습니다!`, {
      description: updateMessages.length > 0 ? updateMessages.join(", ") : "변경 사항이 저장되었습니다."
    });
    
    loadMaterials();
    setShowEditDialog(false);
    setEditingMaterial(null);
    setEditedContent("");
    setEditedPdfFile(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900">콘텐츠 관리</h1>
        <p className="text-gray-600">시험지를 작성하고 교육 자료를 관리합니다</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">
            <FileText className="w-4 h-4 mr-2" />
            시험지 작성
          </TabsTrigger>
          <TabsTrigger value="uploaded">
            <Upload className="w-4 h-4 mr-2" />
            업로드된 자료 ({uploadedMaterials.length})
          </TabsTrigger>
          <TabsTrigger value="voca">
            <BookOpen className="w-4 h-4 mr-2" />
            단어 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <TestFormBuilder onSave={handleSaveTest} />
        </TabsContent>

        <TabsContent value="uploaded" className="space-y-4">
          {uploadedMaterials.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">아직 생성된 시험지가 없습니다.</p>
                <p className="text-sm text-gray-400 mt-2">시험지 작성 탭에서 새로운 시험지를 만들어보세요.</p>
                <Button
                  className="mt-4"
                  onClick={() => setActiveTab("builder")}
                  style={{ backgroundColor: '#00bcd4', color: 'white' }}
                >
                  시험지 작성하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {uploadedMaterials.map((material) => (
                <Card key={material.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" style={{ borderColor: '#00bcd4', color: '#00bcd4' }}>
                            {material.category}
                          </Badge>
                          <Badge variant="outline">
                            {material.uploadData?.fileName || 'TXT 파일'}
                          </Badge>
                        </div>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-2">{material.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(material)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(material)}
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex gap-4">
                        <span>크기: {(material.uploadData?.fileSize || 0)} bytes</span>
                        <span>업로드: {new Date(material.uploadData?.uploadDate || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <Badge style={{ backgroundColor: '#e0f7fa', color: '#00bcd4' }}>
                        <Eye className="w-3 h-3 mr-1" />
                        미리보기 가능
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="voca" className="space-y-4">
          <VocaManagement />
        </TabsContent>
      </Tabs>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
            <DialogTitle>시험지 수정</DialogTitle>
            <DialogDescription>
              {editingMaterial?.title} - 퀴즈(TXT)와 Word(PDF)를 각각 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={editTab} onValueChange={(value) => setEditTab(value as "preview" | "download")} className="flex-1 flex flex-col overflow-hidden px-4">
            <TabsList className="grid w-full grid-cols-2 mt-3">
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                퀴즈 수정 (TXT)
              </TabsTrigger>
              <TabsTrigger value="download">
                <File className="w-4 h-4 mr-2" />
                Word 교체 (PDF)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="flex-1 overflow-hidden mt-4 flex flex-col">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="flex-1 font-mono text-sm resize-none"
                placeholder="시험지 내용을 입력하세요..."
                style={{ minHeight: 'calc(99vh - 220px)' }}
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 TXT 파일 내용을 직접 수정하면 퀴즈에서 확인할 수 있습니다.
              </p>
            </TabsContent>
            
            <TabsContent value="download" className="flex-1 overflow-hidden mt-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <File className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-4">
                    현재 파일: <span className="font-semibold">{editingMaterial?.uploadData?.fileName || '없음'}</span>
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.type === 'application/pdf') {
                          setEditedPdfFile(file);
                          toast.success(`${file.name} 파일이 선택되었습니다.`);
                        } else {
                          toast.error('PDF 파일만 업로드 가능합니다.');
                          e.target.value = '';
                        }
                      }
                    }}
                    className="max-w-md mx-auto"
                  />
                  {editedPdfFile && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✅ 새 파일: <span className="font-semibold">{editedPdfFile.name}</span>
                        <br />
                        크기: {(editedPdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  💡 PDF 파일을 교체하면 미리보기와 Word에서 새 파일을 확인할 수 있습니다.
                </p>
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
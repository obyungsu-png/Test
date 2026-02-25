import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";
import { Dialog } from "./components/ui/dialog";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";

interface UploadedFile {
  id: string;
  subject: string;
  level: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  downloadCount: number;
  password: string;
}

export default function AdminApp() {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<UploadedFile[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<UploadedFile | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("전체");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load uploads from localStorage
  useEffect(() => {
    const loadedUploads = JSON.parse(localStorage.getItem('uploads') || '[]');
    setUploads(loadedUploads);
  }, []);

  // Filter uploads based on search and filters
  useEffect(() => {
    let filtered = uploads;

    if (searchTerm) {
      filtered = filtered.filter(upload => 
        upload.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        upload.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSubject !== "전체") {
      filtered = filtered.filter(upload => upload.subject === filterSubject);
    }

    setFilteredUploads(filtered);
  }, [uploads, searchTerm, filterSubject]);

  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      setIsAuthenticated(true);
      toast.success("관리자 인증 성공!");
    } else {
      toast.error("관리자 비밀번호가 틀렸습니다.");
    }
  };

  const handleDeleteUpload = () => {
    if (!selectedUpload) return;

    const updatedUploads = uploads.filter(upload => upload.id !== selectedUpload.id);
    setUploads(updatedUploads);
    localStorage.setItem('uploads', JSON.stringify(updatedUploads));
    
    setShowDeleteModal(false);
    setSelectedUpload(null);
    toast.success("자료가 삭제되었습니다.");
  };

  const handleEditUpload = (updatedData: Partial<UploadedFile>) => {
    if (!selectedUpload) return;

    const updatedUploads = uploads.map(upload => 
      upload.id === selectedUpload.id 
        ? { ...upload, ...updatedData }
        : upload
    );

    setUploads(updatedUploads);
    localStorage.setItem('uploads', JSON.stringify(updatedUploads));
    
    setShowEditModal(false);
    setSelectedUpload(null);
    toast.success("자료 정보가 수정되었습니다.");
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl text-gray-800 mb-2">NS Coach 관리자</h1>
            <p className="text-gray-600">업로드된 자료를 관리할 수 있습니다.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">관리자 비밀번호</label>
              <Input
                type="password"
                placeholder="관리자 비밀번호를 입력하세요"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full">
              로그인
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            관리자 비밀번호: admin123
          </div>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl text-gray-800">NS Coach 관리자 패널</h1>
            <Button 
              onClick={() => {
                setIsAuthenticated(false);
                setAdminPassword("");
              }}
              variant="outline"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-semibold text-blue-600">{uploads.length}</div>
            <div className="text-sm text-gray-600">총 업로드된 자료</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-semibold text-green-600">
              {uploads.reduce((sum, upload) => sum + (upload.downloadCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">총 다운로드</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-semibold text-purple-600">
              {new Set(uploads.map(u => u.subject)).size}
            </div>
            <div className="text-sm text-gray-600">과목 수</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-semibold text-orange-600">
              {(uploads.reduce((sum, upload) => sum + upload.fileSize, 0) / 1024 / 1024).toFixed(1)} MB
            </div>
            <div className="text-sm text-gray-600">총 용량</div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="제목이나 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">전체 과목</option>
              <option value="국어">국어</option>
              <option value="영어">영어</option>
              <option value="수학">수학</option>
              <option value="과학">과학</option>
              <option value="사회">사회</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </Card>

        {/* Upload List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    과목/분류
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    파일정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    업로드일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    다운로드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUploads.map((upload) => (
                  <motion.tr
                    key={upload.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {upload.title}
                        </div>
                        {upload.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {upload.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {upload.subject} / {upload.level}
                      </div>
                      <div className="text-sm text-gray-500">
                        {upload.category} / {upload.subcategory}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{upload.fileName}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(upload.fileSize)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(upload.uploadDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {upload.downloadCount || 0}회
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUpload(upload);
                            setShowEditModal(true);
                          }}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedUpload(upload);
                            setShowDeleteModal(true);
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUploads.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">업로드된 자료가 없습니다.</div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg text-gray-800 mb-4">자료 삭제</h3>
            <p className="text-gray-600 mb-6">
              "{selectedUpload?.title}" 자료를 삭제하시겠습니까?
              <br />
              <span className="text-red-600 text-sm">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={handleDeleteUpload}
                className="flex-1"
              >
                삭제
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg text-gray-800 mb-4">자료 정보 수정</h3>
            {selectedUpload && (
              <EditForm
                upload={selectedUpload}
                onSave={handleEditUpload}
                onCancel={() => setShowEditModal(false)}
              />
            )}
          </div>
        </div>
      </Dialog>

      <Toaster />
    </div>
  );
}

// Edit Form Component
function EditForm({ upload, onSave, onCancel }: {
  upload: UploadedFile;
  onSave: (data: Partial<UploadedFile>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: upload.title,
    description: upload.description,
    password: upload.password
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 mb-2">제목</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-600 mb-2">설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-md resize-none h-24 focus:border-blue-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-600 mb-2">다운로드 비밀번호</label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      <div className="flex space-x-3 pt-4">
        <Button type="submit" className="flex-1">
          저장
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          취소
        </Button>
      </div>
    </form>
  );
}
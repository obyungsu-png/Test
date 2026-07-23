import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner@2.0.3";
import { Menu, Calculator, TestTube, Atom, Globe, Users, DollarSign, Leaf, Brain, BookOpen, Languages, ChevronRight, X } from "lucide-react";

import { InteractivePracticeTest, FeedbackTabConfig, DEFAULT_FEEDBACK_TABS } from "./InteractivePracticeTest";
import { ExamQuestionsViewer } from "./ExamQuestionsViewer";
import { KeyNotesViewer } from "./KeyNotesViewer";
import { PracticeTestViewer } from "./PracticeTestViewer";
import { MyContentRoom } from "./MyContentRoom";
import { VocaPage } from "./VocaPage";
import { KoreanVocaPage } from "./KoreanVocaPage";
import SGRClassViewer from "./SGRClass/SGRClassViewer";
import SGRWritingViewer from "./SGRWriting/SGRWritingViewer";
import SGRVocaViewer from "./SGRVoca/SGRVocaViewer";
import SGRGrammarViewer from "./SGRGrammar/SGRGrammarViewer";
import { getFilteredMaterials } from "./utils/materialHelpers";
import { getCategoryCustomName, updateUploadedMaterial } from "./utils/dataManager";
import { DEFAULT_TABS, KOREAN_SCHOOL_TABS, INTERNATIONAL_SCHOOL_TABS, CERTIFICATION_TABS, CERTIFICATION_CONTENT_BY_TAB, CERTIFICATION_CONTENT_BY_SUBJECT_AND_CATEGORY } from "./constants/defaultContent";
import { downloadFile, downloadDefaultFile, downloadAsWord } from "./utils/fileDownloader";
import { PasswordModal } from "./PasswordModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import imgRectangle8 from "figma:asset/f06e219f8e82f3e00e4ea8dc84754a43dfbaccff.png";
import imgRectangle9 from "figma:asset/fb55a08fd37dd174518db51afaac9f5839666a76.png";
import imgRectangle10 from "figma:asset/97e0b68ed147898447d011fa22aaf5a5dab556ff.png";
import authModalImg from "figma:asset/fbd4d05914babb85fcf6288863c6635471a8b4f7.png";

interface MainContentProps {
  selectedSubject: string;
  selectedCategory: string;
  selectedSubCategory?: string;
  schoolType: 'korean' | 'international' | null;
  isCertificationMode?: boolean;
  onActiveTabChange?: (tab: string) => void;
  onCMSClick?: () => void;
  onComponent3Click?: () => void;
  onComponent4Click?: () => void;
  onComponent5Click?: () => void;
}

// CategoryCard Component with hover effect
function CategoryCard({ category, index, onClick }: { category: any; index: number; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = category.icon;
  
  const iconColor = category.color === "#B3E5FC" ? "#0288D1" : category.color === "#FFE0B2" ? "#FF9800" : "#5E35B1";
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 group"
      style={{
        backgroundColor: isHovered ? category.color : '#F5F5F5',
        boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)'
      }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div 
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{
          backgroundColor: 'white'
        }}
      >
        <Icon 
          className="w-7 h-7" 
          style={{ color: iconColor }} 
        />
      </motion.div>
      <h3 
        className="mb-1.5"
        style={{ color: '#000', fontWeight: 700 }}
      >
        {category.name}
      </h3>
      <p 
        className="text-xs transition-colors duration-300" 
        style={{ 
          color: isHovered ? iconColor : '#666',
          fontWeight: 700
        }}
      >
        {category.description}
      </p>
    </motion.button>
  );
}

export function MainContent({ selectedSubject, selectedCategory, selectedSubCategory, schoolType, isCertificationMode, onActiveTabChange, onCMSClick, onComponent3Click, onComponent4Click, onComponent5Click }: MainContentProps) {
  const defaultTabs = isCertificationMode ? CERTIFICATION_TABS : 
                    (schoolType === 'international' ? INTERNATIONAL_SCHOOL_TABS : KOREAN_SCHOOL_TABS);
  // school-type 별 localStorage 키 (다른 학교 유형의 커스텀 탭이 섞이지 않도록)
  const customTabNamesKey = isCertificationMode ? 'customTabNames_certification' :
                            (schoolType === 'international' ? 'customTabNames_international' : 'customTabNames_korean');
  // 영어 과목이 아닌 경우 Voca 탭 숨기기
  const adjustedTabs = (() => {
    let tabs = defaultTabs;
    if (schoolType === 'korean' && selectedSubject === '서류전형') {
    }
    if (schoolType === 'korean' && selectedSubject !== '영어') {
      tabs = tabs.filter(tab => tab !== 'Voca' && tab !== 'SGR Class' && tab !== 'SGR Writing' && tab !== 'SGR Voca' && tab !== 'SGR Grammar' && tab !== '교과서 뽀개기');
    }
    return tabs;
  })();
  const initialTab = schoolType === 'korean' ? "국어" : (schoolType === 'international' ? "Subject" : "전체보기");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20; // 한 페이지당 20개만 표시

  // Notify parent of active tab changes
  useEffect(() => {
    if (onActiveTabChange) {
      onActiveTabChange(activeTab);
    }
  }, [activeTab, onActiveTabChange]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPracticeTest, setShowPracticeTest] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [pendingDownloadMaterial, setPendingDownloadMaterial] = useState<any>(null);
  const [showDownloadFormatModal, setShowDownloadFormatModal] = useState(false);
  const [downloadFormatMaterial, setDownloadFormatMaterial] = useState<any>(null);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showMyContentRoom, setShowMyContentRoom] = useState(false);
  // 문제 해설/분석/단어 편집 모달
  const [showQuestionEditModal, setShowQuestionEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [questionEdits, setQuestionEdits] = useState<{[key: string]: {explanation: string, analysis: string, vocab: string}}>({});
  const [feedbackTabs, setFeedbackTabs] = useState<FeedbackTabConfig[]>(() => {
    try { return JSON.parse(localStorage.getItem('feedbackTabsConfig') || 'null') || DEFAULT_FEEDBACK_TABS; }
    catch { return DEFAULT_FEEDBACK_TABS; }
  });

  const [uploadedMaterials, setUploadedMaterials] = useState<any[]>([]);
  const [tabs, setTabs] = useState(adjustedTabs);
  const [materials, setMaterials] = useState<any[]>([]);
  const [tabCounts, setTabCounts] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // 페이지별 materials 계산
  const totalPages = Math.ceil(materials.length / ITEMS_PER_PAGE);
  const paginatedMaterials = materials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedSubject, selectedCategory]);

  // Voca 탭이 사라지면 첫 번째 탭으로 리셋
  useEffect(() => {
    if (activeTab === 'Voca' && schoolType === 'korean' && selectedSubject !== '영어') {
      setActiveTab(adjustedTabs[0] || '국어');
    }
  }, [selectedSubject, schoolType]);

  // Load uploaded materials and custom tab names from localStorage
  useEffect(() => {
    // Use empty array since we're now using the new data management system
    setUploadedMaterials([]);
    
    const customTabs = JSON.parse(localStorage.getItem(customTabNamesKey) || 'null');
    if (customTabs) {
      setTabs(customTabs);
    } else {
      setTabs(adjustedTabs);
    }
  }, [schoolType, selectedSubject]);

  // Load materials and tab counts together (optimized)
  useEffect(() => {
    let isMounted = true;
    
    const loadAllData = async () => {
      if (isLoading) return; // Prevent duplicate calls
      
      setIsLoading(true);
      
      try {
        // Load materials for active tab
        const loadedMaterials = await getFilteredMaterials(
          activeTab, 
          tabs, 
          uploadedMaterials, 
          selectedSubject, 
          selectedCategory, 
          schoolType, 
          isCertificationMode, 
          selectedSubCategory
        );
        
        if (isMounted) {
          setMaterials(loadedMaterials);
          
          // Calculate tab counts from loaded materials without additional API calls
          const counts: {[key: string]: number} = {};
          counts[activeTab] = loadedMaterials.length;
          
          // For other tabs, just set to 0 to avoid memory issues
          // They will be updated when user clicks on them
          tabs.forEach(tab => {
            if (tab !== activeTab && !counts[tab]) {
              counts[tab] = 0;
            }
          });
          
          setTabCounts(counts);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadAllData();
    
    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedSubject, selectedCategory, schoolType, isCertificationMode, selectedSubCategory]);

  // Update when new materials are uploaded or tab names are changed
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render by setting a timestamp
      setUploadedMaterials([]);
      
      const customTabs = JSON.parse(localStorage.getItem(customTabNamesKey) || 'null');
      if (customTabs) {
        setTabs(customTabs);
      } else {
        setTabs(defaultTabs);
      }
    };

    const handleMaterialsUpdated = () => {
      // Force re-render when materials are updated
      setUploadedMaterials([]);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('materialsUpdated', handleMaterialsUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('materialsUpdated', handleMaterialsUpdated);
    };
  }, []);

  const handleAuthSubmit = () => {
    if (password === "matanboy00") {
      setShowAuthModal(false);
      setPassword("");
      toast.success("인증 성공! VIP 콘텐츠룸에 접근합니다.");
    } else {
      toast.error("비밀번호가 틀렸습니다.");
    }
  };

  const handleDirectPDFDownload = async (material: any) => {
    try {
      const uploadData = material.uploadData;
      const safeName = material.title.replace(/\s+/g, '_').replace(/[^\w가-힣-]/g, '');

      // ① 업로드된 파일이 있는 경우 — 원본 파일 그대로 다운로드
      if (material.isUploaded && uploadData && uploadData.fileData) {
        const a = document.createElement('a');
        a.href = uploadData.fileData;
        // 확장자 보존
        const ext = uploadData.fileName?.split('.').pop() || 'pdf';
        a.download = `${safeName}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`"${material.title}" 다운로드를 시작합니다.`);
      } else {
        // ② 업로드 파일 없음 — 시험지 HTML 생성 후 .html 파일로 다운로드
        const textContent = `${material.title}\n\n이 자료는 AllMyExam에서 제공되는 교육 자료입니다.\n다운로드 날짜: ${new Date().toLocaleDateString('ko-KR')}`;
        const examHTML = generateKoreanExamStyleHTML(textContent, material.title, selectedSubject, selectedCategory);
        const blob = new Blob([examHTML], { type: 'text/html;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `시험지_${safeName}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        toast.success(`"${material.title}" 파일을 다운로드합니다.`);
      }

      // 다운로드 횟수 업데이트
      if (material.isUploaded) {
        updateUploadedMaterial(material.id, {
          downloadCount: (material.downloadCount || 0) + 1
        });
      }

      // 기록 저장
      const downloadRecord = {
        id: `download-${Date.now()}`,
        materialTitle: material.title,
        subject: selectedSubject,
        category: selectedCategory || activeTab,
        date: new Date().toISOString(),
        type: 'download'
      };
      const existingRecords = JSON.parse(localStorage.getItem('myContentRecords') || '[]');
      existingRecords.unshift(downloadRecord);
      localStorage.setItem('myContentRecords', JSON.stringify(existingRecords));
      window.dispatchEvent(new Event('contentRecordsUpdated'));

    } catch (error) {
      console.error('Download error:', error);
      toast.error('다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleDownloadWithFormat = async (material: any, format: 'pdf' | 'word') => {
    setShowDownloadFormatModal(false);
    const safeName = material.title.replace(/\s+/g, '_').replace(/[^\w가-힣-]/g, '');
    try {
      const uploadData = material.uploadData;
      if (material.isUploaded && uploadData?.fileData) {
        // 원본 파일 있으면 그대로 다운로드
        const a = document.createElement('a');
        a.href = uploadData.fileData;
        const ext = format === 'pdf' ? 'pdf' : 'docx';
        a.download = `${safeName}.${ext}`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        toast.success(`"${material.title}" ${format.toUpperCase()} 다운로드를 시작합니다.`);
      } else {
        // 샘플 자료 → 문제 목록으로 파일 생성
        const GLM_API_KEY = "dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff";
        toast.info("AI가 문제를 생성 중입니다...");
        let questions: any[] = [];
        try {
          const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GLM_API_KEY}` },
            body: JSON.stringify({
              model: "glm-4-flash", max_tokens: 2000,
              messages: [{ role: "user", content: `한국 고등학교 영어 시험 문제 5개를 만들어줘. 제목: "${material.title}". JSON 배열만 출력:
[{"question":"문제","options":["A","B","C","D"],"answer":0,"explanation":"해설"}]` }]
            })
          });
          const d = await res.json();
          const text = (d.choices?.[0]?.message?.content || "").replace(/\`\`\`json|\`\`\`/g, "").trim();
          questions = JSON.parse(text);
        } catch { questions = []; }

        if (format === 'word') {
          // docx 스타일 HTML → blob
          const body = questions.map((q: any, i: number) => `
<p><b>${i+1}. ${q.question}</b></p>
${(q.options||[]).map((o: string, j: number) => `<p>${String.fromCharCode(65+j)}. ${o}</p>`).join('')}
<p style="color:#555">▶ 정답: ${String.fromCharCode(65+(q.answer||0))} | ${q.explanation||''}</p><hr/>`).join('');
          const html = `<html><head><meta charset="utf-8"/><style>body{font-family:Arial;font-size:13pt;margin:40px}p{margin:4px 0}</style></head><body><h2>${material.title}</h2>${body}</body></html>`;
          const blob = new Blob([html], { type: 'application/msword' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `${safeName}.doc`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } else {
          // PDF → print-friendly HTML
          const body = questions.map((q: any, i: number) => `
<div style="margin-bottom:20px">
<p><b>${i+1}. ${q.question}</b></p>
${(q.options||[]).map((o: string, j: number) => `<p>${String.fromCharCode(65+j)}. ${o}</p>`).join('')}
<p style="color:#555;font-size:11pt">정답: ${String.fromCharCode(65+(q.answer||0))} | ${q.explanation||''}</p>
</div>`).join('<hr/>');
          const html = `<html><head><meta charset="utf-8"/><style>@media print{body{margin:20mm}}body{font-family:Arial;font-size:13pt;margin:40px}</style></head><body><h2>${material.title}</h2>${body}<script>window.onload=()=>window.print()<\/script></body></html>`;
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `${safeName}.html`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          toast.info("브라우저 인쇄 창에서 PDF로 저장하세요.");
        }
        toast.success(`"${material.title}" 파일 준비 완료!`);
      }
      // 기록
      const rec = { id: `download-${Date.now()}`, materialTitle: material.title, subject: selectedSubject, category: selectedCategory || activeTab, date: new Date().toISOString(), type: 'download' };
      const recs = JSON.parse(localStorage.getItem('myContentRecords') || '[]');
      recs.unshift(rec); localStorage.setItem('myContentRecords', JSON.stringify(recs));
      window.dispatchEvent(new Event('contentRecordsUpdated'));
    } catch(e) { toast.error('다운로드 중 오류가 발생했습니다.'); }
  };

  const handleDownloadClick = (material: any) => {
    setDownloadFormatMaterial(material);
    setShowDownloadFormatModal(true);
    return;
    // Korean school: direct PDF download without modal
    if (schoolType === 'korean') {
      handleDirectPDFDownload(material);
      return;
    }
    // All materials require password for download
    setPendingDownloadMaterial(material);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (inputPassword: string, format: 'word' | 'pdf') => {
    if (!pendingDownloadMaterial) return;

    if (inputPassword === "matanboy00") {
      // Password correct
      const uploadData = pendingDownloadMaterial.uploadData;
      
      if (pendingDownloadMaterial.isUploaded && uploadData && uploadData.fileData) {
        let success = false;
        
        if (format === 'pdf') {
          // PDF download - open print dialog
          try {
            const base64Data = uploadData.fileData.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            if (uploadData.fileType === 'application/pdf') {
              // Already PDF, download directly
              success = downloadFile(uploadData.fileData, uploadData.fileName, uploadData.fileType);
            } else {
              // Convert text to PDF via print
              const decoder = new TextDecoder('utf-8');
              const textContent = decoder.decode(bytes);
              const printHTML = generateExamPrintHTML(textContent, pendingDownloadMaterial.title);
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(printHTML);
                printWindow.document.close();
                printWindow.onload = () => setTimeout(() => printWindow.print(), 300);
                success = true;
              } else {
                toast.error("팝업이 차단되었습니다. 팝업을 허용해주세요.");
              }
            }
          } catch (error) {
            console.error('Error downloading PDF:', error);
            success = false;
          }
        } else {
          // Word download
          if (uploadData.fileType === 'text/plain' || uploadData.fileName?.toLowerCase().endsWith('.txt')) {
            try {
              const base64Data = uploadData.fileData.split(',')[1];
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const decoder = new TextDecoder('utf-8');
              const textContent = decoder.decode(bytes);
              success = await downloadAsWord(textContent, pendingDownloadMaterial.title);
            } catch (error) {
              console.error('Error converting to Word:', error);
              success = false;
            }
          } else {
            success = downloadFile(
              uploadData.fileData,
              uploadData.fileName,
              uploadData.fileType || 'application/octet-stream'
            );
          }
        }
        
        if (success) {
          updateUploadedMaterial(pendingDownloadMaterial.id, {
            downloadCount: (pendingDownloadMaterial.downloadCount || 0) + 1
          });
          
          const downloadRecord = {
            id: `download-${Date.now()}`,
            materialTitle: pendingDownloadMaterial.title,
            subject: selectedSubject,
            category: selectedCategory || activeTab,
            date: new Date().toISOString(),
            fileName: uploadData.fileName,
            fileType: uploadData.fileType,
            fileData: uploadData.fileData,
            type: 'download'
          };
          
          const existingRecords = JSON.parse(localStorage.getItem('myContentRecords') || '[]');
          existingRecords.unshift(downloadRecord);
          localStorage.setItem('myContentRecords', JSON.stringify(existingRecords));
          window.dispatchEvent(new Event('contentRecordsUpdated'));
          
          toast.success(`"${pendingDownloadMaterial.title}" ${format === 'pdf' ? 'PDF' : 'Word'} 파일로 다운로드합니다.`);
        } else {
          toast.error("파일 다운로드 중 오류가 발생했습니다.");
        }
      } else {
        // For default materials
        if (format === 'pdf') {
          const content = `${pendingDownloadMaterial.title}\n\n이 자료는 AllMyExam에서 제공되는 교육 자료입니다.\n다운로드 날짜: ${new Date().toLocaleDateString('ko-KR')}\n\n실제 학습 자료는 별도로 제공될 예정입니다.`;
          const printHTML = generateExamPrintHTML(content, pendingDownloadMaterial.title);
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.onload = () => setTimeout(() => printWindow.print(), 300);
            toast.success(`"${pendingDownloadMaterial.title}" PDF로 다운로드합니다.`);
          }
        } else {
          const success = downloadDefaultFile(pendingDownloadMaterial.title);
          if (success) {
            toast.success(`"${pendingDownloadMaterial.title}" 자료를 다운로드합니다.`);
          } else {
            toast.error("다운로드 중 오류가 발생했습니다.");
          }
        }
      }
      
      setShowPasswordModal(false);
      setPendingDownloadMaterial(null);
    } else {
      toast.error("비밀번호가 올바르지 않습니다.");
    }
  };

  const handlePreviewClick = (material: any) => {
    // 저장된 문제 편집 내용 로드
    const saved = JSON.parse(localStorage.getItem('questionEdits') || '{}');
    setQuestionEdits(saved);
    setSelectedMaterial(material);
    setShowPracticeTest(true);
  };
  
  const handleGlimpseClick = (material: any) => {
    console.log('Glimpse clicked for material:', material);
    console.log('Has uploadData:', !!material.uploadData);
    
    // Check if there's a PDF file in uploadData
    if (material.uploadData?.fileData && material.uploadData?.fileType === 'application/pdf') {
      setSelectedMaterial(material);
      setShowPdfViewer(true);
      
      // Save glimpse record to localStorage
      const glimpseRecord = {
        id: `glimpse-${Date.now()}`,
        materialTitle: material.title,
        subject: selectedSubject,
        category: selectedCategory || activeTab,
        date: new Date().toISOString(),
        fileData: material.uploadData.fileData,
        fileName: material.uploadData.fileName,
        fileType: material.uploadData.fileType,
        type: 'glimpse'
      };
      
      const existingRecords = JSON.parse(localStorage.getItem('myContentRecords') || '[]');
      existingRecords.unshift(glimpseRecord);
      localStorage.setItem('myContentRecords', JSON.stringify(existingRecords));
      window.dispatchEvent(new Event('contentRecordsUpdated'));
    } else {
      toast.error("PDF 파일이 없습니다. 자료 받기용 PDF를 먼저 업로드해주세요.");
    }
  };
  
  // Check if we should show Exam Questions Viewer, Key Notes Viewer, or Practice Test Viewer
  const showExamQuestionsViewer = false; // Disabled - use normal content layout instead
  const showKeyNotesViewer = false; // Disabled - use normal content layout instead
  const showPracticeTestViewer = false; // Disabled - use normal content layout instead
  
  // Check if we should show Voca Page
  const showVocaPage = isCertificationMode && selectedSubject === 'Voca';
  
  // Check if we should show Korean Voca Page
  const showKoreanVocaPage = activeTab === "Voca" && schoolType === 'korean';
  
  // Check if we should show SGR Class
  const showSGRClass = activeTab === "SGR Class" && schoolType === 'korean';
  const [sgrClassFullscreen, setSgrClassFullscreen] = useState(false);

  // SGR Class 탭 선택 시 자동 전체화면
  useEffect(() => {
    if (showSGRClass) {
      setSgrClassFullscreen(true);
    }
  }, [showSGRClass]);

  // Check if we should show SGR Writing
  const showSGRWriting = activeTab === "SGR Writing" && schoolType === 'korean';
  const [sgrWritingFullscreen, setSgrWritingFullscreen] = useState(false);

  // SGR Writing 탭 선택 시 자동 전체화면
  useEffect(() => {
    if (showSGRWriting) {
      setSgrWritingFullscreen(true);
    }
  }, [showSGRWriting]);

  // Check if we should show SGR Voca
  const showSGRVoca = activeTab === "SGR Voca" && schoolType === 'korean';
  const [sgrVocaFullscreen, setSgrVocaFullscreen] = useState(false);

  // SGR Voca 탭 선택 시 자동 전체화면
  useEffect(() => {
    if (showSGRVoca) {
      setSgrVocaFullscreen(true);
    }
  }, [showSGRVoca]);

  // Check if we should show SGR Grammar
  const showSGRGrammar = activeTab === "SGR Grammar" && schoolType === 'korean';
  const [sgrGrammarFullscreen, setSgrGrammarFullscreen] = useState(false);

  // SGR Grammar 탭 선택 시 자동 전체화면
  useEffect(() => {
    if (showSGRGrammar) {
      setSgrGrammarFullscreen(true);
    }
  }, [showSGRGrammar]);

  
  // Check if we should show grid layout for Subject or 보조자료
  const showGridLayout = (activeTab === "Subject" || activeTab === "보조자료") && schoolType === 'international' && selectedSubject === 'AP';
  
  // AP Subject data with icons
  const apSubjects = [
    { 
      icon: Calculator, 
      name: "Mathematics",
      category: "STEM",
      color: "#0288D1",
      description: "Complete resources for Analysis & Approaches and Applications & Interpretation",
      levels: ["SL", "HL"]
    },
    { 
      icon: TestTube, 
      name: "Biology",
      category: "STEM",
      color: "#4CAF50",
      description: "Comprehensive study materials for molecular biology to ecology",
      levels: ["SL", "HL"]
    },
    { 
      icon: Atom, 
      name: "Chemistry",
      category: "STEM",
      color: "#9C27B0",
      description: "From atomic structure to organic chemistry concepts",
      levels: ["SL", "HL"]
    },
    { 
      icon: Globe, 
      name: "Physics",
      category: "STEM",
      color: "#FF5722",
      description: "Mechanics, waves, electricity and modern physics",
      levels: ["SL", "HL"]
    },
    { 
      icon: Globe, 
      name: "Environmental Science",
      category: "STEM",
      color: "#2E8B57",
      description: "Environmental science integrated with social perspectives",
      levels: ["SL"]
    },
    { 
      icon: Users, 
      name: "Business Management",
      category: "Humanities",
      color: "#FF9800",
      description: "Business organization, finance, marketing and operations",
      levels: ["SL", "HL"]
    },
    { 
      icon: DollarSign, 
      name: "Economics",
      category: "Humanities",
      color: "#F44336",
      description: "Microeconomics, macroeconomics and global economy",
      levels: ["SL", "HL"]
    },
    { 
      icon: Leaf, 
      name: "Biology",
      category: "Humanities",
      color: "#4CAF50",
      description: "Biological, cognitive and sociocultural approaches to behavior",
      levels: ["SL", "HL"]
    },
    { 
      icon: Brain, 
      name: "Psychology",
      category: "Humanities",
      color: "#E91E63",
      description: "Biological, cognitive and sociocultural approaches to behavior",
      levels: ["SL", "HL"]
    },
    { 
      icon: BookOpen, 
      name: "English",
      category: "Languages",
      color: "#3F51B5",
      description: "Language and literature analysis",
      levels: ["SL", "HL"]
    },
    { 
      icon: Languages, 
      name: "Spanish B",
      category: "Languages",
      color: "#FFC107",
      description: "Language acquisition and cultural studies",
      levels: ["SL", "HL"]
    },
    { 
      icon: Languages, 
      name: "French B",
      category: "Languages",
      color: "#00BCD4",
      description: "Language acquisition and cultural studies",
      levels: ["SL", "HL"]
    },
    { 
      icon: BookOpen, 
      name: "English B",
      category: "Languages",
      color: "#607D8B",
      description: "Language acquisition for non-native speakers",
      levels: ["SL", "HL"]
    },
  ];

  // Category data
  const apCategories = [
    { 
      name: "STEM", 
      color: "#B3E5FC", 
      icon: Calculator,
      description: "Science, Technology, Engineering, Mathematics"
    },
    { 
      name: "Humanities", 
      color: "#FFE0B2", 
      icon: Users,
      description: "Business, Economics, Psychology"
    },
    { 
      name: "Languages", 
      color: "#D1C4E9", 
      icon: Languages,
      description: "English, Spanish, French"
    }
  ];
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>('Mathematics');

  // Update activeSubject when selectedCategory changes (from sidebar)
  useEffect(() => {
    if (showGridLayout && selectedCategory) {
      // Check if selectedCategory is a subject name
      const subject = apSubjects.find(s => s.name === selectedCategory);
      if (subject) {
        setActiveSubject(subject.name);
        setActiveCategory(subject.category);
      }
    }
  }, [selectedCategory, showGridLayout]);

  return (
    <>
      <div className="bg-white rounded-lg flex-1 max-w-none flex flex-col min-h-0" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        {/* Tabs - Fixed at top - Hide for Voca */}
        {!showVocaPage && (
          <div className="flex flex-wrap mb-0 border-b border-gray-200 relative px-2 pt-2 sm:px-4 sm:pt-4 lg:px-6 pb-0 gap-y-0">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab}
                onClick={() => {
                  if (tab === "실전문제" && schoolType === 'international') {
                    window.open("https://neon-sadly-99060853.figma.site", "_blank");
                  } else {
                    setActiveTab(tab);
                  }
                }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3.5 lg:py-4 text-sm sm:text-base lg:text-lg border-b-2 transition-all duration-200 relative whitespace-nowrap font-bold mr-1 sm:mr-2 flex items-center gap-1.5 sm:gap-2 ${
                  tab === "SGR Class"
                    ? activeTab === tab
                      ? "border-cyan-600 text-cyan-600 bg-cyan-50"
                      : "border-transparent text-cyan-600 hover:bg-cyan-50"
                    : tab === "SGR Writing"
                    ? activeTab === tab
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                      : "border-transparent text-indigo-600 hover:bg-indigo-50"
                    : tab === "SGR Voca"
                    ? activeTab === tab
                      ? "border-rose-600 text-rose-600 bg-rose-50"
                      : "border-transparent text-rose-600 hover:bg-rose-50"
                    : tab === "SGR Grammar"
                    ? activeTab === tab
                      ? "border-emerald-600 text-emerald-600 bg-emerald-50"
                      : "border-transparent text-emerald-600 hover:bg-emerald-50"
                    : activeTab === tab
                    ? "border-cyan-600 text-cyan-600 bg-cyan-50"
                    : "border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab === "국어" || tab === "Subject" ? (
                  <>
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#00C853' }} />
                    <span>{selectedSubject}</span>
                  </>
                ) : tab === "SGR Class" ? (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                    SGR Class
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white leading-none">수업용</span>
                  </span>
                ) : tab === "SGR Writing" ? (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    SGR Writing
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white leading-none">수업용</span>
                  </span>
                ) : tab === "SGR Voca" ? (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                    SGR Voca
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white leading-none">수업용</span>
                  </span>
                ) : tab === "SGR Grammar" ? (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    SGR Grammar
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white leading-none">수업용</span>
                  </span>
                ) : (
                  tab
                )}
                {tab !== "SGR Class" && tab !== "SGR Writing" && tab !== "SGR Voca" && tab !== "SGR Grammar" && (
                  <span className={`text-[10px] sm:text-xs font-bold ml-0.5 ${
                    activeTab === tab ? "text-red-500" : "text-red-400"
                  }`}>
                    {tabCounts[tab] || 0}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    initial={false}
                    className="absolute inset-0 bg-cyan-50 rounded-t-md"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        )}
        
        {/* Scrollable content area */}
        <div id="scrollable-content" className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 pt-3 sm:pt-4">
          {/* Show Exam Questions Viewer, Key Notes Viewer, or Practice Test Viewer if conditions are met */}
          {showExamQuestionsViewer ? (
            <ExamQuestionsViewer 
              subject={selectedSubject} 
              category={selectedCategory} 
            />
          ) : showKeyNotesViewer ? (
            <KeyNotesViewer 
              subject={selectedSubject} 
              category={selectedCategory} 
            />
          ) : showPracticeTestViewer ? (
            <PracticeTestViewer 
              subject={selectedSubject} 
              category={selectedCategory} 
            />
          ) : showVocaPage ? (
            <VocaPage />
          ) : showKoreanVocaPage ? (
            <KoreanVocaPage selectedCategory={selectedCategory} />
          ) : showSGRClass ? (
            <div className="flex items-center justify-center py-20 text-center">
              <div>
                <BookOpen className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">SGR Class</h2>
                <p className="text-gray-500 mb-4">전체화면에서 학습 중입니다</p>
                <button
                  onClick={() => setSgrClassFullscreen(true)}
                  className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors"
                >
                  전체화면 열기
                </button>
              </div>
            </div>
          ) : showSGRWriting ? (
            <div className="flex items-center justify-center py-20 text-center">
              <div>
                <BookOpen className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">SGR Writing</h2>
                <p className="text-gray-500 mb-4">전체화면에서 학습 중입니다</p>
                <button
                  onClick={() => setSgrWritingFullscreen(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  전체화면 열기
                </button>
              </div>
            </div>
          ) : showSGRVoca ? (
            <div className="flex items-center justify-center py-20 text-center">
              <div>
                <BookOpen className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">SGR Voca</h2>
                <p className="text-gray-500 mb-4">전체화면에서 학습 중입니다</p>
                <button
                  onClick={() => setSgrVocaFullscreen(true)}
                  className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
                >
                  전체화면 열기
                </button>
              </div>
            </div>
          ) : showSGRGrammar ? (
            <div className="flex items-center justify-center py-20 text-center">
              <div>
                <BookOpen className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">SGR Grammar</h2>
                <p className="text-gray-500 mb-4">전체화면에서 학습 중입니다</p>
                <button
                  onClick={() => setSgrGrammarFullscreen(true)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  전체화면 열기
                </button>
              </div>
            </div>
          ) : (
            <>
            {/* Header with title and button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 lg:mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-800 font-medium">{activeTab === "국어" || activeTab === "Subject" ? selectedSubject : activeTab}</h1>
                {!showGridLayout && (
                  <motion.span 
                    key={`count-${activeTab}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="ml-3 lg:ml-4 bg-cyan-100 text-cyan-700 px-3 py-1.5 text-sm sm:text-base rounded-full font-medium"
                  >
                    총 {materials.length}개
                  </motion.span>
                )}
              </div>
              <button 
                onClick={() => {
                  if (schoolType === 'korean') {
                    // 한국학교에서는 VIP 콘텐츠룸 모달 열기
                    setShowMyContentRoom(true);
                  } else if (isCertificationMode) {
                    // 인증시험 모드에서는 서브도메인으로 이동
                    if (selectedSubject === 'TOEFL') {
                      window.open('https://toefl.allmyexam.com', '_blank');
                    } else if (selectedSubject === 'SAT') {
                      window.open('https://www.sat.allmyexam.com', '_blank');
                    } else {
                      // 다른 시험의 경우 외부 링크
                      window.open('https://tux-stood-50280581.figma.site', '_blank');
                    }
                  } else if (schoolType === 'international') {
                    // 국제학교 모드에서 AP는 서브도메인, 나머지는 Component5
                    if (selectedSubject === 'AP') {
                      window.open('https://www.ap.allmyexam.com', '_blank');
                    } else {
                      const vipSubjects = ['IB', 'A-level', 'AS', 'IGCSE'];
                      if (vipSubjects.includes(selectedSubject) && onComponent5Click) {
                        onComponent5Click();
                      } else {
                        // GPA, Writing 등 기타 과목은 외부 링크
                        window.open('https://neon-sadly-99060853.figma.site/', '_blank');
                      }
                    }
                  } else {
                    window.open('https://neon-sadly-99060853.figma.site/', '_blank');
                  }
                }}
                className="bg-cyan-600 text-white px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg hover:bg-cyan-700 transition-colors self-start sm:self-auto min-h-10 sm:min-h-12"
              >
                VIP 콘텐츠룸
              </button>
            </div>
            
            {/* Grid Layout for Subject and 보조자료 */}
            {showGridLayout ? (
              <>
                {/* Show categories if no category is selected */}
                {!activeCategory ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-w-5xl">
                    {apCategories.map((category, index) => {
                      return (
                        <CategoryCard
                          key={category.name}
                          category={category}
                          index={index}
                          onClick={() => setActiveCategory(category.name)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <>
                    {/* Back button and category title */}
                    <div className="mb-6 flex items-center gap-4">
                      <motion.button
                        onClick={() => {
                          setActiveCategory(null);
                          setActiveSubject('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                        <span>Back to Categories</span>
                      </motion.button>
                      <h2 className="text-2xl font-bold" style={{ color: apCategories.find(c => c.name === activeCategory)?.color }}>
                        {activeCategory}
                      </h2>
                    </div>

                    {/* Subject Grid - Filtered by category */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3 mb-6">
                      {apSubjects.filter(s => s.category === activeCategory).map((subject, index) => {
                        const Icon = subject.icon;
                        const isSelected = activeSubject === subject.name;
                        return (
                          <motion.button
                            key={subject.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setActiveSubject(subject.name)}
                            className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl transition-all group"
                            style={{
                              backgroundColor: isSelected ? subject.color : '#f8f9fa',
                              boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div 
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mb-1.5 sm:mb-2"
                              style={{
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'white'
                              }}
                            >
                              <Icon 
                                className="w-5 h-5 sm:w-6 sm:h-6" 
                                style={{ color: isSelected ? 'white' : subject.color }} 
                              />
                            </motion.div>
                            <span 
                              className="text-[10px] sm:text-xs text-center font-medium leading-tight px-1"
                              style={{
                                color: isSelected ? 'white' : '#2e4871'
                              }}
                            >
                              {subject.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Selected Subject Details - Expanded - Only show when subject is selected */}
                {activeSubject && activeCategory && (
                  <motion.div 
                    key={activeSubject}
                    className="mt-6 p-10 bg-white rounded-2xl border border-gray-200 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {(() => {
                      const currentSubject = apSubjects.find(s => s.name === activeSubject);
                      if (!currentSubject) return null;

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <motion.div
                          className="lg:col-span-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.h3 
                            className="font-extrabold text-3xl mb-6"
                            animate={{ color: currentSubject.color }}
                          >
                            AP {currentSubject.name}
                          </motion.h3>
                          
                          <div className="space-y-4 mb-8">
                            <p className="text-[#2e4871] leading-relaxed text-base">
                              {currentSubject.description}
                            </p>
                            
                            {/* Additional description space for longer content */}
                            <p className="text-[#2e4871] leading-relaxed text-base">
                              Our comprehensive {currentSubject.name} program provides in-depth coverage of all essential topics, 
                              combining theoretical knowledge with practical applications to ensure complete mastery of the subject.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-[#032254] font-bold">Available Levels:</h4>
                            <div className="flex space-x-4">
                              {currentSubject.levels.map((level, index) => (
                                <motion.div 
                                  key={level}
                                  className="px-4 py-2 rounded-lg border cursor-pointer"
                                  style={{ borderColor: currentSubject.color }}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.3 + index * 0.1 }}
                                  whileHover={{ 
                                    backgroundColor: currentSubject.color,
                                    color: "#ffffff",
                                    scale: 1.05 
                                  }}
                                >
                                  <span className="font-bold text-sm">{level}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {currentSubject.name === "Mathematics" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <div>
                                <h4 className="font-medium text-gray-800 mb-3">Analysis & Approaches</h4>
                                <div className="space-y-2">
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between" style={{ color: currentSubject.color }}>
                                    SL
                                    <span className="text-gray-400">→</span>
                                  </button>
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between" style={{ color: currentSubject.color }}>
                                    HL
                                    <span className="text-gray-400">→</span>
                                  </button>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800 mb-3">Applications & Interpretation</h4>
                                <div className="space-y-2">
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between" style={{ color: currentSubject.color }}>
                                    SL
                                    <span className="text-gray-400">→</span>
                                  </button>
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between" style={{ color: currentSubject.color }}>
                                    HL
                                    <span className="text-gray-400">→</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>

                        <motion.div 
                          className="flex justify-center items-start pt-8"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div 
                            className="w-full max-w-sm h-64 rounded-2xl flex items-center justify-center relative overflow-hidden"
                            animate={{ 
                              background: `linear-gradient(135deg, ${currentSubject.color}20, ${currentSubject.color}40)`,
                              borderColor: currentSubject.color 
                            }}
                            style={{ border: `2px solid ${currentSubject.color}20` }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 opacity-10"
                              style={{ background: `conic-gradient(from 0deg, transparent, ${currentSubject.color}, transparent)` }}
                            />
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            >
                              <currentSubject.icon 
                                className="w-28 h-28 relative z-10" 
                                style={{ color: currentSubject.color }} 
                              />
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </div>
                    );
                  })()}
                  </motion.div>
                )}
              </>
            ) : (
              <>
            {/* Search bar */}
        <motion.div
          key={`search-${activeTab}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-5 lg:mb-6"
        >
          <select className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-3 text-sm sm:text-base focus:border-cyan-500 focus:outline-none transition-colors min-h-10 sm:min-h-12">
            <option>전체</option>
            <option>적문제</option>
            <option>핵심체크</option>
            <option>단원별</option>
            <option>모의고사</option>
          </select>
          <div className="flex flex-1 lg:max-w-96">
            <input
              type="text"
              placeholder={`${activeTab} 검색어를 입력해 주세요.`}
              className="flex-1 bg-white border border-gray-300 rounded-l-lg px-3 sm:px-4 py-3 text-sm sm:text-base focus:border-cyan-500 focus:outline-none transition-colors min-h-10 sm:min-h-12"
            />
            <button className="bg-white border border-l-0 border-gray-300 rounded-r-lg px-4 sm:px-5 py-3 text-sm sm:text-base text-gray-600 hover:bg-gray-50 hover:text-cyan-600 transition-colors min-h-10 sm:min-h-12">
              검색
            </button>
          </div>
        </motion.div>
        
        {/* Materials table with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden rounded-lg border border-gray-200"
          >
            {/* Desktop: table layout */}
            <table className="w-full hidden sm:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm text-gray-700 font-medium">제목</th>
                  <th className="text-center py-2 px-4 text-sm text-gray-700 font-medium w-48">자료관리</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMaterials.map((material, index) => (
                  <motion.tr
                    key={`${activeTab}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${material.isUploaded ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center overflow-hidden">
                        <a 
                          href="#" 
                          className="text-gray-800 hover:text-cyan-600 text-sm transition-colors flex-1 truncate min-w-0"
                          title={material.title}
                        >
                          {material.isUploaded && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          )}
                          {material.title}
                        </a>
                        <span className="text-gray-400 text-xs ml-3 whitespace-nowrap flex-shrink-0">
                          [{material.count}]
                        </span>
                        {material.isNew && (
                          <motion.img 
                            src={imgRectangle8} 
                            alt="New" 
                            className="w-3 h-3 ml-2 flex-shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePreviewClick(material)}
                          className="bg-white border border-gray-300 rounded px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-all whitespace-nowrap"
                        >
                          시험보기
                        </button>
                        <button
                          onClick={() => handleDownloadClick(material)}
                          className="flex items-center justify-center bg-white border border-gray-300 rounded px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:border-cyan-300 transition-all whitespace-nowrap"
                        >
                          <img src={imgRectangle9} alt="" className="w-3 h-3 mr-1" />
                          다운로드
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Mobile: card layout */}
            <div className="sm:hidden divide-y divide-gray-100">
              {paginatedMaterials.map((material, index) => (
                <motion.div
                  key={`mobile-${activeTab}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`px-3 py-3 ${material.isUploaded ? 'bg-blue-50/60' : ''}`}
                >
                  {/* 제목 줄 */}
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {material.isUploaded && (
                          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                        )}
                        {material.isNew && (
                          <motion.img 
                            src={imgRectangle8} 
                            alt="New" 
                            className="w-3 h-3 flex-shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
                          />
                        )}
                        <span className="text-gray-400 text-[10px]">[{material.count}]</span>
                      </div>
                      <a 
                        href="#" 
                        className="text-gray-800 hover:text-cyan-600 text-[13px] font-medium transition-colors leading-snug line-clamp-2"
                        title={material.title}
                      >
                        {material.title}
                      </a>
                    </div>
                  </div>
                  {/* 버튼 줄 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreviewClick(material)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg py-2.5 text-xs text-white font-medium text-center shadow-sm active:opacity-80 transition-all"
                    >
                      시험보기
                    </button>
                    <button
                      onClick={() => handleDownloadClick(material)}
                      className="flex-1 flex items-center justify-center bg-white border border-gray-300 rounded-lg py-2.5 text-xs text-gray-700 font-medium active:bg-gray-100 transition-all"
                    >
                      <img src={imgRectangle9} alt="" className="w-3 h-3 mr-1.5" />
                      다운로드
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Pagination */}
        <div className="flex justify-center mt-6 sm:mt-8 lg:mt-10">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Previous button */}
            {currentPage > 1 && (
              <button 
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <img src={imgRectangle10} alt="Prev" className="w-5 h-5 sm:w-6 sm:h-6 rotate-180" />
              </button>
            )}
            
            {/* Page numbers - show only relevant pages */}
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full text-sm sm:text-base lg:text-lg transition-colors flex items-center justify-center font-medium ${
                  currentPage === page 
                    ? "bg-gray-600 text-white shadow-md" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            {/* Next button */}
            {currentPage < totalPages && (
              <button 
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <img src={imgRectangle10} alt="Next" className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>
        </div>
              </>
            )}
            </>
          )}
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-8 w-full max-w-md"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <img 
                  src={authModalImg} 
                  alt="All My Exam 로고" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">아이디</label>
                <Input
                  type="text"
                  placeholder="아디를 입력해주세요"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">비밀번호</label>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button
                onClick={handleAuthSubmit}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                로그인
              </Button>
              <Button
                variant="outline"
                className="w-full"
              >
                회원가입
              </Button>
            </div>
            
            <div className="mt-4 text-center">
              <button className="text-sm text-gray-500 hover:text-gray-700">
                아이디 찾기 비밀번호 찾기
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowAuthModal(false);
                setPassword("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}




      {/* 문제 해설/분석/단어 편집 모달 */}
      {showQuestionEditModal && editingMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">문제 편집</h2>
                <p className="text-xs text-gray-500 mt-0.5">{editingMaterial.title} — 해설 · 분석 · 단어</p>
              </div>
              <button
                onClick={() => { setShowQuestionEditModal(false); setEditingMaterial(null); }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >✕</button>
            </div>
            {/* 편집 영역 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {[1, 2, 3].map((qNum) => {
                const key = `${editingMaterial.title}-Q${qNum}`;
                const edit = questionEdits[key] || { explanation: '', analysis: '', vocab: '' };
                return (
                  <div key={qNum} className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-700">문제 {qNum}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* 해설 */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mb-1.5">
                          <span>💡</span> 해설
                        </label>
                        <textarea
                          value={edit.explanation}
                          onChange={(e) => setQuestionEdits(prev => ({ ...prev, [key]: { ...edit, explanation: e.target.value } }))}
                          placeholder="문제 해설을 입력하세요..."
                          className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 bg-amber-50/30 resize-none"
                          rows={3}
                        />
                      </div>
                      {/* 분석 */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-1.5">
                          <span>📊</span> 분석
                        </label>
                        <textarea
                          value={edit.analysis}
                          onChange={(e) => setQuestionEdits(prev => ({ ...prev, [key]: { ...edit, analysis: e.target.value } }))}
                          placeholder="정답 분석 및 오답 해설을 입력하세요..."
                          className="w-full text-sm border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 bg-blue-50/30 resize-none"
                          rows={3}
                        />
                      </div>
                      {/* 단어 */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 mb-1.5">
                          <span>📖</span> 단어
                        </label>
                        <textarea
                          value={edit.vocab}
                          onChange={(e) => setQuestionEdits(prev => ({ ...prev, [key]: { ...edit, vocab: e.target.value } }))}
                          placeholder="주요 어휘 및 표현을 입력하세요..."
                          className="w-full text-sm border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 bg-violet-50/30 resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* 탭 이름/이모지 설정 */}
            <div className="px-6 py-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-1.5">
                <span>🎛️</span> 해설·분석·단어 탭 설정
              </p>
              <div className="space-y-2">
                {feedbackTabs.map((tab, ti) => (
                  <div key={tab.key} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tab.emoji}
                      onChange={(e) => setFeedbackTabs(prev => prev.map((t, i) => i === ti ? { ...t, emoji: e.target.value } : t))}
                      className="w-14 text-center text-base border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-400"
                      maxLength={4}
                    />
                    <input
                      type="text"
                      value={tab.label}
                      onChange={(e) => setFeedbackTabs(prev => prev.map((t, i) => i === ti ? { ...t, label: e.target.value } : t))}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
                      placeholder="탭 이름"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* 저장 버튼 */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => { setShowQuestionEditModal(false); setEditingMaterial(null); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // localStorage에 저장
                  const saved = JSON.parse(localStorage.getItem('questionEdits') || '{}');
                  const merged = { ...saved, ...questionEdits };
                  localStorage.setItem('questionEdits', JSON.stringify(merged));
                  localStorage.setItem('feedbackTabsConfig', JSON.stringify(feedbackTabs));
                  setShowQuestionEditModal(false);
                  setEditingMaterial(null);
                }}
                className="px-5 py-2 text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:opacity-90"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Practice Test */}
      {showPracticeTest && selectedMaterial && (
        <InteractivePracticeTest
          materialTitle={selectedMaterial.title}
          material={selectedMaterial}
          questionEdits={questionEdits}
          feedbackTabs={feedbackTabs}
          onExit={() => {
            setShowPracticeTest(false);
            setSelectedMaterial(null);
          }}
        />
      )}

      {/* Download Format Modal */}
      {showDownloadFormatModal && downloadFormatMaterial && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDownloadFormatModal(false)}>
          <div className="bg-white w-full sm:w-80 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-800 mb-1">다운로드 형식 선택</h3>
            <p className="text-xs text-gray-400 mb-5 truncate">{downloadFormatMaterial.title}</p>
            <div className="space-y-3">
              <button
                onClick={() => handleDownloadWithFormat(downloadFormatMaterial, 'pdf')}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-red-100 hover:border-red-300 hover:bg-red-50 transition-all"
              >
                <span className="text-2xl">📄</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">PDF 다운로드</p>
                  <p className="text-xs text-gray-400">인쇄 가능한 PDF 파일</p>
                </div>
              </button>
              <button
                onClick={() => handleDownloadWithFormat(downloadFormatMaterial, 'word')}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <span className="text-2xl">📝</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">Word 다운로드</p>
                  <p className="text-xs text-gray-400">편집 가능한 .doc 파일</p>
                </div>
              </button>
            </div>
            <button onClick={() => setShowDownloadFormatModal(false)} className="mt-4 w-full py-2.5 text-xs text-gray-400 hover:text-gray-600">취소</button>
          </div>
        </div>
      )}

      {/* Password Modal for Downloads */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingDownloadMaterial(null);
        }}
        onSubmit={handlePasswordSubmit}
        materialTitle={pendingDownloadMaterial?.title || ""}
      />

      {/* PDF Viewer Modal for Glimpse */}
      {showPdfViewer && selectedMaterial?.uploadData?.fileData && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b flex items-center justify-between px-4 z-10">
            <h2 className="font-medium text-gray-800">
              힐끗보기 - {selectedMaterial?.title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPdfViewer(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* PDF Content - Full Screen */}
          <div className="absolute top-12 left-0 right-0 bottom-0">
            <iframe
              src={selectedMaterial.uploadData.fileData}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}

      {/* My Content Room Modal */}
      {showMyContentRoom && (
        <MyContentRoom onClose={() => setShowMyContentRoom(false)} />
      )}



      {/* SGR Class Fullscreen Overlay */}
      <AnimatePresence>
        {sgrClassFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-white flex flex-col"
          >
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-800">SGR Class</h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm">수업용</span>
                  </div>
                  <p className="text-xs text-gray-400">{selectedSubject} · {selectedCategory || '전체'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSgrClassFullscreen(false);
                  setActiveTab(tabs[0] || '국어');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                닫기
              </button>
            </div>
            {/* Fullscreen Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <SGRClassViewer />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SGR Writing Fullscreen Overlay */}
      <AnimatePresence>
        {sgrWritingFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-white flex flex-col"
          >
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-800">SGR Writing</h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm">수업용</span>
                  </div>
                  <p className="text-xs text-gray-400">{selectedSubject} · {selectedCategory || '전체'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSgrWritingFullscreen(false);
                  setActiveTab(tabs[0] || '국어');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                닫기
              </button>
            </div>
            {/* Fullscreen Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <SGRWritingViewer />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SGR Grammar Fullscreen Overlay */}
      <AnimatePresence>
        {sgrGrammarFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-white flex flex-col"
          >
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-800">SGR Grammar</h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">수업용</span>
                  </div>
                  <p className="text-xs text-gray-400">{selectedSubject} · {selectedCategory || '전체'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSgrGrammarFullscreen(false);
                  setActiveTab(tabs[0] || '국어');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                닫기
              </button>
            </div>
            {/* Fullscreen Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <SGRGrammarViewer />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SGR Voca Fullscreen Overlay */}
      <AnimatePresence>
        {sgrVocaFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-white flex flex-col"
          >
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-800">SGR Voca</h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm">수업용</span>
                  </div>
                  <p className="text-xs text-gray-400">{selectedSubject} · {selectedCategory || '전체'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSgrVocaFullscreen(false);
                  setActiveTab(tabs[0] || '국어');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                닫기
              </button>
            </div>
            {/* Fullscreen Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <SGRVocaViewer />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Generate Korean school exam style PDF HTML (한국학교 정기고사 스타일)
function generateKoreanExamStyleHTML(content: string, title: string, subject: string, category: string): string {
  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const lines = content.split('\n').filter(l => l.trim());
  
  // Try to parse questions from content
  const questions: { num: number; text: string; options: string[]; isPassage?: boolean; passageText?: string }[] = [];
  let currentPassage = '';
  let currentQuestion = '';
  let currentOptions: string[] = [];
  let qNum = 0;
  let isInPassage = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect passage markers
    if (line.startsWith('[지문]') || line.startsWith('※') || line.match(/^다음.*읽고.*답하/)) {
      isInPassage = true;
      currentPassage = line.replace('[지문]', '').trim();
      continue;
    }
    
    // Detect question numbers
    const qMatch = line.match(/^(\d+)\.\s*(.*)/);
    if (qMatch) {
      // Save previous question
      if (currentQuestion) {
        qNum++;
        questions.push({
          num: qNum,
          text: currentQuestion,
          options: [...currentOptions],
          isPassage: !!currentPassage,
          passageText: currentPassage || undefined
        });
        currentOptions = [];
        if (!isInPassage) currentPassage = '';
      }
      currentQuestion = qMatch[2];
      isInPassage = false;
      continue;
    }
    
    // Detect options (①②③④⑤ or (1)(2) or A. B. etc)
    const optMatch = line.match(/^[①②③④⑤\(]\s*(.*)/);
    const alphaOptMatch = line.match(/^[A-E]\.\s*(.*)/);
    if (optMatch || alphaOptMatch) {
      currentOptions.push(line);
      continue;
    }
    
    // Accumulate passage or content
    if (isInPassage || (!currentQuestion && !qMatch)) {
      currentPassage += (currentPassage ? '\n' : '') + line;
    } else if (currentQuestion) {
      currentQuestion += ' ' + line;
    }
  }
  
  // Push last question
  if (currentQuestion) {
    qNum++;
    questions.push({
      num: qNum,
      text: currentQuestion,
      options: [...currentOptions],
      isPassage: !!currentPassage,
      passageText: currentPassage || undefined
    });
  }
  
  // If no questions parsed, treat entire content as a document
  const hasQuestions = questions.length > 0;
  
  // Build question HTML
  let questionsHTML = '';
  let lastPassage = '';
  
  if (hasQuestions) {
    for (const q of questions) {
      // Render passage if different from last
      if (q.passageText && q.passageText !== lastPassage) {
        lastPassage = q.passageText;
        questionsHTML += `
          <div style="margin:16px 0;padding:12px 16px;border:1.5px solid #d1d5db;border-radius:6px;background:#fafbfc;">
            <div style="font-size:9pt;color:#666;font-weight:bold;margin-bottom:6px;">※ 다음 글을 읽고 물음에 답하시오.</div>
            <div style="font-size:10pt;line-height:1.8;color:#333;text-align:justify;">${q.passageText.replace(/\n/g, '<br>')}</div>
          </div>`;
      }
      
      const optionsHTML = q.options.map(opt => 
        `<span style="display:inline-block;margin-right:14px;margin-bottom:3px;font-size:10pt;color:#333;">${opt}</span>`
      ).join('');
      
      questionsHTML += `
        <div style="margin-bottom:18px;page-break-inside:avoid;">
          <div style="display:flex;gap:6px;align-items:flex-start;">
            <div style="font-weight:bold;font-size:11pt;min-width:28px;color:#1a1a1a;">${q.num}.</div>
            <div style="flex:1;">
              <div style="font-size:10.5pt;line-height:1.7;color:#1a1a1a;margin-bottom:6px;">${q.text}</div>
              ${q.options.length > 0 ? `<div style="padding-left:2px;line-height:1.9;">${optionsHTML}</div>` : `<div style="border-bottom:1px dashed #ccc;padding:10px 0;min-height:30px;"></div>`}
            </div>
          </div>
        </div>`;
    }
  } else {
    // No questions: render content as text in 2-column layout
    const midpoint = Math.ceil(lines.length / 2);
    const leftLines = lines.slice(0, midpoint);
    const rightLines = lines.slice(midpoint);
    
    questionsHTML = `
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:48%;vertical-align:top;padding-right:12px;">
            ${leftLines.map(l => `<p style="margin:0 0 6px;font-size:10pt;line-height:1.7;color:#333;">${l}</p>`).join('')}
          </td>
          <td style="width:4%;border-left:1px solid #e5e7eb;"></td>
          <td style="width:48%;vertical-align:top;padding-left:12px;">
            ${rightLines.map(l => `<p style="margin:0 0 6px;font-size:10pt;line-height:1.7;color:#333;">${l}</p>`).join('')}
          </td>
        </tr>
      </table>`;
  }
  
  const totalQ = hasQuestions ? questions.length : '-';
  const subjectDisplay = subject || '영어';
  const gradeDisplay = category || '';
  
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title} - 시험지</title>
<style>
  @page { size: A4; margin: 15mm 12mm; }
  body {
    font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
    margin: 0; padding: 0; color: #333;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
    line-height: 1.5;
  }
  table { border-collapse: collapse; }
  td, th { vertical-align: top; }
  @media print {
    .no-break { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <div style="padding:0;">
    <!-- ═══ 시험지 헤더 (한국학교 정기고사 스타일) ═══ -->
    <table style="width:100%;border-collapse:collapse;border:2.5px solid #222;margin-bottom:14px;">
      <tr>
        <td rowspan="2" style="width:100px;padding:10px;text-align:center;border-right:2px solid #222;vertical-align:middle;">
          <div style="font-size:10pt;font-weight:900;color:#00838f;line-height:1.3;">All My<br>Exam</div>
          <div style="font-size:7pt;color:#999;margin-top:2px;">⚡</div>
        </td>
        <td style="padding:6px 14px;border-bottom:1px solid #bbb;border-right:1px solid #bbb;text-align:center;">
          <div style="font-size:8pt;color:#888;margin-bottom:2px;">${gradeDisplay}</div>
          <div style="font-size:16pt;font-weight:900;color:#1a1a1a;letter-spacing:3px;">${title.length > 20 ? title.substring(0, 20) : title}</div>
        </td>
        <td rowspan="2" style="width:90px;padding:6px 10px;text-align:center;border-left:0;vertical-align:middle;">
          <div style="font-size:14pt;font-weight:900;color:#1a1a1a;">${subjectDisplay}</div>
        </td>
        <td rowspan="2" style="width:150px;padding:6px 8px;vertical-align:top;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="border:1px solid #aaa;padding:4px 8px;font-size:8pt;font-weight:bold;background:#f5f5f5;width:36px;">학년</td>
              <td style="border:1px solid #aaa;padding:4px 8px;font-size:8pt;">${gradeDisplay}</td>
            </tr>
            <tr>
              <td style="border:1px solid #aaa;padding:4px 8px;font-size:8pt;font-weight:bold;background:#f5f5f5;">반</td>
              <td style="border:1px solid #aaa;padding:4px 8px;font-size:8pt;"></td>
            </tr>
            <tr>
              <td style="border:1px solid #aaa;padding:4px 8px;font-size:8pt;font-weight:bold;background:#f5f5f5;">번호</td>
              <td style="border:1px solid #aaa;padding:4px 8px;font-size:8pt;"></td>
            </tr>
            <tr>
              <td style="border:1px solid #aaa;padding:4px 8px;font-size:8pt;font-weight:bold;background:#f5f5f5;">이름</td>
              <td style="border:1px solid #aaa;padding:4px 8px;font-size:8pt;"></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:5px 14px;text-align:center;">
          <span style="font-size:8pt;color:#666;">${date}</span>
        </td>
      </tr>
    </table>

    <!-- ═══ 유의사항 ═══ -->
    <div style="border:1px solid #d1d5db;border-radius:4px;padding:8px 14px;margin-bottom:16px;background:#f8fafc;font-size:8pt;color:#555;line-height:1.6;">
      · 먼저 답안지에 성명, 학년, 과목코드를 기입하시오.<br>
      · 문항을 읽고 맞는 답을 답란에 표시하시오.${hasQuestions ? `<br>· 총 ${totalQ}문항입니다.` : ''}
    </div>

    <!-- ═══ 문제 영역 ═══ -->
    ${questionsHTML}

    <!-- ═══ 페이지 하단 ═══ -->
    <div style="margin-top:24px;border-top:1px solid #ddd;padding-top:6px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:7pt;color:#bbb;">⚡ AllMyExam</div>
      <div style="font-size:8pt;color:#999;">- 1 -</div>
    </div>
  </div>
</body>
</html>`;
}

// Generate exam-style print HTML for PDF download
function generateExamPrintHTML(content: string, title: string): string {
  const date = new Date().toLocaleDateString('ko-KR');
  const lines = content.split('\n');
  const bodyContent = lines.map(line => 
    `<p style="margin:0 0 6px 0;font-size:11pt;line-height:1.6;color:#333;">${line || '&nbsp;'}</p>`
  ).join('');
  
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; padding: 0; color: #333; }
</style>
</head>
<body>
  <div style="border-bottom:2px solid #00bcd4;padding-bottom:12px;margin-bottom:20px;">
    <div style="font-size:18pt;font-weight:bold;color:#00838f;margin-bottom:6px;">AllMyExam</div>
    <div style="font-size:14pt;font-weight:bold;color:#333;">${title}</div>
    <div style="font-size:9pt;color:#888;margin-top:4px;">날짜: ${date} | allmyexam.com</div>
  </div>
  <div style="margin-bottom:16px;">
    <table style="width:100%;font-size:10pt;color:#555;">
      <tr>
        <td>이름: ____________________</td>
        <td style="text-align:right;">점수: _____ / _____</td>
      </tr>
    </table>
  </div>
  <div>${bodyContent}</div>
  <div style="margin-top:30px;border-top:1px solid #eee;padding-top:8px;text-align:center;font-size:8pt;color:#aaa;">
    AllMyExam | allmyexam.com
  </div>
</body>
</html>`;
}
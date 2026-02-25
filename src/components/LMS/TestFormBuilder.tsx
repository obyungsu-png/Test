import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Trash2, ChevronDown, ChevronUp, Save, FileText, Sparkles, Copy, HelpCircle, Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { getSubjectStructure } from "../utils/dataManager";
import { KOREAN_SCHOOL_TABS, INTERNATIONAL_SCHOOL_TABS, CERTIFICATION_TABS } from "../constants/defaultContent";

interface QuestionFormData {
  id: string;
  questionText: string;
  passage?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  optionFormat: 'A-E' | '가-마' | '①-⑤';
}

interface TestFormBuilderProps {
  onSave?: (txtContent: string, testTitle: string, metadata?: {
    schoolType: string;
    subject: string;
    level: string;
    category: string;
    contentType: string;
    title: string;
    description: string;
    password: string;
  }, pdfFile?: File) => void;
}

export default function TestFormBuilder({ onSave }: TestFormBuilderProps) {
  const [schoolType, setSchoolType] = useState<'korean' | 'international' | 'certification'>('korean');
  const [uploadData, setUploadData] = useState({
    subject: "",
    level: "",
    category: "",
    contentType: "",
    title: "",
    description: "",
    password: ""
  });
  const [questions, setQuestions] = useState<QuestionFormData[]>([
    {
      id: "1",
      questionText: "",
      passage: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
      explanation: "",
      optionFormat: 'A-E'
    }
  ]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set(["1"]));
  const [showTemplates, setShowTemplates] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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

  const currentLevels = subjectHierarchy[uploadData.subject] || {};
  const currentCategories = currentLevels[uploadData.level] || [];
  const contentTypes = getContentTypes();

  // Template examples
  const templates = [
    {
      id: "reading",
      name: "독해 문제 템플릿",
      description: "지문이 있는 독해 문제",
      data: {
        questionText: "다음 글의 주제로 가장 적절한 것은?",
        passage: "여기에 지문을 입력하세요...",
        options: ["첫 번째 선택지", "두 번째 선택지", "세 번째 선택지", "네 번째 선택지"],
        correctAnswer: "A",
        explanation: "해설을 입력하세요...",
        optionFormat: 'A-E' as const
      }
    },
    {
      id: "grammar",
      name: "문법 문제 템플릿",
      description: "어법 선택 문제",
      data: {
        questionText: "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
        passage: "",
        options: ["is", "are", "was", "were"],
        correctAnswer: "A",
        explanation: "주어가 단수이므로 is가 적절합니다.",
        optionFormat: 'A-E' as const
      }
    },
    {
      id: "toefl",
      name: "TOEFL Reading 템플릿",
      description: "TOEFL 독해 문제 형식",
      data: {
        questionText: "According to the passage, which of the following is true about...?",
        passage: "The passage discusses the concept of sustainable development, which aims to meet the needs of the present without compromising the ability of future generations to meet their own needs. This approach requires balancing economic growth with environmental protection and social equity.\n\nSustainable development has become a crucial framework for addressing global challenges. It emphasizes the interconnection between environmental health, economic prosperity, and social well-being. Organizations worldwide are adopting sustainable practices to ensure long-term viability.",
        options: [
          "Sustainable development focuses only on environmental protection",
          "Economic growth must be sacrificed for sustainability",
          "Sustainable development balances present needs with future generations' needs",
          "Social equity is not a component of sustainable development"
        ],
        correctAnswer: "C",
        explanation: "The passage clearly states that sustainable development 'aims to meet the needs of the present without compromising the ability of future generations to meet their own needs.' This matches option C.",
        optionFormat: 'A-E' as const
      }
    },
    {
      id: "sat",
      name: "SAT Reading 템플릿",
      description: "SAT 독해 문제 형식",
      data: {
        questionText: "The main purpose of the passage is to",
        passage: "Scientists have long debated the role of genetics versus environment in human development. Recent studies suggest that both factors interact in complex ways, with neither being solely responsible for determining outcomes. The interplay between genetic predispositions and environmental influences creates a dynamic system that shapes individual characteristics and behaviors.\n\nThis perspective, known as the interactionist approach, has gained prominence in contemporary research. It acknowledges that genes provide a foundation, but environmental factors can significantly modify how those genes are expressed.",
        options: [
          "argue that genetics alone determines human traits",
          "present an overview of how genetics and environment interact",
          "criticize traditional views of human development",
          "propose a new theory of genetic expression",
          "dismiss the importance of environmental factors"
        ],
        correctAnswer: "B",
        explanation: "The passage provides a balanced overview of how both genetics and environment work together in human development, presenting the interactionist approach. This is best captured by option B.",
        optionFormat: 'A-E' as const
      }
    },
    {
      id: "korean",
      name: "한글 선택지 템플릿",
      description: "가, 나, 다 형식",
      data: {
        questionText: "다음 중 옳은 것을 고르시오.",
        passage: "",
        options: ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
        correctAnswer: "가",
        explanation: "",
        optionFormat: '가-마' as const
      }
    },
    {
      id: "numbered",
      name: "번호 선택지 템플릿",
      description: "①, ②, ③ 형식",
      data: {
        questionText: "문제를 입력하세요.",
        passage: "",
        options: ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
        correctAnswer: "①",
        explanation: "",
        optionFormat: '①-⑤' as const
      }
    }
  ];

  const applyTemplate = (template: typeof templates[0]) => {
    const newQuestions = [...questions];
    const lastIndex = questions.length - 1;
    newQuestions[lastIndex] = {
      ...newQuestions[lastIndex],
      ...template.data
    };
    setQuestions(newQuestions);
    setShowTemplates(false);
    toast.success(`"${template.name}" 템플릿이 적용되었습니다!`);
  };

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = questions.find(q => q.id === questionId);
    if (!questionToDuplicate) return;

    const newId = String(Date.now());
    const duplicated = {
      ...questionToDuplicate,
      id: newId,
      questionText: questionToDuplicate.questionText + " (복사본)"
    };
    
    const index = questions.findIndex(q => q.id === questionId);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, duplicated);
    setQuestions(newQuestions);
    
    setExpandedQuestions(new Set([...expandedQuestions, newId]));
    toast.success("문제가 복사되었습니다.");
  };

  const addQuestion = () => {
    const newId = String(questions.length + 1);
    setQuestions([...questions, {
      id: newId,
      questionText: "",
      passage: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
      explanation: "",
      optionFormat: 'A-E'
    }]);
    setExpandedQuestions(new Set([...expandedQuestions, newId]));
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) {
      toast.error("최소 1개의 문제가 필요합니다.");
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
    const newExpanded = new Set(expandedQuestions);
    newExpanded.delete(id);
    setExpandedQuestions(newExpanded);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedQuestions(newExpanded);
  };

  const updateQuestion = (id: string, field: keyof QuestionFormData, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        // If changing option format, reset correct answer
        if (field === 'optionFormat') {
          return { ...q, [field]: value, correctAnswer: getDefaultAnswer(value) };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length < 5) {
        return { ...q, options: [...q.options, ""] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const getDefaultAnswer = (format: string): string => {
    switch (format) {
      case '가-마': return '가';
      case '①-⑤': return '①';
      default: return 'A';
    }
  };

  const getOptionLabel = (format: string, index: number): string => {
    switch (format) {
      case '가-마':
        return ['가', '나', '다', '라', '마'][index];
      case '①-⑤':
        return ['①', '②', '③', '④', '⑤'][index];
      default:
        return String.fromCharCode(65 + index); // A, B, C, D, E
    }
  };

  const getAnswerOptions = (format: string, optionsLength: number): string[] => {
    switch (format) {
      case '가-마':
        return ['가', '나', '다', '라', '마'].slice(0, optionsLength);
      case '①-⑤':
        return ['①', '②', '③', '④', '⑤'].slice(0, optionsLength);
      default:
        return Array.from({ length: optionsLength }, (_, i) => String.fromCharCode(65 + i));
    }
  };

  const convertToTxt = (): string => {
    let txtContent = "";

    questions.forEach((q, index) => {
      // Question number
      txtContent += `${index + 1}. `;

      // Passage first (if exists) - so it appears on left panel only
      if (q.passage && q.passage.trim()) {
        txtContent += `\n[Passage]\n${q.passage.trim()}\n[/Passage]\n\n`;
      }

      // Question text
      txtContent += `${q.questionText}\n\n`;

      // Options
      q.options.forEach((option, optIndex) => {
        if (option.trim()) {
          const label = getOptionLabel(q.optionFormat, optIndex);
          txtContent += `${label}. ${option.trim()}\n`;
        }
      });

      txtContent += `\n`;

      // Correct answer
      txtContent += `정답: ${q.correctAnswer}\n`;

      // Explanation (if exists)
      if (q.explanation && q.explanation.trim()) {
        txtContent += `\n[해설]\n${q.explanation.trim()}\n[/해설]\n`;
      }

      // Separator (except for last question)
      if (index < questions.length - 1) {
        txtContent += `\n---\n\n`;
      }
    });

    return txtContent;
  };

  const handleSave = () => {
    // Validate
    if (!uploadData.title.trim()) {
      toast.error("시험지 제목을 입력해주세요.");
      return;
    }

    if (!uploadData.subject || !uploadData.level || !uploadData.category || !uploadData.contentType) {
      toast.error("모든 분류 정보를 선택해주세요.");
      return;
    }

    if (!uploadData.password) {
      toast.error("다운로드 비밀번호를 설정해주세요.");
      return;
    }

    const emptyQuestions = questions.filter(q => !q.questionText.trim());
    if (emptyQuestions.length > 0) {
      toast.error("모든 문제에 내용을 입력해주세요.");
      return;
    }

    const questionsWithoutOptions = questions.filter(q => q.options.filter(o => o.trim()).length < 2);
    if (questionsWithoutOptions.length > 0) {
      toast.error("각 문제는 최소 2개의 선택지가 필요합니다.");
      return;
    }

    const txtContent = convertToTxt();
    
    if (onSave) {
      onSave(txtContent, "", {
        schoolType: schoolType,
        subject: uploadData.subject,
        level: uploadData.level,
        category: uploadData.category,
        contentType: uploadData.contentType,
        title: uploadData.title,
        description: uploadData.description,
        password: uploadData.password
      }, pdfFile);
    }

    toast.success(`시험지가 생성되었습니다! (${questions.length}문제)`);
  };

  const handlePreview = () => {
    const txtContent = convertToTxt();
    
    // Create a new window to show preview
    const previewWindow = window.open("", "미리보기", "width=800,height=600");
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>${uploadData.title || '시험지 미리보기'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; white-space: pre-wrap; }
              h1 { color: #00bcd4; }
            </style>
          </head>
          <body>
            <h1>${uploadData.title || '시험지 미리보기'}</h1>
            <pre>${txtContent}</pre>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Help Alert */}
      <Alert style={{ borderColor: '#00bcd4', backgroundColor: '#e0f7fa' }}>
        <HelpCircle className="h-4 w-4" style={{ color: '#00bcd4' }} />
        <AlertTitle style={{ color: '#00bcd4' }}>시험지 작성 가이드</AlertTitle>
        <AlertDescription className="text-gray-700">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>각 문제 패널에서 지문, 문제, 선택��, 정답, 해설을 입력하세요</li>
            <li>선택지 형식을 A-E, 가-마, ①-⑤ 중에 선택할 수 있습니다</li>
            <li>템플릿 버튼을 사용하면 빠르게 시작할 수 있습니다</li>
            <li>저장하면 자동으로 WORD 파일로 변환되어 미리보기에서 확인할 수 있습니다</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">시험지 작성 도구</h2>
          <p className="text-gray-600">패널 양식을 통해 시험 문제를 쉽게 작성하세요</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                템플릿
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>문제 템플릿 선택</DialogTitle>
                <DialogDescription>
                  템플릿을 선택하면 현재 마지막 문제에 적용됩니다.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:border-[#00bcd4] transition-colors"
                    onClick={() => applyTemplate(template)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handlePreview}>
            <FileText className="w-4 h-4 mr-2" />
            미리보기
          </Button>
          <Button onClick={handleSave} style={{ backgroundColor: '#00bcd4', color: 'white' }}>
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      {/* Classification Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">자료 분류 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* School Type Selection */}
          <div>
            <Label>학교 타입</Label>
            <Tabs 
              value={schoolType} 
              onValueChange={(value) => {
                setSchoolType(value as 'korean' | 'international' | 'certification');
                setUploadData({...uploadData, subject: "", level: "", category: "", contentType: ""});
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
            <Label>과목</Label>
            <Select
              value={uploadData.subject}
              onValueChange={(value) => setUploadData({...uploadData, subject: value, level: "", category: "", contentType: ""})}
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
              <Label>학습 단계</Label>
              <Select
                value={uploadData.level}
                onValueChange={(value) => setUploadData({...uploadData, level: value, category: "", contentType: ""})}
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
              <Label>세부 과목</Label>
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
            <Label>콘텐츠 타입</Label>
            <Select
              value={uploadData.contentType}
              onValueChange={(value) => setUploadData({...uploadData, contentType: value})}
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
            <Label htmlFor="title">시험지 제목</Label>
            <Input
              id="title"
              placeholder="예: 2024 수능특강 영어 독해 연습"
              value={uploadData.title}
              onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="자료 설명을 입력하세요 (선택사항)"
              value={uploadData.description}
              onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, qIndex) => {
          const isExpanded = expandedQuestions.has(question.id);
          
          return (
            <Card key={question.id} className="border-l-4" style={{ borderLeftColor: '#00bcd4' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">문제 {qIndex + 1}</CardTitle>
                    {question.questionText && (
                      <Badge variant="outline" style={{ borderColor: '#00bcd4', color: '#00bcd4' }}>
                        {question.options.filter(o => o.trim()).length}개 선택지
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateQuestion(question.id)}
                      title="문제 복사"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(question.id)}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label htmlFor={`question-${question.id}`}>문제 내용 *</Label>
                    <Textarea
                      id={`question-${question.id}`}
                      placeholder="문제 내용을 입력하세요..."
                      value={question.questionText}
                      onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Passage */}
                  <div className="space-y-2">
                    <Label htmlFor={`passage-${question.id}`}>지문 (선택사항)</Label>
                    <Textarea
                      id={`passage-${question.id}`}
                      placeholder="지문이 있다면 입력하세요..."
                      value={question.passage}
                      onChange={(e) => updateQuestion(question.id, 'passage', e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Option Format Selector */}
                  <div className="space-y-2">
                    <Label>선택지 형식</Label>
                    <Select
                      value={question.optionFormat}
                      onValueChange={(value) => updateQuestion(question.id, 'optionFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A-E">A, B, C, D, E</SelectItem>
                        <SelectItem value="가-마">가, 나, 다, 라, 마</SelectItem>
                        <SelectItem value="①-⑤">①, ②, ③, ④, ⑤</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>선택지 *</Label>
                      {question.options.length < 5 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(question.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          선택지 추가
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <div className="w-8 h-10 flex items-center justify-center rounded" style={{ backgroundColor: '#e0f7fa', color: '#00bcd4' }}>
                            {getOptionLabel(question.optionFormat, optIndex)}
                          </div>
                          <Input
                            placeholder={`선택지 ${getOptionLabel(question.optionFormat, optIndex)} 내용`}
                            value={option}
                            onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                          />
                          {question.options.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(question.id, optIndex)}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div className="space-y-2">
                    <Label>정답 *</Label>
                    <Select
                      value={question.correctAnswer}
                      onValueChange={(value) => updateQuestion(question.id, 'correctAnswer', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAnswerOptions(question.optionFormat, question.options.length).map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label htmlFor={`explanation-${question.id}`}>해설 (선택사항)</Label>
                    <Textarea
                      id={`explanation-${question.id}`}
                      placeholder="문제 해설을 입력하세요..."
                      value={question.explanation}
                      onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Question Button */}
      <Button
        variant="outline"
        className="w-full border-dashed border-2"
        onClick={addQuestion}
        style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
      >
        <Plus className="w-4 h-4 mr-2" />
        문제 추가
      </Button>

      {/* PDF Upload for Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <UploadIcon className="w-4 h-4 mr-2" style={{ color: '#00bcd4' }} />
            자료 받기
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              학생들이 다운로드할 PDF 파일을 업로드하세요. 위에서 작성한 시험지와 같은 내용의 PDF 파일을 업로드하면 자료 받기에서 사용됩니다.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00bcd4] transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      toast.error('PDF 파일만 업로드 가능합니다.');
                      return;
                    }
                    setPdfFile(file);
                    toast.success(`"${file.name}" 파일이 선택되었습니다.`);
                  }
                }}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                {pdfFile ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-[#00bcd4]" />
                    <p className="text-sm text-gray-900">선택된 파일: {pdfFile.name}</p>
                    <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setPdfFile(null);
                      }}
                    >
                      파일 제거
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-700">PDF 파일을 클릭하여 선택하세요</p>
                    <p className="text-xs text-gray-500">자료 받기용 PDF 파일 (선택사항)</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">다운로드 비밀번호</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="password">다운로드시 필요한 비밀번호를 설정하세요</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={uploadData.password}
              onChange={(e) => setUploadData({...uploadData, password: e.target.value})}
            />
            <p className="text-xs text-gray-500">
              이 비밀번호는 사용자가 자료를 다운로드할 때 필요합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card style={{ backgroundColor: '#e0f7fa' }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">총 {questions.length}개 문제</p>
              <p className="text-sm text-gray-600">
                작성 완료: {questions.filter(q => q.questionText.trim()).length}개
              </p>
            </div>
            <Button onClick={handleSave} style={{ backgroundColor: '#00bcd4', color: 'white' }}>
              <Save className="w-4 h-4 mr-2" />
              시험지 저장
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
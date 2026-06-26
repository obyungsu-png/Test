// Question parsing utilities for uploaded materials

export interface ParsedQuestion {
  id: number;
  question: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  aiInsight?: string;
  type?: 'reading' | 'math';
  section?: string;
}

/**
 * Parse base64 encoded file to text with UTF-8 support
 */
export const parseBase64File = async (base64Data: string, fileType: string): Promise<string | null> => {
  try {
    console.log('[parseBase64File] File type:', fileType);
    console.log('[parseBase64File] Data length:', base64Data?.length || 0);
    
    if (fileType.includes('text') || fileType.includes('plain')) {
      const base64Content = base64Data.split(',')[1] || base64Data;
      
      // Decode with UTF-8 support for Korean characters
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder('utf-8');
      const decoded = decoder.decode(bytes);
      
      console.log('[parseBase64File] Successfully decoded with UTF-8, text length:', decoded.length);
      console.log('[parseBase64File] Preview:', decoded.substring(0, 200));
      return decoded;
    }
    console.log('[parseBase64File] File type not text/plain, skipping');
    return null;
  } catch (error) {
    console.error("[parseBase64File] Error parsing base64 file:", error);
    return null;
  }
};

/**
 * Parse questions from text content
 * 
 * Supported format:
 * 1. Question text
 * 
 * [Passage]
 * Optional passage text
 * [/Passage]
 * 
 * A. Option 1
 * B. Option 2
 * C. Option 3
 * D. Option 4
 * 
 * 정답: A
 * 
 * [해설]
 * Explanation text
 * [/해설]
 * 
 * ---
 */
export const parseQuestionsFromText = (text: string): ParsedQuestion[] => {
  console.log('[parseQuestionsFromText] Starting to parse text');
  console.log('[parseQuestionsFromText] Text length:', text.length);
  console.log('[parseQuestionsFromText] Text preview:', text.substring(0, 500));
  
  const questions: ParsedQuestion[] = [];
  
  // Split by "---" separator (the primary delimiter)
  const questionBlocks = text.split(/\n?---+\n?/).filter(block => block.trim());
  console.log('[parseQuestionsFromText] Found', questionBlocks.length, 'question blocks after splitting by ---');
  console.log('[parseQuestionsFromText] First block preview:', questionBlocks[0]?.substring(0, 300));
  
  questionBlocks.forEach((block, index) => {
    if (!block.trim()) {
      console.log(`[parseQuestionsFromText] Block ${index} is empty, skipping`);
      return;
    }
    
    console.log(`[parseQuestionsFromText] Processing block ${index}:`, block.substring(0, 200));
    
    try {
      // Extract passage first if present (before extracting question text)
      let passage: string | undefined;
      const passageMatch = block.match(/\[Passage\]\s*\n([\s\S]+?)\n\[\/Passage\]/);
      if (passageMatch) {
        passage = passageMatch[1].trim();
        console.log(`[parseQuestionsFromText] Block ${index}: Found passage - ${passage.substring(0, 100)}...`);
      }
      
      // Remove passage block from the text to avoid including it in question
      let blockWithoutPassage = block;
      if (passageMatch) {
        blockWithoutPassage = block.replace(/\[Passage\]\s*\n[\s\S]+?\n\[\/Passage\]\s*\n*/, '');
      }
      
      // Extract question number and text - more flexible matching
      let questionMatch = blockWithoutPassage.match(/^(\d+)\.\s*\n*(.+?)(?=\n+[A-E가나다라마①②③④⑤]\.|$)/s);
      
      // If no match, try without requiring specific ending pattern
      if (!questionMatch) {
        questionMatch = blockWithoutPassage.match(/^(\d+)\.\s*\n*(.+?)(?=\n)/s);
      }
      
      if (!questionMatch) {
        console.log(`[parseQuestionsFromText] Block ${index}: No question match found`);
        console.log(`[parseQuestionsFromText] Block ${index} full text:`, blockWithoutPassage.substring(0, 300));
        return;
      }
      
      console.log(`[parseQuestionsFromText] Block ${index}: Found question -`, questionMatch[2].substring(0, 100));
      
      const questionText = questionMatch[2].trim();
      
      // Extract options - support multiple formats
      const options: string[] = [];
      
      // Try format: A. B. C. D. (more flexible - allow multiple newlines)
      let optionMatches = Array.from(block.matchAll(/\n+([A-E])\.\s*(.+?)(?=\n+[A-E]\.|\n+정답|\n+답:|\n+Answer|\n+\[해설\]|$)/gs));
      console.log(`[parseQuestionsFromText] Block ${index}: Found ${optionMatches.length} option matches (A. format)`);
      
      if (optionMatches.length > 0) {
        optionMatches.forEach(match => {
          if (match[2]) {
            const cleanOption = match[2].trim().replace(/\n+/g, ' ');
            console.log(`[parseQuestionsFromText] Block ${index}: Option ${match[1]} = ${cleanOption.substring(0, 50)}`);
            options.push(cleanOption);
          }
        });
      } else {
        // Try format: (A) (B) (C) (D)
        optionMatches = Array.from(block.matchAll(/\n+\(([A-E])\)\s*(.+?)(?=\n+\([A-E]\)|\n+정답|\n+답:|\n+Answer|$)/gs));
        console.log(`[parseQuestionsFromText] Block ${index}: Found ${optionMatches.length} option matches ((A) format)`);
        
        if (optionMatches.length > 0) {
          optionMatches.forEach(match => {
            if (match[2]) options.push(match[2].trim().replace(/\n+/g, ' '));
          });
        } else {
          // Try format: ① ② ③ ④ ⑤
          optionMatches = Array.from(block.matchAll(/\n+([①②③④⑤])\s*(.+?)(?=\n+[①②③④⑤]|\n+정답|\n+답:|\n+Answer|$)/gs));
          console.log(`[parseQuestionsFromText] Block ${index}: Found ${optionMatches.length} option matches (① format)`);
          
          if (optionMatches.length > 0) {
            optionMatches.forEach(match => {
              if (match[2]) options.push(match[2].trim().replace(/\n+/g, ' '));
            });
          } else {
            // Try format: 가. 나. 다. 라. 마. (Korean format)
            optionMatches = Array.from(block.matchAll(/\n+([가나다라마])\.\s*(.+?)(?=\n+[가나다라마]\.|\n+정답|\n+답:|\n+Answer|\n+\[해설\]|$)/gs));
            console.log(`[parseQuestionsFromText] Block ${index}: Found ${optionMatches.length} option matches (가. format)`);
            
            if (optionMatches.length > 0) {
              optionMatches.forEach(match => {
                if (match[2]) {
                  const cleanOption = match[2].trim().replace(/\n+/g, ' ');
                  console.log(`[parseQuestionsFromText] Block ${index}: Option ${match[1]} = ${cleanOption.substring(0, 50)}`);
                  options.push(cleanOption);
                }
              });
            }
          }
        }
      }
      
      if (options.length === 0) {
        console.log(`[parseQuestionsFromText] Block ${index}: No options found, skipping`);
        console.log(`[parseQuestionsFromText] Block ${index} sample text:`, block.substring(0, 300));
        return;
      }
      
      console.log(`[parseQuestionsFromText] Block ${index}: Found ${options.length} options`);
      
      // Extract correct answer
      let correctAnswer = 0;
      const answerMatch = block.match(/(?:정답|답|Answer)[:\s]*([A-E①②③④⑤가나다라마1-5])/i);
      
      if (answerMatch) {
        const answerText = answerMatch[1];
        console.log(`[parseQuestionsFromText] Block ${index}: Found answer - ${answerText}`);
        
        const answerUpper = answerText.toUpperCase();
        if (answerUpper >= 'A' && answerUpper <= 'E') {
          correctAnswer = answerUpper.charCodeAt(0) - 'A'.charCodeAt(0);
        } else if (answerText >= '1' && answerText <= '5') {
          correctAnswer = parseInt(answerText) - 1;
        } else if ('①②③④⑤'.includes(answerText)) {
          correctAnswer = '①②③④⑤'.indexOf(answerText);
        } else if ('가나다라마'.includes(answerText)) {
          correctAnswer = '가나다라마'.indexOf(answerText);
          console.log(`[parseQuestionsFromText] Block ${index}: Korean answer ${answerText} = index ${correctAnswer}`);
        }
      } else {
        console.log(`[parseQuestionsFromText] Block ${index}: No answer found, defaulting to 0`);
      }
      
      // Extract explanation
      let explanation: string | undefined;
      const explanationMatch = block.match(/\[해설\]\s*\n([\s\S]+?)\n\[\/해설\]/);
      if (explanationMatch) {
        explanation = explanationMatch[1].trim();
      } else {
        // Try without brackets
        const altExplanationMatch = block.match(/(?:해설|설명|Explanation)[:\s]*\n(.+?)(?=\n\n|$)/s);
        if (altExplanationMatch) {
          explanation = altExplanationMatch[1].trim();
        }
      }
      
      // Generate AI insight
      const aiInsight = generateAIInsight(questionText, options, correctAnswer);
      
      const parsedQuestion = {
        id: index + 1,
        question: questionText,
        passage,
        options,
        correctAnswer,
        explanation,
        aiInsight,
        type: detectQuestionType(questionText, passage),
        section: detectSection(questionText)
      };
      
      console.log(`[parseQuestionsFromText] Block ${index}: Successfully parsed question ${parsedQuestion.id}`);
      questions.push(parsedQuestion);
    } catch (error) {
      console.error(`[parseQuestionsFromText] Error parsing question block ${index}:`, error);
    }
  });
  
  console.log('[parseQuestionsFromText] Total questions parsed:', questions.length);
  return questions;
};

/**
 * Detect question type based on content
 */
const detectQuestionType = (question: string, passage?: string): 'reading' | 'math' => {
  const mathKeywords = ['계산', '방정식', '함수', 'equation', 'function', 'calculate', 'solve', '=', '+', '-', '×', '÷', 'x', 'y'];
  const combinedText = (question + (passage || '')).toLowerCase();
  
  for (const keyword of mathKeywords) {
    if (combinedText.includes(keyword.toLowerCase())) {
      return 'math';
    }
  }
  
  return 'reading';
};

/**
 * Detect section based on question content
 */
const detectSection = (question: string): string => {
  if (question.includes('빈칸')) return '어휘';
  if (question.includes('주제') || question.includes('요지')) return '독해';
  if (question.includes('어법') || question.includes('문법')) return '문법';
  if (question.includes('순서') || question.includes('배열')) return '논리';
  return '종합';
};

/**
 * Generate AI insight based on question content
 */
const generateAIInsight = (question: string, options: string[], correctAnswer: number): string => {
  if (question.includes('빈칸') || question.includes('가장 적절한')) {
    return "이 문제는 문맥 파악 능력을 테스트합니다. 문장의 흐름과 논리적 연결성을 주의 깊게 살펴보세요. 키워드를 찾고 앞뒤 문장과의 관계를 분석하는 것이 중요합니다.";
  } else if (question.includes('주제') || question.includes('요지')) {
    return "글의 중심 생각을 파악하는 문제입니다. 각 문단의 핵심 아이디어를 찾고 전체적인 맥락을 이해하세요. 첫 문장과 마지막 문장에 주제가 나타나는 경우가 많습니다.";
  } else if (question.includes('어법') || question.includes('문법')) {
    return "문법 규칙을 정확히 적용하는 문제입니다. 시제, 수 일치, 품사 등을 체크하세요. 문장 구조를 분석하고 각 선택지를 대입해보며 확인하세요.";
  } else if (question.includes('순서') || question.includes('배열')) {
    return "논리적 순서를 파악하는 문제입니다. 지시어, 접속사, 시간 표현 등을 단서로 활용하세요. 각 문장 간의 인과관계와 논리적 흐름을 파악하는 것이 핵심입니다.";
  }
  return "문제의 핵심을 파악하고, 각 선택지를 신중히 비교 분석하세요. 문맥을 이해하고 논리적으로 접근하면 정답을 찾을 수 있습니다.";
};

/**
 * Extract questions from uploaded material
 */
export const extractQuestionsFromMaterial = async (material: any): Promise<ParsedQuestion[]> => {
  console.log('[questionParser] Extracting questions from material');
  
  // Check if material already has parsed questions
  if (material.parsedQuestions && material.parsedQuestions.length > 0) {
    console.log('[questionParser] Using cached parsed questions:', material.parsedQuestions.length);
    return material.parsedQuestions;
  }
  
  // First, try to use preview file if available
  if (material.previewFileData?.fileData) {
    console.log('[questionParser] Found previewFileData, attempting to parse');
    console.log('[questionParser] Preview file name:', material.previewFileData.fileName);
    console.log('[questionParser] Preview file type:', material.previewFileData.fileType);
    
    const textContent = await parseBase64File(material.previewFileData.fileData, material.previewFileData.fileType);
    console.log('[questionParser] Decoded text length:', textContent?.length || 0);
    
    if (textContent) {
      console.log('[questionParser] Text content preview:', textContent.substring(0, 200));
      const questions = parseQuestionsFromText(textContent);
      console.log('[questionParser] Parsed questions from preview file:', questions.length);
      
      if (questions.length > 0) {
        return questions;
      }
    }
  } else {
    console.log('[questionParser] No previewFileData found');
  }
  
  // Fallback: Try to parse from main uploaded file
  if (material.isUploaded && material.uploadData?.fileData) {
    console.log('[questionParser] Trying main uploadData file');
    const fileType = material.uploadData.fileType || '';
    const fileName = material.uploadData.fileName || '';
    console.log('[questionParser] Main file name:', fileName);
    console.log('[questionParser] Main file type:', fileType);
    
    // Only parse text files
    if (fileType.includes('text') || fileName.toLowerCase().endsWith('.txt')) {
      const textContent = await parseBase64File(material.uploadData.fileData, fileType);
      console.log('[questionParser] Decoded main file text length:', textContent?.length || 0);
      
      if (textContent) {
        const questions = parseQuestionsFromText(textContent);
        console.log('[questionParser] Parsed questions from main file:', questions.length);
        return questions;
      }
    } else {
      console.log('[questionParser] Main file is not a text file, skipping');
    }
  } else {
    console.log('[questionParser] No uploadData found or not uploaded');
  }
  
  console.log('[questionParser] No questions found, returning empty array');
  return [];
};

/**
 * Validate question format
 */
export const validateQuestionFormat = (text: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!text.trim()) {
    errors.push("텍스트가 비어있습니다.");
    return { valid: false, errors };
  }
  
  // Check for question numbers
  if (!text.match(/\d+\./)) {
    errors.push("문제 번호를 찾을 수 없습니다. (예: 1. 2. 3.)");
  }
  
  // Check for options
  if (!text.match(/[A-E]\.|①|②|③|④|⑤|\([A-E]\)/)) {
    errors.push("선택지를 찾을 수 없습니다. (예: A. B. C. D. 또는 ① ② ③ ④)");
  }
  
  // Check for answers
  if (!text.match(/(?:정답|답|Answer)/i)) {
    errors.push("정답 표시를 찾을 수 없습니다. (예: 정답: A)");
  }
  
  return { valid: errors.length === 0, errors };
};
/**
 * GLM API로 시험 문제 자동 생성
 */
export const generateQuestionsWithGLM = async (material: any): Promise<ParsedQuestion[]> => {
  const GLM_API_KEY = "dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff";
  const title = material.title || "시험 문제";
  const subject = material.subject || "영어";

  const prompt = `한국 고등학교 ${subject} 시험 문제 5개를 만들어줘.
제목/단원: "${title}"
각 문제는 4지선다형으로 만들어줘.
반드시 아래 JSON 배열 형식만 출력해줘 (설명 없이):
[
  {
    "question": "문제 내용",
    "options": ["선택지A", "선택지B", "선택지C", "선택지D"],
    "correctAnswer": 0,
    "explanation": "정답 해설"
  }
]`;

  try {
    const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content || "")
      .replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    return parsed.map((q: any, i: number) => ({
      id: i + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer ?? 0,
      explanation: q.explanation,
      section: subject,
      type: "reading" as const,
    }));
  } catch (e) {
    console.error("[GLM] 문제 생성 실패:", e);
    return [];
  }
};

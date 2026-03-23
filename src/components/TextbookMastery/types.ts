// 교과서 뽀개기 - 타입 및 샘플 데이터

export interface VocaItem {
  id: string;
  word: string;
  meaning: string;
  pos: string; // 품사
  example: string;
  exampleKo: string;
  synonym?: string;
  antonym?: string;
}

export interface SentenceItem {
  id: number;
  english: string;
  korean: string;
  chunks: string[]; // 끊어읽기 단위
  grammarPoint?: string;
  svoHighlight?: { subject: string; verb: string; object?: string; complement?: string };
  importance: 'high' | 'mid' | 'low';
  paragraphId: number;
}

export interface ParagraphItem {
  id: number;
  topic: string;
  structure: string; // 전개방식
}

export interface ProblemItem {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'sentence_insert' | 'grammar_fix' | 'content_match';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  relatedSentenceId?: number;
}

export interface LessonData {
  id: string;
  title: string;
  subject: string;
  category: string;
  semester?: string; // "1" | "2" (학기)
  visibleTabs?: string[]; // 표시할 탭 목록 (예: ['analysis','voca','scaffolding','flow','mock'])
  vocabulary: VocaItem[];
  sentences: SentenceItem[];
  paragraphs: ParagraphItem[];
  problems: ProblemItem[];
}

export interface StepProgress {
  step1_voca: number;
  step2_analysis: number;
  step3_scaffolding: number;
  step4_flow: number;
  step5_mock: number;
}

export interface WeaknessItem {
  sentenceId: number;
  sentence: string;
  wrongCount: number;
  lastWrong: string;
  type: 'blank' | 'unscramble' | 'writing' | 'mock';
}

// ========== 샘플 데이터 (영어 - 중등영어 1-1 Lesson 1) ==========
export const SAMPLE_LESSON: LessonData = {
  id: "eng1-1-lesson1",
  title: "Lesson 1: My New Friends",
  subject: "영어",
  category: "중1",
  semester: "1",
  visibleTabs: ['analysis', 'voca', 'scaffolding', 'flow', 'mock'],
  vocabulary: [
    { id: "v1", word: "introduce", meaning: "소개하다", pos: "동사", example: "Let me introduce myself.", exampleKo: "제 소개를 하겠습니다.", synonym: "present, acquaint, familiarize", antonym: "" },
    { id: "v2", word: "favorite", meaning: "가장 좋아하는", pos: "형용사", example: "What is your favorite color?", exampleKo: "너의 가장 좋아하는 색은 뭐니?", synonym: "preferred, beloved, cherished", antonym: "least favorite" },
    { id: "v3", word: "hobby", meaning: "취미", pos: "명사", example: "My hobby is reading books.", exampleKo: "나의 취미는 독서입니다.", synonym: "pastime, leisure activity, avocation", antonym: "" },
    { id: "v4", word: "nervous", meaning: "긴장한", pos: "형용사", example: "I feel nervous about the test.", exampleKo: "나는 시험에 대해 긴장됩니다.", synonym: "anxious, uneasy, apprehensive", antonym: "calm" },
    { id: "v5", word: "excited", meaning: "신나는, 흥분한", pos: "형용사", example: "She was excited about the trip.", exampleKo: "그녀는 여행에 신이 났다.", synonym: "thrilled, eager, exhilarated", antonym: "bored" },
    { id: "v6", word: "friendly", meaning: "친근한", pos: "형용사", example: "Everyone here is very friendly.", exampleKo: "여기 모두가 매우 친근하다.", synonym: "kind, warm, amiable", antonym: "unfriendly" },
    { id: "v7", word: "especially", meaning: "특히", pos: "부사", example: "I like fruits, especially apples.", exampleKo: "나는 과일을 좋아하는데, 특히 사과를 좋아한다.", synonym: "particularly, notably, remarkably", antonym: "" },
    { id: "v8", word: "surprise", meaning: "놀라게 하다; 놀라움", pos: "동사/명사", example: "What a nice surprise!", exampleKo: "정말 좋은 놀라움이네!", synonym: "amaze, astonish, astound", antonym: "" },
    { id: "v9", word: "different", meaning: "다른, 다양한", pos: "형용사", example: "We have different opinions.", exampleKo: "우리는 서로 다른 의견을 가지고 있다.", synonym: "various, distinct, disparate", antonym: "same" },
    { id: "v10", word: "although", meaning: "비록 ~이지만", pos: "접속사", example: "Although it rained, we had fun.", exampleKo: "비가 왔지만 우리는 즐거웠다.", synonym: "though, even though, notwithstanding", antonym: "" },
    { id: "v11", word: "communicate", meaning: "소통하다", pos: "동사", example: "We communicate through emails.", exampleKo: "우리는 이메일로 소통한다.", synonym: "interact, converse, liaise", antonym: "" },
    { id: "v12", word: "experience", meaning: "경험; 경험하다", pos: "명사/동사", example: "It was an amazing experience.", exampleKo: "그것은 놀라운 경험이었다.", synonym: "encounter, undergo, partake in", antonym: "" },
  ],
  sentences: [
    {
      id: 1, paragraphId: 1,
      english: "Today is my first day at a new school.",
      korean: "오늘은 새 학교에서의 첫날이다.",
      chunks: ["Today", "is my first day", "at a new school."],
      grammarPoint: "be동사 현재형 (is)",
      svoHighlight: { subject: "Today", verb: "is", complement: "my first day at a new school" },
      importance: 'high'
    },
    {
      id: 2, paragraphId: 1,
      english: "I feel a little nervous, but I am also very excited.",
      korean: "나는 약간 긴장되지만, 또한 매우 신나기도 하다.",
      chunks: ["I feel", "a little nervous,", "but I am also", "very excited."],
      grammarPoint: "등위접속사 but (대조)",
      svoHighlight: { subject: "I", verb: "feel", complement: "a little nervous" },
      importance: 'high'
    },
    {
      id: 3, paragraphId: 1,
      english: "I hope I can make many new friends here.",
      korean: "나는 여기서 많은 새 친구를 사귈 수 있기를 바란다.",
      chunks: ["I hope", "I can make", "many new friends", "here."],
      grammarPoint: "hope + that절 (명사절)",
      svoHighlight: { subject: "I", verb: "hope", object: "I can make many new friends here" },
      importance: 'mid'
    },
    {
      id: 4, paragraphId: 2,
      english: "In my first class, the teacher asked us to introduce ourselves.",
      korean: "첫 수업에서 선생님은 우리에게 자기소개를 하라고 하셨다.",
      chunks: ["In my first class,", "the teacher", "asked us", "to introduce ourselves."],
      grammarPoint: "ask + 목적어 + to부정사",
      svoHighlight: { subject: "the teacher", verb: "asked", object: "us to introduce ourselves" },
      importance: 'high'
    },
    {
      id: 5, paragraphId: 2,
      english: "\"My name is Sujin. My favorite hobby is playing the piano,\" I said.",
      korean: "\"내 이름은 수진이야. 내가 가장 좋아하는 취미는 피아노 치는 거야,\" 라고 나는 말했다.",
      chunks: ["\"My name is Sujin.", "My favorite hobby", "is playing the piano,\"", "I said."],
      grammarPoint: "동명사 주어 (playing the piano)",
      svoHighlight: { subject: "My favorite hobby", verb: "is", complement: "playing the piano" },
      importance: 'mid'
    },
    {
      id: 6, paragraphId: 2,
      english: "A boy named Jake smiled and said, \"I like the piano too! We should play together sometime.\"",
      korean: "Jake라는 소년이 미소지으며 말했다, \"나도 피아노 좋아해! 우리 언젠가 같이 연주하자.\"",
      chunks: ["A boy named Jake", "smiled and said,", "\"I like the piano too!", "We should play together", "sometime.\""],
      grammarPoint: "과거분사의 형용사적 용법 (named Jake)",
      svoHighlight: { subject: "A boy named Jake", verb: "smiled and said", object: "..." },
      importance: 'high'
    },
    {
      id: 7, paragraphId: 3,
      english: "Although we come from different backgrounds, we found that we have a lot in common.",
      korean: "비록 우리가 다른 배경에서 왔지만, 우리는 공통점이 많다는 것을 알게 되었다.",
      chunks: ["Although", "we come from", "different backgrounds,", "we found that", "we have a lot in common."],
      grammarPoint: "양보 부사절 Although + 주절",
      svoHighlight: { subject: "we", verb: "found", object: "that we have a lot in common" },
      importance: 'high'
    },
    {
      id: 8, paragraphId: 3,
      english: "Especially, we all love music and want to communicate with people around the world.",
      korean: "특히, 우리 모두 음악을 사랑하고 전 세계 사람들과 소통하고 싶어 한다.",
      chunks: ["Especially,", "we all love music", "and want to communicate", "with people", "around the world."],
      grammarPoint: "등위접속사 and (병렬구조: love and want)",
      svoHighlight: { subject: "we", verb: "love / want", object: "music / to communicate" },
      importance: 'mid'
    },
    {
      id: 9, paragraphId: 4,
      english: "This experience taught me that making new friends is not as hard as I thought.",
      korean: "이 경험은 나에게 새 친구를 사귀는 것이 생각만큼 어렵지 않다는 것을 가르쳐 주었다.",
      chunks: ["This experience", "taught me that", "making new friends", "is not as hard", "as I thought."],
      grammarPoint: "as ... as 비교 구문 (not as hard as)",
      svoHighlight: { subject: "This experience", verb: "taught", object: "me that making new friends is not as hard as I thought" },
      importance: 'high'
    },
    {
      id: 10, paragraphId: 4,
      english: "I am looking forward to having more wonderful experiences with my new friends.",
      korean: "나는 새 친구들과 더 많은 멋진 경험을 하기를 기대하고 있다.",
      chunks: ["I am looking forward to", "having", "more wonderful experiences", "with my new friends."],
      grammarPoint: "look forward to + 동명사 (having)",
      svoHighlight: { subject: "I", verb: "am looking forward to", object: "having more wonderful experiences" },
      importance: 'high'
    },
  ],
  paragraphs: [
    { id: 1, topic: "새 학교 첫날의 설렘과 긴장", structure: "상황 제시" },
    { id: 2, topic: "자기소개와 첫 만남", structure: "사건 전개" },
    { id: 3, topic: "다양한 배경, 공통된 관심사", structure: "발견과 깨달음" },
    { id: 4, topic: "우정에 대한 교훈과 기대", structure: "결론 및 성찰" },
  ],
  problems: [
    {
      id: "p1", type: "multiple_choice",
      question: "What did the teacher ask the students to do in the first class?",
      options: ["A. Read a textbook", "B. Introduce themselves", "C. Write an essay", "D. Take a test"],
      answer: "B",
      explanation: "4번 문장에서 'the teacher asked us to introduce ourselves'라고 되어 있습니다.",
      relatedSentenceId: 4
    },
    {
      id: "p2", type: "multiple_choice",
      question: "다음 중 본문의 내용과 일치하는 것은?",
      options: [
        "A. 수진이는 첫날 전혀 긴장하지 않았다.",
        "B. Jake는 피아노를 싫어한다.",
        "C. 수진이의 취미는 피아노 치기이다.",
        "D. 수진이는 새 친구를 사귀지 못했다."
      ],
      answer: "C",
      explanation: "5번 문장에서 'My favorite hobby is playing the piano'라고 수진이가 말합니다.",
      relatedSentenceId: 5
    },
    {
      id: "p3", type: "grammar_fix",
      question: "다음 밑줄 친 부분 중 어법상 틀린 것을 고르시오.\n\n\"Although we come from different backgrounds, we found that we have a lot _____ common.\"",
      options: ["A. in", "B. on", "C. at", "D. for"],
      answer: "A",
      explanation: "'have a lot in common'은 '공통점이 많다'는 뜻의 숙어입니다. 전치사 in을 사용합니다.",
      relatedSentenceId: 7
    },
    {
      id: "p4", type: "sentence_insert",
      question: "다음 문장이 들어갈 위치로 가장 적절한 곳은?\n\n\"We should play together sometime.\"",
      options: [
        "A. 1번 문장 뒤",
        "B. 3번 문장 뒤",
        "C. 6번 문장 안 (Jake의 대사)",
        "D. 9번 문장 뒤"
      ],
      answer: "C",
      explanation: "이 문장은 Jake가 수진이에게 피아노를 같이 치자고 제안하는 대사의 일부입니다.",
      relatedSentenceId: 6
    },
    {
      id: "p5", type: "content_match",
      question: "본문의 주제로 가장 적절한 것은?",
      options: [
        "A. 새 학교에서의 어려움",
        "B. 피아노 연주의 즐거움",
        "C. 새 친구를 사귀는 경험과 교훈",
        "D. 다양한 문화의 차이점"
      ],
      answer: "C",
      explanation: "글 전체가 새 학교에서 친구를 사귀는 경험과 그로부터 얻은 교훈(새 친구 사귀기가 생각만큼 어렵지 않다)을 다루고 있습니다.",
      relatedSentenceId: 9
    },
    {
      id: "p6", type: "multiple_choice",
      question: "밑줄 친 'looking forward to' 뒤에 올 수 있는 형태로 올바른 것은?",
      options: ["A. have", "B. having", "C. to have", "D. had"],
      answer: "B",
      explanation: "'look forward to'에서 to는 전치사이므로 뒤에 동명사(~ing)가 와야 합니다.",
      relatedSentenceId: 10
    },
    {
      id: "p7", type: "short_answer",
      question: "빈칸에 알맞은 말을 본문에서 찾아 쓰시오.\n\nThis experience taught me that making new friends is not as _____ as I thought.",
      answer: "hard",
      explanation: "9번 문장에서 'not as hard as I thought'라고 표현되어 있습니다.",
      relatedSentenceId: 9
    },
    {
      id: "p8", type: "grammar_fix",
      question: "다음 문장에서 어법상 올바른 것을 고르시오.\n\nI hope I (can make / can to make) many new friends here.",
      options: ["A. can make", "B. can to make"],
      answer: "A",
      explanation: "조동사 can 뒤에는 동사원형이 와야 합니다. to부정사를 사용하지 않습니다.",
      relatedSentenceId: 3
    },
  ]
};

// ========== 샘플 데이터 (국어 - 고등국어 문학 윤동주 「서시」) ==========
export const SAMPLE_LESSON_KOREAN: LessonData = {
  id: "kor-high-lit-seosi",
  title: "윤동주 「서시(序詩)」 — 시 분석과 감상",
  subject: "국어",
  category: "고1",
  semester: "1",
  visibleTabs: ['analysis', 'voca', 'scaffolding', 'flow', 'mock'],
  vocabulary: [
    { id: "kv1", word: "서시(序詩)", meaning: "시집의 맨 앞에 놓는 시, 서문 격의 시", pos: "명사", example: "이 시는 유고 시집 『하늘과 바람과 별과 시』의 서시이다.", exampleKo: "", synonym: "서문시", antonym: "" },
    { id: "kv2", word: "괴로워하다", meaning: "마음이 편하지 못하고 고통스러워하다", pos: "동사", example: "시적 화자는 자아 성찰 속에서 괴로워한다.", exampleKo: "", synonym: "고뇌하다, 번민하다", antonym: "편안해하다" },
    { id: "kv3", word: "사멸(死滅)", meaning: "죽어서 없어짐", pos: "명사", example: "잎새에 이는 바람에도 나는 괴로워했다 — 소멸될 운명 앞의 고뇌.", exampleKo: "", synonym: "소멸, 절멸", antonym: "생성, 탄생" },
    { id: "kv4", word: "자아 성찰", meaning: "자기 자신의 내면을 깊이 돌아봄", pos: "명사", example: "윤동주 시의 핵심 주제는 자아 성찰과 부끄러움이다.", exampleKo: "", synonym: "내성(內省), 반성", antonym: "" },
    { id: "kv5", word: "별을 노래하다", meaning: "이상(理想)과 순수를 지향하다 (상징적 표현)", pos: "관용구", example: "\"별을 노래하는 마음으로\"에서 '별'은 이상·순수·양심의 상징이다.", exampleKo: "", synonym: "", antonym: "" },
    { id: "kv6", word: "일제 강점기", meaning: "1910~1945년 일본이 한국을 식민 지배한 시기", pos: "명사", example: "윤동주는 일제 강점기에 시를 썼으며 후쿠오카 형무소서 옥사했다.", exampleKo: "", synonym: "일제 식민지 시대", antonym: "" },
    { id: "kv7", word: "유고(遺稿)", meaning: "죽은 뒤에 남긴 원고", pos: "명사", example: "『하늘과 바람과 별과 시』는 윤동주의 유고 시집이다.", exampleKo: "", synonym: "유작", antonym: "" },
    { id: "kv8", word: "운명(運명)", meaning: "인간의 의지와 관계없이 정해진 삶의 흐름", pos: "명사", example: "\"죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를\"에는 운명 앞의 결의가 담겨 있다.", exampleKo: "", synonym: "숙명, 팔자", antonym: "" },
    { id: "kv9", word: "어조(語調)", meaning: "말이나 글의 분위기·태도를 결정짓는 어감", pos: "명사", example: "서시의 어조는 고백적·성찰적이다.", exampleKo: "", synonym: "톤, 어투", antonym: "" },
    { id: "kv10", word: "상징(象徵)", meaning: "추상적 관념을 구체적 사물로 나타내는 표현법", pos: "명사", example: "'바람'은 시련과 고난의 상징이다.", exampleKo: "", synonym: "심벌(symbol)", antonym: "" },
    { id: "kv11", word: "의지(意志)", meaning: "어떤 일을 이루겠다는 마음", pos: "명사", example: "시적 화자는 \"모든 죽어가는 것을 사랑해야지\"라며 삶의 의지를 드러낸다.", exampleKo: "", synonym: "결심, 결의", antonym: "체념, 포기" },
    { id: "kv12", word: "부끄럼", meaning: "부끄러운 느낌 (=부끄러움)", pos: "명사", example: "\"한 점 부끄럼이 없기를\" — 양심에 떳떳하고자 하는 소망.", exampleKo: "", synonym: "수치, 부끄러움", antonym: "떳떳함, 당당함" },
  ],
  sentences: [
    {
      id: 1, paragraphId: 1,
      english: "죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를,",
      korean: "생의 마지막 날까지 하늘(양심)에 대해 조금의 부끄러움도 없기를 소망한다.",
      chunks: ["죽는 날까지", "하늘을 우러러", "한 점 부끄럼이", "없기를,"],
      grammarPoint: "'-기를' — 소망·기원의 명사형 전성어미",
      svoHighlight: { subject: "(나는)", verb: "(바란다)", object: "부끄럼이 없기를" },
      importance: 'high'
    },
    {
      id: 2, paragraphId: 1,
      english: "잎새에 이는 바람에도 나는 괴로워했다.",
      korean: "나뭇잎을 흔드는 작은 바람(사소한 시련)에도 나는 고통을 느꼈다.",
      chunks: ["잎새에 이는", "바람에도", "나는", "괴로워했다."],
      grammarPoint: "'에도' — 보조사 '도'가 결합된 부사격 ('~조차도'의 뉘앙스)",
      svoHighlight: { subject: "나는", verb: "괴로워했다", complement: "잎새에 이는 바람에도" },
      importance: 'high'
    },
    {
      id: 3, paragraphId: 2,
      english: "별을 노래하는 마음으로 모든 죽어가는 것을 사랑해야지",
      korean: "순수한 이상(별)을 지향하는 마음으로, 소멸해가는 모든 존재를 사랑하겠다.",
      chunks: ["별을 노래하는", "마음으로", "모든 죽어가는 것을", "사랑해야지"],
      grammarPoint: "'-아/어야지' — 다짐·의지의 종결어미",
      svoHighlight: { subject: "(나는)", verb: "사랑해야지", object: "모든 죽어가는 것을" },
      importance: 'high'
    },
    {
      id: 4, paragraphId: 2,
      english: "그리고 나한테 주어진 길을 걸어가야겠다.",
      korean: "그리고 나에게 주어진 운명의 길(사명)을 묵묵히 걸어가겠다.",
      chunks: ["그리고", "나한테 주어진", "길을", "걸어가야겠다."],
      grammarPoint: "'-아/어야겠다' — 강한 의지 표현의 종결어미",
      svoHighlight: { subject: "(나는)", verb: "걸어가야겠다", object: "나한테 주어진 길을" },
      importance: 'high'
    },
    {
      id: 5, paragraphId: 3,
      english: "오늘 밤에도 별이 바람에 스치운다.",
      korean: "오늘 밤에도 별(이상·순수)이 바람(시련·현실)에 스쳐 간다 — 현실의 고난 속에서도 이상은 사라지지 않는다.",
      chunks: ["오늘 밤에도", "별이", "바람에", "스치운다."],
      grammarPoint: "'스치운다' — '스치다'의 사동형, 현재형 종결로 여운 형성",
      svoHighlight: { subject: "별이", verb: "스치운다", complement: "바람에" },
      importance: 'high'
    },
  ],
  paragraphs: [
    { id: 1, topic: "1연: 자아 성찰과 부끄러움 — 양심에 대한 소망", structure: "고백적 진술" },
    { id: 2, topic: "2연: 삶의 의지와 사랑 — 죽어가는 것들에 대한 연민과 사명감", structure: "다짐과 결의" },
    { id: 3, topic: "3연: 현실 인식과 여운 — 이상과 시련의 공존", structure: "이미지 마무리 (열린 결말)" },
  ],
  problems: [
    {
      id: "kp1", type: "multiple_choice",
      question: "이 시의 시적 화자가 \"죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를\" 바라는 태도를 가장 잘 설명한 것은?",
      options: [
        "A. 현실 도피적 태도로 하늘나라를 동경하고 있다.",
        "B. 양심에 떳떳한 삶을 살겠다는 윤리적 결의를 드러낸다.",
        "C. 죽음에 대한 공포를 하늘에 기원하며 극복하려 한다.",
        "D. 종교적 신앙 고백으로 신에게 구원을 요청하고 있다."
      ],
      answer: "B",
      explanation: "시적 화자는 '하늘'(양심·도덕적 이상)에 대해 한 점 부끄러움 없이 살겠다는 윤리적 삶의 자세를 보여줍니다. 현실 도피나 종교적 기원이 아닌 자기 성찰적 다짐입니다.",
      relatedSentenceId: 1
    },
    {
      id: "kp2", type: "multiple_choice",
      question: "\"잎새에 이는 바람\"이 상징하는 것으로 가장 적절한 것은?",
      options: [
        "A. 일제 강점기의 거대한 탄압",
        "B. 자연의 아름다운 풍경",
        "C. 사소한 시련이나 양심의 흔들림",
        "D. 계절의 변화와 시간의 흐름"
      ],
      answer: "C",
      explanation: "'잎새에 이는 바람'은 아주 작은 바람입니다. 이처럼 사소한 것에도 괴로워한다는 것은 화자의 예민한 양심과 깊은 자아 성찰을 보여줍니다.",
      relatedSentenceId: 2
    },
    {
      id: "kp3", type: "multiple_choice",
      question: "다음 중 \"별\"의 상징적 의미로 가장 적절한 것은?",
      options: [
        "A. 그리운 고향과 가족",
        "B. 이상(理想)·순수·양심",
        "C. 어둠 속의 두려움",
        "D. 밤하늘의 자연 현상"
      ],
      answer: "B",
      explanation: "윤동주 시에서 '별'은 이상·순수·양심의 상징입니다. '별을 노래하는 마음'은 순수한 이상을 추구하는 마음을 의미합니다.",
      relatedSentenceId: 3
    },
    {
      id: "kp4", type: "short_answer",
      question: "빈칸에 들어갈 알맞은 말을 시 원문에서 찾아 쓰시오.\n\n\"그리고 나한테 주어진 _____을 걸어가야겠다.\"",
      answer: "길",
      explanation: "시적 화자는 자신에게 주어진 '길'(운명·사명)을 걸어가겠다는 의지를 드러냅니다.",
      relatedSentenceId: 4
    },
    {
      id: "kp5", type: "content_match",
      question: "이 시의 전체적인 주제 의식으로 가장 적절한 것은?",
      options: [
        "A. 자연 속에서 느끼는 계절의 서정",
        "B. 식민지 지식인의 자아 성찰과 부끄러움 없는 삶의 추구",
        "C. 이상 세계로의 도피와 현실 부정",
        "D. 죽음 이후 내세에 대한 종교적 믿음"
      ],
      answer: "B",
      explanation: "윤동주는 일제 강점기 지식인으로서 양심에 떳떳하고자 하는 자아 성찰과, 순수한 이상을 잃지 않겠다는 의지를 이 시에 담았습니다.",
      relatedSentenceId: 1
    },
    {
      id: "kp6", type: "multiple_choice",
      question: "\"모든 죽어가는 것을 사랑해야지\"에서 시적 화자의 태도로 적절한 것은?",
      options: [
        "A. 소멸해가는 것에 대한 무관심과 체념",
        "B. 사라지는 것들에 대한 연민과 포용의 자세",
        "C. 죽음을 두려워하며 도망치는 태도",
        "D. 강자에 대한 저항과 분노"
      ],
      answer: "B",
      explanation: "'죽어가는 것'은 식민지 현실 속에서 사라지는 아름답고 소중한 가치들입니다. 화자는 이를 사랑하겠다며 연민과 포용의 자세를 보여줍니다.",
      relatedSentenceId: 3
    },
    {
      id: "kp7", type: "grammar_fix",
      question: "다음 중 시의 종결어미에 담긴 화자의 태도가 나머지와 다른 하나는?",
      options: [
        "A. 부끄럼이 없기를 — 소망",
        "B. 사랑해야지 — 다짐",
        "C. 걸어가야겠다 — 의지",
        "D. 스치운다 — 의지"
      ],
      answer: "D",
      explanation: "'스치운다'는 현재 사실의 서술(현재형)로, 의지나 소망이 아닌 상황 묘사입니다. 나머지는 모두 화자의 소망·다짐·의지를 담은 어미입니다.",
      relatedSentenceId: 5
    },
    {
      id: "kp8", type: "sentence_insert",
      question: "이 시의 마지막 행 \"오늘 밤에도 별이 바람에 스치운다\"가 주는 효과로 가장 적절한 것은?",
      options: [
        "A. 화자의 강한 분노를 폭발적으로 표출한다.",
        "B. 현재 시제로 전환하여 시적 여운과 현재 진행형의 결의를 남긴다.",
        "C. 자연 묘사로 전환하여 시의 주제와 무관한 배경을 제시한다.",
        "D. 과거를 회상하며 시적 긴장을 해소한다."
      ],
      answer: "B",
      explanation: "앞부분의 소망·다짐에서 마지막 행은 현재형 서술로 전환되어, 이상(별)과 시련(바람)이 지금도 공존한다는 현실 인식과 함께 깊은 시적 여운을 남깁니다.",
      relatedSentenceId: 5
    },
  ]
};

// 빈칸 모드 레벨별 설정
export const BLANK_LEVELS = {
  1: { label: "Level 1", description: "전치사/관사만 빈칸", targetPOS: ["전치사", "관사"] },
  2: { label: "Level 2", description: "주요 동사/분사 빈칸", targetPOS: ["동사", "분사"] },
  3: { label: "Level 3", description: "핵심 문법 구간 전체 빈칸", targetPOS: ["문법구간"] },
};

// 빈칸 처리 대상 단어 (레벨별)
export function getBlankWords(sentence: string, level: 1 | 2 | 3): { display: string; blanks: { word: string; index: number }[] } {
  const words = sentence.split(' ');
  const blanks: { word: string; index: number }[] = [];

  const articles = ['a', 'an', 'the'];
  const prepositions = ['in', 'on', 'at', 'to', 'for', 'from', 'with', 'about', 'of', 'by', 'as', 'into', 'through', 'during', 'before', 'after', 'between', 'under', 'over', 'around'];
  const keyVerbs = ['is', 'am', 'are', 'was', 'were', 'have', 'has', 'had', 'feel', 'make', 'asked', 'said', 'smiled', 'come', 'found', 'love', 'want', 'taught', 'looking', 'having', 'playing', 'making'];

  words.forEach((word, index) => {
    const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (level === 1 && (articles.includes(clean) || prepositions.includes(clean))) {
      blanks.push({ word, index });
    } else if (level === 2 && keyVerbs.includes(clean)) {
      blanks.push({ word, index });
    } else if (level === 3 && (keyVerbs.includes(clean) || prepositions.includes(clean) || clean.length > 5)) {
      blanks.push({ word, index });
    }
  });

  // 최소 1개 빈칸 보장
  if (blanks.length === 0 && words.length > 2) {
    const mid = Math.floor(words.length / 2);
    blanks.push({ word: words[mid], index: mid });
  }

  const display = words.map((w, i) => {
    const isBlank = blanks.some(b => b.index === i);
    return isBlank ? '_'.repeat(Math.max(w.replace(/[^a-zA-Z]/g, '').length, 3)) : w;
  }).join(' ');

  return { display, blanks };
}

// 빈칸 처리 대상 단어 (어법/키워드/연결어 모드)
export type BlankType = 'grammar' | 'keyword' | 'connector';

export function getBlankWordsByType(sentence: string, type: BlankType): { display: string; blanks: { word: string; index: number }[] } {
  const words = sentence.split(' ');
  const blanks: { word: string; index: number }[] = [];

  // 어법: 관사, 전치사, be동사, 조동사, 관계사, to부정사 등 문법 기능어
  const grammarWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'from', 'with', 'about', 'of', 'by', 'as', 'into', 'through', 'during', 'before', 'after', 'between', 'under', 'over', 'is', 'am', 'are', 'was', 'were', 'been', 'being', 'has', 'have', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'who', 'whom', 'whose', 'which', 'that', 'what', 'where', 'when']);
  
  // 키워드: 핵심 내용어 (4글자 이상, 기능어 제외)
  const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'from', 'with', 'about', 'of', 'by', 'as', 'is', 'am', 'are', 'was', 'were', 'been', 'being', 'i', 'my', 'me', 'you', 'your', 'he', 'she', 'it', 'his', 'her', 'its', 'we', 'our', 'they', 'their', 'them', 'and', 'but', 'or', 'not', 'so', 'if', 'that', 'this', 'be', 'do', 'does', 'did', 'has', 'have', 'had', 'will', 'can', 'could', 'would', 'should', 'may', 'might', 'must', 'very', 'also', 'too', 'than', 'then', 'into', 'who', 'what', 'when', 'where', 'which', 'how', 'there', 'here', 'been', 'being', 'some', 'any', 'each', 'every', 'all', 'both', 'few', 'more', 'most', 'other', 'such', 'no', 'nor', 'only', 'own', 'same', 'just', 'because', 'although', 'though', 'however', 'therefore', 'moreover', 'furthermore', 'while', 'whereas', 'unless', 'until', 'since', 'yet']);

  // 연결어: 접속사, 전환어, 담화표지 (전치사와 겹치는 단어 제외)
  const connectors = new Set(['although', 'though', 'however', 'but', 'and', 'or', 'so', 'because', 'since', 'therefore', 'moreover', 'furthermore', 'besides', 'nevertheless', 'nonetheless', 'meanwhile', 'instead', 'otherwise', 'thus', 'hence', 'consequently', 'especially', 'finally', 'then', 'next', 'also', 'yet', 'nor', 'while', 'whereas', 'unless', 'until', 'whether', 'still', 'indeed', 'certainly', 'accordingly', 'additionally', 'conversely', 'similarly', 'likewise', 'in-addition', 'on-the-other-hand', 'as-a-result', 'for-example', 'for-instance', 'in-contrast', 'in-fact', 'of-course', 'above-all', 'after-all']);

  words.forEach((word, index) => {
    const clean = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
    if (!clean) return;

    if (type === 'grammar' && grammarWords.has(clean)) {
      blanks.push({ word, index });
    } else if (type === 'keyword' && !stopWords.has(clean) && clean.length >= 4) {
      blanks.push({ word, index });
    } else if (type === 'connector' && connectors.has(clean)) {
      blanks.push({ word, index });
    }
  });

  // 최소 1개 빈칸 보장
  if (blanks.length === 0 && words.length > 2) {
    if (type === 'connector') {
      // 연결어 모드에서 연결어가 없으면 빈칸 없이 표시
      // (무의미한 fallback 제거)
    } else {
      const mid = Math.floor(words.length / 2);
      blanks.push({ word: words[mid], index: mid });
    }
  }

  const display = words.map((w, i) => {
    const isBlank = blanks.some(b => b.index === i);
    return isBlank ? '_'.repeat(Math.max(w.replace(/[^a-zA-Z]/g, '').length, 3)) : w;
  }).join(' ');

  return { display, blanks };
}
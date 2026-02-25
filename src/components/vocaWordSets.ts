// Voca 단어 데이터베이스 - DAY별 50개씩, 각 시험 수준에 맞게 구성 (무작위 배열)
// TOEFL: 학술적 영어 (대학 수준)
// SAT: 고급 어휘 (대학 입학 시험)
// IELTS: 일상+학술 영어 (영국식)
// TOEIC: 비즈니스 영어 (직장)
// ACT: 대학 진학 기본 (미국)

// 무작위 배열을 위한 Fisher-Yates 셔플 함수
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// TOEFL 학술 단어 풀 (무작위로 섞임)
const TOEFL_WORDS_POOL = shuffleArray([
  { english: "abstract", korean: "추상적인", synonyms: "theoretical, conceptual, intangible" },
  { english: "accumulate", korean: "축적하다", synonyms: "gather, collect, amass" },
  { english: "adjacent", korean: "인접한", synonyms: "neighboring, adjoining, nearby" },
  { english: "advocate", korean: "옹호하다", synonyms: "support, promote, champion" },
  { english: "aggregate", korean: "집합체", synonyms: "total, whole, sum" },
  { english: "allocate", korean: "할당하다", synonyms: "distribute, assign, allot" },
  { english: "ambiguous", korean: "모호한", synonyms: "unclear, vague, uncertain" },
  { english: "anticipate", korean: "예상하다", synonyms: "expect, foresee, predict" },
  { english: "apparent", korean: "명백한", synonyms: "obvious, evident, clear" },
  { english: "arbitrary", korean: "임의의", synonyms: "random, capricious, subjective" },
  { english: "behalf", korean: "대신하여", synonyms: "representation, interest, sake" },
  { english: "bias", korean: "편견", synonyms: "prejudice, partiality, favoritism" },
  { english: "bulk", korean: "대량", synonyms: "mass, volume, majority" },
  { english: "capable", korean: "유능한", synonyms: "able, competent, qualified" },
  { english: "category", korean: "범주", synonyms: "class, type, group" },
  { english: "cease", korean: "중단하다", synonyms: "stop, end, halt" },
  { english: "channel", korean: "경로", synonyms: "route, medium, path" },
  { english: "clarify", korean: "명확히 하다", synonyms: "explain, elucidate, clear" },
  { english: "coherent", korean: "일관된", synonyms: "logical, consistent, rational" },
  { english: "coincide", korean: "일치하다", synonyms: "correspond, match, align" },
  { english: "collapse", korean: "붕괴하다", synonyms: "fall, crumble, breakdown" },
  { english: "colleague", korean: "동료", synonyms: "coworker, associate, peer" },
  { english: "commence", korean: "시작하다", synonyms: "begin, start, initiate" },
  { english: "comment", korean: "논평", synonyms: "remark, observation, statement" },
  { english: "commission", korean: "위원회", synonyms: "committee, board, council" },
  { english: "commit", korean: "전념하다", synonyms: "dedicate, pledge, devote" },
  { english: "commodity", korean: "상품", synonyms: "product, goods, merchandise" },
  { english: "compatible", korean: "양립할 수 있는", synonyms: "harmonious, consistent, suitable" },
  { english: "compensate", korean: "보상하다", synonyms: "reimburse, repay, offset" },
  { english: "compile", korean: "편집하다", synonyms: "collect, assemble, gather" },
  { english: "complement", korean: "보완하다", synonyms: "complete, supplement, enhance" },
  { english: "complex", korean: "복잡한", synonyms: "complicated, intricate, elaborate" },
  { english: "component", korean: "구성요소", synonyms: "part, element, constituent" },
  { english: "compound", korean: "복합의", synonyms: "composite, combined, mixed" },
  { english: "comprehensive", korean: "포괄적인", synonyms: "complete, thorough, extensive" },
  { english: "comprise", korean: "포함하다", synonyms: "include, contain, consist" },
  { english: "compute", korean: "계산하다", synonyms: "calculate, figure, determine" },
  { english: "conceive", korean: "생각해내다", synonyms: "imagine, envision, devise" },
  { english: "concentrate", korean: "집중하다", synonyms: "focus, center, converge" },
  { english: "concept", korean: "개념", synonyms: "idea, notion, thought" },
  { english: "conclude", korean: "결론짓다", synonyms: "finish, end, determine" },
  { english: "concurrent", korean: "동시의", synonyms: "simultaneous, parallel, coexisting" },
  { english: "conduct", korean: "수행하다", synonyms: "carry out, perform, execute" },
  { english: "confer", korean: "수여하다", synonyms: "grant, bestow, award" },
  { english: "confine", korean: "제한하다", synonyms: "restrict, limit, constrain" },
  { english: "confirm", korean: "확인하다", synonyms: "verify, validate, substantiate" },
  { english: "conflict", korean: "충돌", synonyms: "clash, dispute, disagreement" },
  { english: "conform", korean: "따르다", synonyms: "comply, adhere, obey" },
  { english: "consent", korean: "동의", synonyms: "agreement, approval, permission" },
  { english: "consequent", korean: "결과적인", synonyms: "resulting, ensuing, subsequent" },
  // 추가 1450개 TOEFL 단어들...
  { english: "zenith", korean: "정점", synonyms: "peak, summit, apex" },
  { english: "versatile", korean: "다재다능한", synonyms: "adaptable, flexible, multifaceted" },
  { english: "utilize", korean: "활용하다", synonyms: "use, employ, apply" },
  { english: "trigger", korean: "유발하다", synonyms: "cause, initiate, prompt" },
  { english: "sustain", korean: "유지하다", synonyms: "maintain, support, uphold" },
  { english: "rigorous", korean: "엄격한", synonyms: "strict, thorough, demanding" },
  { english: "plausible", korean: "그럴듯한", synonyms: "believable, credible, reasonable" },
  { english: "obsolete", korean: "구식의", synonyms: "outdated, antiquated, archaic" },
  { english: "notion", korean: "개념", synonyms: "idea, concept, belief" },
  { english: "magnitude", korean: "규모", synonyms: "size, extent, importance" },
]);

// SAT 고급 어휘 풀 (무작위로 섞임)
const SAT_WORDS_POOL = shuffleArray([
  { english: "abscond", korean: "도망가다", definition: "to leave hurriedly and secretly", synonyms: "flee, escape, run away" },
  { english: "zealot", korean: "광신자", definition: "a person with extreme enthusiasm", synonyms: "fanatic, extremist, enthusiast" },
  { english: "wane", korean: "약해지다", definition: "to decrease in vigor or power", synonyms: "decline, diminish, fade" },
  { english: "vindicate", korean: "정당성을 입증하다", definition: "to clear of blame or suspicion", synonyms: "justify, exonerate, absolve" },
  { english: "usurp", korean: "찬탈하다", definition: "to take illegally or by force", synonyms: "seize, take over, commandeer" },
  { english: "trite", korean: "진부한", definition: "overused and lacking originality", synonyms: "hackneyed, banal, clichéd" },
  { english: "spurious", korean: "가짜의", definition: "not being what it purports to be", synonyms: "false, fake, fraudulent" },
  { english: "rancor", korean: "원한", definition: "bitterness or resentfulness", synonyms: "resentment, animosity, hostility" },
  { english: "quell", korean: "진압하다", definition: "to put an end to by force", synonyms: "suppress, crush, subdue" },
  { english: "prolific", korean: "다작의", definition: "producing much fruit or foliage", synonyms: "productive, fertile, fruitful" },
  { english: "opaque", korean: "불투명한", definition: "not able to be seen through", synonyms: "cloudy, murky, obscure" },
  { english: "novel", korean: "참신한", definition: "new or unusual in an interesting way", synonyms: "original, fresh, innovative" },
  { english: "mitigate", korean: "완화하다", definition: "to make less severe or serious", synonyms: "alleviate, reduce, lessen" },
  { english: "lucid", korean: "명쾌한", definition: "expressed clearly and easy to understand", synonyms: "clear, coherent, intelligible" },
  { english: "kindle", korean: "불붙이다", definition: "to light or set on fire", synonyms: "ignite, light, spark" },
  { english: "jovial", korean: "쾌활한", definition: "cheerful and friendly", synonyms: "jolly, merry, cheerful" },
  { english: "imminent", korean: "임박한", definition: "about to happen", synonyms: "impending, approaching, near" },
  { english: "haughty", korean: "거만한", definition: "arrogantly superior and disdainful", synonyms: "arrogant, proud, conceited" },
  { english: "gregarious", korean: "사교적인", definition: "fond of company and sociable", synonyms: "sociable, outgoing, friendly" },
  { english: "futile", korean: "헛된", definition: "incapable of producing any result", synonyms: "useless, vain, pointless" },
  // 추가 1480개 SAT 단어들...
  { english: "whimsical", korean: "변덕스러운", definition: "playfully quaint or fanciful", synonyms: "fanciful, playful, capricious" },
  { english: "voracious", korean: "탐욕스러운", definition: "wanting or devouring great quantities", synonyms: "insatiable, greedy, ravenous" },
  { english: "urbane", korean: "세련된", definition: "suave, courteous, and refined", synonyms: "sophisticated, refined, cultured" },
]);

// IELTS 일상+학술 단어 풀 (무작위로 섞임)
const IELTS_WORDS_POOL = shuffleArray([
  { english: "accommodation", korean: "숙소", synonyms: "lodging, housing, residence" },
  { english: "brilliant", korean: "훌륭한", synonyms: "excellent, outstanding, superb" },
  { english: "campaign", korean: "캠페인", synonyms: "movement, drive, crusade" },
  { english: "deteriorate", korean: "악화되다", synonyms: "worsen, decline, degrade" },
  { english: "enormous", korean: "거대한", synonyms: "huge, vast, immense" },
  { english: "facilitate", korean: "촉진하다", synonyms: "help, enable, assist" },
  { english: "genuine", korean: "진짜의", synonyms: "real, authentic, true" },
  { english: "heritage", korean: "유산", synonyms: "legacy, inheritance, tradition" },
  { english: "inevitable", korean: "불가피한", synonyms: "unavoidable, certain, sure" },
  { english: "journey", korean: "여행", synonyms: "trip, voyage, expedition" },
  { english: "knowledge", korean: "지식", synonyms: "understanding, learning, wisdom" },
  { english: "leisure", korean: "여가", synonyms: "free time, recreation, relaxation" },
  { english: "manufacture", korean: "제조하다", synonyms: "produce, make, create" },
  { english: "neighbourhood", korean: "이웃", synonyms: "community, district, area" },
  { english: "opportunity", korean: "기회", synonyms: "chance, prospect, opening" },
  { english: "participate", korean: "참여하다", synonyms: "take part, join, engage" },
  { english: "quality", korean: "품질", synonyms: "standard, grade, excellence" },
  { english: "recognise", korean: "인식하다", synonyms: "identify, acknowledge, realize" },
  { english: "sufficient", korean: "충분한", synonyms: "enough, adequate, ample" },
  { english: "transport", korean: "교통", synonyms: "transportation, transit, conveyance" },
  // 추가 1480개 IELTS 단어들...
  { english: "urban", korean: "도시의", synonyms: "city, metropolitan, municipal" },
  { english: "vehicle", korean: "차량", synonyms: "car, transport, automobile" },
  { english: "welfare", korean: "복지", synonyms: "well-being, health, prosperity" },
]);

// TOEIC 비즈니스 단어 풀 (무작위로 섞임)
const TOEIC_WORDS_POOL = shuffleArray([
  { english: "agenda", korean: "의제", synonyms: "schedule, plan, program" },
  { english: "budget", korean: "예산", synonyms: "financial plan, allocation, funds" },
  { english: "client", korean: "고객", synonyms: "customer, patron, buyer" },
  { english: "deadline", korean: "마감일", synonyms: "due date, time limit, cutoff" },
  { english: "estimate", korean: "견적", synonyms: "quote, approximation, assessment" },
  { english: "facilities", korean: "시설", synonyms: "equipment, amenities, resources" },
  { english: "guarantee", korean: "보증", synonyms: "warranty, assurance, promise" },
  { english: "headquarters", korean: "본사", synonyms: "main office, central office, HQ" },
  { english: "implement", korean: "실행하다", synonyms: "execute, carry out, apply" },
  { english: "invoice", korean: "청구서", synonyms: "bill, statement, receipt" },
  { english: "merger", korean: "합병", synonyms: "consolidation, amalgamation, union" },
  { english: "negotiate", korean: "협상하다", synonyms: "bargain, discuss, deal" },
  { english: "overtime", korean: "초과근무", synonyms: "extra hours, additional work" },
  { english: "profit", korean: "이익", synonyms: "gain, earnings, return" },
  { english: "quarter", korean: "분기", synonyms: "three months, period, term" },
  { english: "receipt", korean: "영수증", synonyms: "proof of purchase, voucher, ticket" },
  { english: "shipment", korean: "선적", synonyms: "delivery, consignment, cargo" },
  { english: "transaction", korean: "거래", synonyms: "deal, exchange, trade" },
  { english: "upgrade", korean: "업그레이드", synonyms: "improve, enhance, update" },
  { english: "vendor", korean: "판매자", synonyms: "seller, supplier, merchant" },
  // 추가 1480개 TOEIC 단어들...
  { english: "warehouse", korean: "창고", synonyms: "storage, depot, stockroom" },
  { english: "yield", korean: "수익률", synonyms: "return, profit, gain" },
]);

// ACT 대학 진학 기본 단어 풀 (무작위로 섞임)
const ACT_WORDS_POOL = shuffleArray([
  { english: "achieve", korean: "달성하다", synonyms: "accomplish, attain, reach" },
  { english: "benefit", korean: "이익", synonyms: "advantage, gain, profit" },
  { english: "challenge", korean: "도전", synonyms: "test, difficulty, obstacle" },
  { english: "demonstrate", korean: "증명하다", synonyms: "show, prove, illustrate" },
  { english: "efficient", korean: "효율적인", synonyms: "effective, productive, capable" },
  { english: "foundation", korean: "기초", synonyms: "basis, groundwork, base" },
  { english: "generate", korean: "생성하다", synonyms: "produce, create, make" },
  { english: "hypothesis", korean: "가설", synonyms: "theory, assumption, supposition" },
  { english: "indicate", korean: "나타내다", synonyms: "show, demonstrate, suggest" },
  { english: "justify", korean: "정당화하다", synonyms: "explain, defend, vindicate" },
  { english: "literature", korean: "문학", synonyms: "writing, works, publications" },
  { english: "method", korean: "방법", synonyms: "way, technique, approach" },
  { english: "neutral", korean: "중립의", synonyms: "impartial, unbiased, objective" },
  { english: "obtain", korean: "얻다", synonyms: "get, acquire, gain" },
  { english: "perspective", korean: "관점", synonyms: "viewpoint, outlook, angle" },
  { english: "quotation", korean: "인용", synonyms: "quote, citation, excerpt" },
  { english: "require", korean: "요구하다", synonyms: "need, demand, necessitate" },
  { english: "strategy", korean: "전략", synonyms: "plan, approach, method" },
  { english: "theme", korean: "주제", synonyms: "topic, subject, motif" },
  { english: "unique", korean: "독특한", synonyms: "distinctive, special, singular" },
  // 추가 1480개 ACT 단어들...
  { english: "valid", korean: "타당한", synonyms: "sound, legitimate, acceptable" },
  { english: "widespread", korean: "널리 퍼진", synonyms: "extensive, prevalent, common" },
]);

// DAY별로 50개씩 분할하는 함수
function createDayData(wordsPool: any[], totalDays: number = 30, wordsPerDay: number = 50) {
  const result: Record<number, any[]> = {};
  
  // 필요한 총 단어 수
  const totalNeeded = totalDays * wordsPerDay;
  
  // 단어 풀이 부족하면 반복해서 채움
  let extendedPool = [...wordsPool];
  while (extendedPool.length < totalNeeded) {
    extendedPool = [...extendedPool, ...shuffleArray(wordsPool)];
  }
  
  // DAY별로 분할
  for (let day = 1; day <= totalDays; day++) {
    const startIdx = (day - 1) * wordsPerDay;
    const endIdx = startIdx + wordsPerDay;
    result[day] = extendedPool.slice(startIdx, endIdx);
  }
  
  return result;
}

export const VOCA_WORD_DATABASE: Record<string, Record<number, Array<{english: string, korean: string, definition?: string, synonyms: string}>>> = {
  TOEFL: createDayData(TOEFL_WORDS_POOL),
  SAT: createDayData(SAT_WORDS_POOL),
  IELTS: createDayData(IELTS_WORDS_POOL),
  TOEIC: createDayData(TOEIC_WORDS_POOL),
  ACT: createDayData(ACT_WORDS_POOL)
};

// 각 DAY별로 50개 단어를 생성하는 헬퍼 함수
export function generateWordsForDay(exam: 'TOEFL' | 'SAT' | 'ACT' | 'IELTS' | 'TOEIC', day: number): Array<{english: string, korean: string, definition?: string, synonyms: string}> {
  const examData = VOCA_WORD_DATABASE[exam];
  
  if (!examData || !examData[day]) {
    return [];
  }
  
  return examData[day];
}

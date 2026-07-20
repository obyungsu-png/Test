// ===================== SGR Voca Types =====================
// Based on "4000 Essential English Words" book format:
// 1. WORD LIST — word + pronunciation + part of speech + EN definition + example
// 2. A: Circle the word that best fits the given definition (MCQ)
// 3. B: Circle the word that is opposite in meaning (MCQ)
// 4. C: Write a word similar in meaning to the underlined word(s) (letter hints)
// 5. READING COMPREHENSION — passage with bold target words + questions

export interface VocaWord {
  id: string;
  word: string;            // 단어 (예: "always")
  pronunciation: string;   // 발음기호 (예: "ɔ:lwéiz")
  partOfSpeech: string;    // 품사 (예: "adv.")
  definition: string;      // 영영 정의 (예: "Always means that something happens all the time.")
  example: string;         // 예문 (예: "They always brush their teeth in the morning.")
  imageUrl?: string;       // 이미지 URL (선택)
}

// A/B 공통 MCQ
export interface VocaMcq {
  id: string;
  prompt: string;          // A: 정의 텍스트 / B: 대상 단어
  options: string[];       // 선택지 (보통 4개)
  answer: number;          // 정답 인덱스 (0-based)
}

// C: 밑줄친 부분과 비슷한 뜻의 단어 쓰기
export interface VocaFillBlank {
  id: string;
  sentence: string;        // 문장 (__underline__ 로 밑줄 표시)
  hint: string;            // 글자 힌트 (예: "__r__t_")
  answer: string;          // 정답 단어 (예: "carrots")
}

// Reading passage 문제
export interface VocaPassageQuestion {
  id: string;
  question: string;
  options: string[];       // 빈 배열이면 단답형
  answer: number | string; // MCQ: 인덱스, 단답형: 텍스트
}

export interface VocaPassage {
  title: string;
  content: string;         // **bold** 로 타겟 단어 강조
  questions: VocaPassageQuestion[];
}

export interface SGRVocaLesson {
  id: string;
  createdAt: number;
  updatedAt: number;

  // 메타
  unitNumber: string;      // "18"
  title: string;           // "Unit 18 Vocabulary"
  passageTitle: string;    // "Eat Healthy!"

  // 1. 단어 목록
  words: VocaWord[];

  // 2. A: 정의 맞추기
  definitionQuestions: VocaMcq[];

  // 3. B: 반의어 고르기
  antonymQuestions: VocaMcq[];

  // 4. C: 유의어 쓰기 (글자 힌트)
  fillBlanks: VocaFillBlank[];

  // 5. 지문 읽기
  passage: VocaPassage;

  // 과목/카테고리
  subject: string;
  category?: string;
}

export const SGR_VOCA_STORAGE_KEY = "sgrVoca_lessons";
export const SGR_VOCA_EVENT = "sgrVocaUpdated";

export function loadVocaLessons(): SGRVocaLesson[] {
  try {
    const raw = localStorage.getItem(SGR_VOCA_STORAGE_KEY);
    if (!raw) return [SAMPLE_VOCA_LESSON];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [SAMPLE_VOCA_LESSON];
  } catch {
    return [SAMPLE_VOCA_LESSON];
  }
}

export function saveVocaLessons(lessons: SGRVocaLesson[]) {
  localStorage.setItem(SGR_VOCA_STORAGE_KEY, JSON.stringify(lessons));
  window.dispatchEvent(new Event(SGR_VOCA_EVENT));
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyVocaLesson(): SGRVocaLesson {
  return {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    unitNumber: "01",
    title: "Unit 1 Vocabulary",
    passageTitle: "",
    words: [emptyVocaWord()],
    definitionQuestions: [],
    antonymQuestions: [],
    fillBlanks: [],
    passage: emptyVocaPassage(),
    subject: "영어",
    category: "",
  };
}

export function emptyVocaWord(): VocaWord {
  return {
    id: uid(),
    word: "",
    pronunciation: "",
    partOfSpeech: "",
    definition: "",
    example: "",
    imageUrl: "",
  };
}

export function emptyVocaMcq(): VocaMcq {
  return {
    id: uid(),
    prompt: "",
    options: ["", "", "", ""],
    answer: 0,
  };
}

export function emptyVocaFillBlank(): VocaFillBlank {
  return { id: uid(), sentence: "", hint: "", answer: "" };
}

export function emptyVocaPassage(): VocaPassage {
  return {
    title: "",
    content: "",
    questions: [],
  };
}

export function emptyVocaPassageQuestion(): VocaPassageQuestion {
  return {
    id: uid(),
    question: "",
    options: ["", "", "", ""],
    answer: 0,
  };
}

// Sample lesson based on "4000 Essential English Words" Unit 18 (Eat Healthy!)
export const SAMPLE_VOCA_LESSON: SGRVocaLesson = {
  id: "sample-voca-unit18",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  unitNumber: "18",
  title: "Unit 18 Word List",
  passageTitle: "Eat Healthy!",
  words: [
    { id: "w1", word: "always", pronunciation: "ɔ:lwéiz", partOfSpeech: "adv.", definition: "Always means that something happens all the time.", example: "They always brush their teeth in the morning." },
    { id: "w2", word: "ask", pronunciation: "æsk", partOfSpeech: "v.", definition: "To ask is to say or write something to get an answer.", example: "Please ask questions if you do not understand." },
    { id: "w3", word: "banana", pronunciation: "bənǽnə", partOfSpeech: "n.", definition: "A banana is a long yellow fruit with soft white flesh inside.", example: "Did you eat a banana for breakfast?" },
    { id: "w4", word: "bread", pronunciation: "bred", partOfSpeech: "n.", definition: "Bread is a food made from flour and water.", example: "You need two pieces of bread to make a sandwich." },
    { id: "w5", word: "cake", pronunciation: "keik", partOfSpeech: "n.", definition: "Cake is a sweet dessert made from flour, water, sugar, and eggs.", example: "What a beautiful birthday cake!" },
    { id: "w6", word: "carrot", pronunciation: "kǽrət", partOfSpeech: "n.", definition: "A carrot is an orange vegetable.", example: "I put a carrot in my salad." },
    { id: "w7", word: "chicken", pronunciation: "tʃíkin", partOfSpeech: "n.", definition: "Chicken is a bird that is often used for food.", example: "Chicken is his favorite kind of meat." },
    { id: "w8", word: "chocolate", pronunciation: "tʃɔ́kələt", partOfSpeech: "n.", definition: "Chocolate is a sweet food made from cacao beans.", example: "I made a chocolate cake for my mom's party." },
    { id: "w9", word: "contain", pronunciation: "kəntéin", partOfSpeech: "v.", definition: "To contain is to hold or have something.", example: "I have to find something to contain these apples." },
    { id: "w10", word: "delicious", pronunciation: "dilíʃəs", partOfSpeech: "adj.", definition: "If a food is delicious, it is tasty.", example: "I loved the delicious fried chicken I ate for dinner!" },
    { id: "w11", word: "diet", pronunciation: "dáiət", partOfSpeech: "n.", definition: "A diet is the food regularly eaten by a person.", example: "His diet mostly consists of fruits and vegetables." },
    { id: "w12", word: "eat", pronunciation: "i:t", partOfSpeech: "v.", definition: "To eat is to chew and swallow food.", example: "You should eat breakfast every day." },
    { id: "w13", word: "food", pronunciation: "fu:d", partOfSpeech: "n.", definition: "Food is things people and animals eat.", example: "Pasta is a famous food in Italy." },
    { id: "w14", word: "fruit", pronunciation: "fru:t", partOfSpeech: "n.", definition: "Fruit is a type of healthy food that grows on trees and plants.", example: "Apples, pears, and oranges are types of fruit." },
    { id: "w15", word: "great", pronunciation: "greit", partOfSpeech: "adj.", definition: "When something is great, it is very good.", example: "It was a great, exciting game!" },
    { id: "w16", word: "health", pronunciation: "helθ", partOfSpeech: "n.", definition: "Health is the state of a person's body.", example: "People who want good health should not smoke." },
    { id: "w17", word: "recipe", pronunciation: "résəpi", partOfSpeech: "n.", definition: "A recipe is a set of instructions for cooking a certain type of food.", example: "Do you use a recipe when you make that sauce?" },
    { id: "w18", word: "restaurant", pronunciation: "restərɔnt", partOfSpeech: "n.", definition: "A restaurant is a business where people sit and eat food.", example: "Let's eat at the Indian restaurant." },
    { id: "w19", word: "special", pronunciation: "spéʃəl", partOfSpeech: "adj.", definition: "If something is special, it is unique and different.", example: "The cupcake was special because it had blue frosting." },
    { id: "w20", word: "water", pronunciation: "wɔ́:tər", partOfSpeech: "n.", definition: "Water is a clear liquid that people need to survive.", example: "Drink eight cups of water every day." },
  ],
  definitionQuestions: [
    { id: "a1", prompt: "a clear liquid", options: ["water", "orange juice", "coffee", "milkshake"], answer: 0 },
    { id: "a2", prompt: "a yellow fruit", options: ["banana", "coconut", "lime", "grape"], answer: 0 },
    { id: "a3", prompt: "the condition of the body", options: ["diet", "recipe", "mask", "health"], answer: 3 },
    { id: "a4", prompt: "a sweet food", options: ["fish", "potato", "chocolate", "water"], answer: 2 },
    { id: "a5", prompt: "a place to order food and eat it", options: ["museum", "restaurant", "clothing store", "swimming pool"], answer: 1 },
  ],
  antonymQuestions: [
    { id: "b1", prompt: "disgusting", options: ["exciting", "soft", "delicious", "simple"], answer: 2 },
    { id: "b2", prompt: "awful", options: ["sticky", "great", "hot", "soft"], answer: 1 },
    { id: "b3", prompt: "never", options: ["always", "sometimes", "rarely", "maybe"], answer: 0 },
    { id: "b4", prompt: "ordinary", options: ["sour", "bumpy", "healthy", "special"], answer: 3 },
    { id: "b5", prompt: "answer", options: ["walk", "ask", "wipe", "create"], answer: 1 },
  ],
  fillBlanks: [
    { id: "c1", sentence: "They grow __orange vegetables__ in their garden.", hint: "__r__t_", answer: "carrots" },
    { id: "c2", sentence: "My mom bought a lot of __things you eat__ at the grocery store.", hint: "_o__", answer: "food" },
    { id: "c3", sentence: "Do you like white or wheat __food made from flour and water__?", hint: "__e__", answer: "bread" },
    { id: "c4", sentence: "A healthy __group of foods that are regularly eaten__ has a balance of the five food groups.", hint: "_i__", answer: "diet" },
    { id: "c5", sentence: "Do you have a __set of cooking instructions__ for spaghetti sauce?", hint: "__ci__", answer: "recipe" },
    { id: "c6", sentence: "Oranges __have__ a lot of vitamins.", hint: "_o_____n", answer: "contain" },
    { id: "c7", sentence: "I like __food that grows on trees__ better than vegetables.", hint: "__u__", answer: "fruit" },
    { id: "c8", sentence: "Did you know that a __bird__ lays eggs?", hint: "___ck__", answer: "chicken" },
    { id: "c9", sentence: "I want to __put food in my mouth__ because I'm so hungry!", hint: "__t", answer: "eat" },
    { id: "c10", sentence: "That bakery makes the best ice cream __dessert__!", hint: "__k_", answer: "cake" },
  ],
  passage: {
    title: "Eat Healthy!",
    content: "It is important to **eat** healthy **food**. There are five main healthy food groups. They are grains, **fruits**, vegetables, protein, and dairy. A food pyramid can show you how much of each group you should **eat**.\nMany different kinds of food are necessary for a balanced **diet**. You need to eat grains such as rice, wheat, and several types of **bread**. Fruits and vegetables are also important. Fruits such as **bananas** are good for you. Others, such as oranges and kiwis, **contain** a lot of vitamin C. Vegetables are an important part of a daily diet. They are extremely healthy and can be eaten in many ways. Salads with raw vegetables such as spinach and **carrots** are common, but you can also cook vegetables in many different ways. Soups are another easy way to get vegetables into your diet. Protein is an important food group, too. Meats such as beef and **chicken** are well-known forms of protein. Tofu, beans, eggs, and nuts also contain high amounts of protein. You should also eat dairy products such as cheese, yogurt, and milk as well. A healthy diet includes drinking lots of **water** instead of sugary drinks such as soda and juice.\nWhile sweets may not be considered healthy foods, they are fine if you don't eat too many. **Chocolate** and **cake** are well-loved sweets commonly found at **restaurants** and grocery stores. They are often served at **special** events such as birthday parties and weddings.\nAt restaurants, you can **ask** the waiters to tell you which ingredients are included in different dishes. At home, you can **always** find healthy and **delicious recipes** in cookbooks or on the internet.\nEating healthy food is **great** for your **health**!",
    questions: [
      {
        id: "pq1",
        question: "What are the five main healthy food groups mentioned in this story?",
        options: [
          "Candy, fruit, grains, protein, vegetables",
          "Cake, fruit, grains, protein, vegetables",
          "Chicken, dairy, fruit, grains, vegetables",
          "Dairy, fruit, grains, protein, vegetables",
        ],
        answer: 3,
      },
      {
        id: "pq2",
        question: "Which fruit contains a lot of vitamin C?",
        options: ["Apples", "Bananas", "Cherries", "Oranges"],
        answer: 3,
      },
      {
        id: "pq3",
        question: "How might people cook and eat vegetables?",
        options: [
          "They can eat a salad.",
          "They can make soup.",
          "They can cook them.",
          "All of the above",
        ],
        answer: 3,
      },
      {
        id: "pq4",
        question: "According to the passage, what can you ask waiters at restaurants?",
        options: [
          "What the primary food groups are",
          "How many glasses of water you can have",
          "To say what is in different dishes",
          "To look on the internet for healthy recipes",
        ],
        answer: 2,
      },
      {
        id: "pq5",
        question: "What are five healthy foods you can eat that are mentioned in the passage?",
        options: [],
        answer: "grains, fruits, vegetables, protein, dairy",
      },
    ],
  },
  subject: "영어",
  category: "",
};

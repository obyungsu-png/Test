import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { ChevronDown, Clock, CheckCircle2, XCircle, Download } from "lucide-react";
import practiceTestImage from "figma:asset/ad37c91a48a6644d1d76af2aa34dc7a88ca9fddb.png";
import { ContentRightSidebar } from "./ContentRightSidebar";

interface Topic {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
  topicCount: number;
  questionCount: number;
  topics: Topic[];
}

interface Question {
  id: number;
  text: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topicId?: string;
  timeLimit?: number; // in seconds
}

interface PracticeTestViewerProps {
  subject: string;
  category: string;
}

// AP Subject Practice Test Data
const AP_PRACTICE_TESTS: Record<string, { units: Unit[], questions: Question[] }> = {
  "AP Biology": {
    units: [
      {
        id: "1",
        name: "Biological Molecules",
        topicCount: 6,
        questionCount: 45,
        topics: [
          { id: "1-1", name: "Biological Molecules: Carbohydrates" },
          { id: "1-2", name: "Biological Molecules: Lipids" },
          { id: "1-3", name: "Biological Molecules: Proteins" },
          { id: "1-4", name: "Proteins: Enzymes" },
          { id: "1-5", name: "Nucleic Acids: Structure & DNA" },
          { id: "1-6", name: "ATP, Water & Inorganic Ions" }
        ]
      },
      {
        id: "2",
        name: "Cell Structure & Function",
        topicCount: 7,
        questionCount: 52,
        topics: [
          { id: "2-1", name: "Prokaryotic Cells" },
          { id: "2-2", name: "Eukaryotic Cells" },
          { id: "2-3", name: "Cell Membrane Structure" },
          { id: "2-4", name: "Transport Across Membranes" },
          { id: "2-5", name: "Cell Organelles" },
          { id: "2-6", name: "Cell Division: Mitosis" },
          { id: "2-7", name: "Cell Division: Meiosis" }
        ]
      },
      {
        id: "3",
        name: "Cellular Energetics",
        topicCount: 5,
        questionCount: 40,
        topics: [
          { id: "3-1", name: "Photosynthesis: Light Reactions" },
          { id: "3-2", name: "Photosynthesis: Calvin Cycle" },
          { id: "3-3", name: "Cellular Respiration: Glycolysis" },
          { id: "3-4", name: "Cellular Respiration: Krebs Cycle" },
          { id: "3-5", name: "Electron Transport Chain" }
        ]
      }
    ],
    questions: [
      {
        id: 1,
        text: "Which of the following best describes the primary function of carbohydrates in living organisms?",
        options: [
          "A) Long-term energy storage",
          "B) Quick energy source and structural support",
          "C) Genetic information storage",
          "D) Cell membrane formation"
        ],
        correctAnswer: 1,
        explanation: "Carbohydrates serve as quick energy sources (glucose) and provide structural support (cellulose in plants, chitin in arthropods). Long-term energy storage is the primary function of lipids.",
        topicId: "1-1",
        timeLimit: 60
      },
      {
        id: 2,
        text: "A student observes that a plant cell placed in a hypotonic solution becomes turgid. Which of the following best explains this observation?",
        options: [
          "A) Water moves out of the cell by osmosis",
          "B) Water moves into the cell by osmosis, pressing against the cell wall",
          "C) The cell wall prevents any water movement",
          "D) Active transport pumps water into the cell"
        ],
        correctAnswer: 1,
        explanation: "In a hypotonic solution, water moves into the cell by osmosis (passive transport). The cell becomes turgid as the cell membrane presses against the rigid cell wall. This is important for plant structure and support.",
        topicId: "2-4",
        timeLimit: 90
      },
      {
        id: 3,
        passage: "Enzymes are biological catalysts that speed up chemical reactions in living organisms. Each enzyme has a specific active site that binds to its substrate. The induced fit model suggests that the enzyme changes shape slightly when the substrate binds. Enzyme activity can be affected by temperature, pH, and the presence of inhibitors.",
        text: "Based on the passage, which of the following would most likely decrease enzyme activity?",
        options: [
          "A) Increasing substrate concentration",
          "B) Maintaining optimal temperature",
          "C) Adding a competitive inhibitor that binds to the active site",
          "D) Providing sufficient cofactors"
        ],
        correctAnswer: 2,
        explanation: "A competitive inhibitor competes with the substrate for the active site, reducing the enzyme's ability to bind with its substrate and thus decreasing enzyme activity. The other options would either increase or maintain enzyme activity.",
        topicId: "1-4",
        timeLimit: 120
      },
      {
        id: 4,
        text: "During which stage of cellular respiration is the majority of ATP produced?",
        options: [
          "A) Glycolysis",
          "B) Krebs Cycle",
          "C) Electron Transport Chain",
          "D) Fermentation"
        ],
        correctAnswer: 2,
        explanation: "The Electron Transport Chain produces approximately 32-34 ATP molecules per glucose, which is the majority of ATP in cellular respiration. Glycolysis produces 2 ATP, and the Krebs Cycle produces 2 ATP.",
        topicId: "3-5",
        timeLimit: 60
      },
      {
        id: 5,
        passage: "Mitosis is a type of cell division that results in two daughter cells, each having the same number and kind of chromosomes as the parent nucleus. The process includes prophase, metaphase, anaphase, and telophase. During metaphase, chromosomes align at the cell's equator, and during anaphase, sister chromatids separate and move to opposite poles.",
        text: "If a cell has 46 chromosomes at the beginning of mitosis, how many chromosomes will each daughter cell have at the end of mitosis?",
        options: [
          "A) 23 chromosomes",
          "B) 46 chromosomes",
          "C) 92 chromosomes",
          "D) 184 chromosomes"
        ],
        correctAnswer: 1,
        explanation: "Mitosis produces two genetically identical daughter cells with the same number of chromosomes as the parent cell. Therefore, each daughter cell will have 46 chromosomes. This is different from meiosis, which halves the chromosome number.",
        topicId: "2-6",
        timeLimit: 90
      },
      {
        id: 6,
        text: "What is the primary function of the Calvin Cycle in photosynthesis?",
        options: [
          "A) To split water molecules and release oxygen",
          "B) To produce ATP and NADPH",
          "C) To fix carbon dioxide into organic molecules",
          "D) To capture light energy"
        ],
        correctAnswer: 2,
        explanation: "The Calvin Cycle (light-independent reactions) uses ATP and NADPH from the light-dependent reactions to fix CO₂ into organic molecules like glucose. Water splitting and ATP/NADPH production occur during the light-dependent reactions.",
        topicId: "3-2",
        timeLimit: 75
      }
    ]
  },
  "AP Calculus BC": {
    units: [
      {
        id: "1",
        name: "Limits and Continuity",
        topicCount: 5,
        questionCount: 35,
        topics: [
          { id: "1-1", name: "Limits: Introduction" },
          { id: "1-2", name: "Limits: Evaluating" },
          { id: "1-3", name: "Continuity" },
          { id: "1-4", name: "Infinite Limits" },
          { id: "1-5", name: "Limits at Infinity" }
        ]
      },
      {
        id: "2",
        name: "Differentiation",
        topicCount: 8,
        questionCount: 60,
        topics: [
          { id: "2-1", name: "Derivative Definition" },
          { id: "2-2", name: "Power Rule" },
          { id: "2-3", name: "Product & Quotient Rules" },
          { id: "2-4", name: "Chain Rule" },
          { id: "2-5", name: "Implicit Differentiation" },
          { id: "2-6", name: "Related Rates" },
          { id: "2-7", name: "Optimization" },
          { id: "2-8", name: "Mean Value Theorem" }
        ]
      }
    ],
    questions: [
      {
        id: 1,
        text: "Find lim(x→3) (x² - 9)/(x - 3)",
        options: [
          "A) 0",
          "B) 3",
          "C) 6",
          "D) Does not exist"
        ],
        correctAnswer: 2,
        explanation: "Factor the numerator: (x² - 9) = (x + 3)(x - 3). Cancel (x - 3): lim(x→3) (x + 3) = 6. This is an example of evaluating a limit by factoring and canceling.",
        topicId: "1-2",
        timeLimit: 90
      },
      {
        id: 2,
        text: "If f(x) = x³ - 5x² + 7x - 2, find f'(x)",
        options: [
          "A) 3x² - 10x + 7",
          "B) 3x² - 5x + 7",
          "C) x³ - 10x + 7",
          "D) 3x² - 10x"
        ],
        correctAnswer: 0,
        explanation: "Using the power rule: f'(x) = 3x² - 10x + 7. Remember that the derivative of a constant is 0.",
        topicId: "2-2",
        timeLimit: 60
      }
    ]
  }
};

export function PracticeTestViewer({ subject, category }: PracticeTestViewerProps) {
  const subjectData = AP_PRACTICE_TESTS[category] || AP_PRACTICE_TESTS["AP Biology"];
  const units = subjectData.units;
  const allQuestions = subjectData.questions;

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(units[0] || null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(units[0]?.topics[0] || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set([units[0]?.id || "1"]));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedTopic(unit.topics[0] || null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (!expandedUnits.has(unit.id)) {
      toggleUnit(unit.id);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const filteredQuestions = allQuestions.filter(q => !selectedTopic || q.topicId === selectedTopic.id);
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    setShowExplanation(true);
    setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]));
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectAnswers(prev => new Set([...prev, currentQuestion.id]));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleDownloadPDF = () => {
    const pdfContent = filteredQuestions.map((q, idx) => 
      `Question ${idx + 1}:\n${q.passage ? q.passage + '\n\n' : ''}${q.text}\n${q.options.join('\n')}\n\nAnswer: ${q.options[q.correctAnswer]}\nExplanation: ${q.explanation}\n\n`
    ).join('');
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${category}_Practice_Test.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleAnswers = () => {
    setShowAllAnswers(!showAllAnswers);
  };

  const score = filteredQuestions.length > 0 
    ? Math.round((correctAnswers.size / Math.max(answeredQuestions.size, 1)) * 100) 
    : 0;

  return (
    <>
      <ContentRightSidebar />
      <div className="flex gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Left Sidebar - Units List */}
        <div className="w-56 bg-white rounded-lg overflow-y-auto flex-shrink-0" style={{ borderRight: '1px solid #e5e7eb' }}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[#00bcd4]">Practice Tests</h3>
          <p className="text-sm text-gray-500 mt-1">{category}</p>
        </div>

        <div className="p-2">
          {units.map((unit) => (
            <div key={unit.id} className="mb-1">
              <button
                onClick={() => handleUnitClick(unit)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedUnit?.id === unit.id
                    ? 'bg-[#e0f7fa] border border-[#00bcd4]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 font-semibold">{unit.name}</div>
                    <div className="text-gray-500 text-sm">
                      {unit.topicCount} Topics · {unit.questionCount} questions
                    </div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUnit(unit.id);
                    }}
                    className="ml-2 p-1 hover:bg-gray-200 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedUnits.has(unit.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Topics List */}
              {expandedUnits.has(unit.id) && (
                <div className="ml-2 mt-1 space-y-1 bg-[#f5f5f5] rounded-lg p-2">
                  {unit.topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center ${
                        selectedTopic?.id === topic.id
                          ? 'bg-white text-[#00bcd4] shadow-sm border border-[#00bcd4]'
                          : 'text-gray-700 hover:bg-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mr-2 flex-shrink-0 ${
                        selectedTopic?.id === topic.id ? 'border-[#00bcd4] bg-[#00bcd4]' : 'border-gray-300'
                      }`}>
                        {selectedTopic?.id === topic.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      <span>{topic.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

        {/* Right Content - Practice Test Interface */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
        {selectedUnit && selectedTopic && currentQuestion ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>AP</span>
                    <span>/</span>
                    <span>{category}</span>
                    <span>/</span>
                    <span>Practice Test</span>
                    <span>/</span>
                    <span>{selectedUnit.name}</span>
                  </div>
                  <h2 className="text-gray-800 mb-2 font-medium">
                    {selectedTopic.name}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDownloadPDF}
                    className="bg-[#00bcd4] hover:bg-[#00acc1] text-white"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    onClick={handleToggleAnswers}
                    variant="ghost" 
                    size="sm"
                    className={`${
                      showAllAnswers 
                        ? 'bg-[#e0f7fa] text-[#00bcd4]' 
                        : 'text-[#00bcd4]'
                    } hover:text-[#00acc1] hover:bg-[#e0f7fa]`}
                  >
                    {showAllAnswers ? 'Hide answers' : 'All answers'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 font-medium">
                      {currentQuestion.timeLimit ? `${currentQuestion.timeLimit}s per question` : 'No time limit'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <span className="text-sm text-gray-600">Score:</span>
                  <span className="font-semibold text-green-700">{score}%</span>
                  <span className="text-sm text-gray-500">
                    ({correctAnswers.size}/{answeredQuestions.size})
                  </span>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="p-6">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentQuestion.passage && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-[#00bcd4]">
                    <p className="text-gray-800 leading-relaxed text-base italic">
                      {currentQuestion.passage}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-4">
                    {currentQuestion.text}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQuestion.correctAnswer;
                    const showResult = showExplanation;

                    return (
                      <button
                        key={idx}
                        onClick={() => !showExplanation && handleAnswerSelect(idx)}
                        disabled={showExplanation}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          showResult
                            ? isCorrect
                              ? 'border-green-500 bg-green-50'
                              : isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                            : isSelected
                            ? 'border-[#00bcd4] bg-[#e0f7fa]'
                            : 'border-gray-200 hover:border-[#00bcd4] hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-medium">{option}</span>
                          {showResult && (
                            <div>
                              {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                              {!isCorrect && isSelected && <XCircle className="w-5 h-5 text-red-600" />}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-gray-800 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Footer Navigation */}
            <div className="border-t border-gray-200 p-4 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {!showExplanation && selectedAnswer !== null && (
                  <Button
                    className="bg-[#00bcd4] hover:bg-[#00acc1] text-white"
                    onClick={handleSubmitAnswer}
                  >
                    Submit Answer
                  </Button>
                )}
                
                {showExplanation && currentQuestionIndex < filteredQuestions.length - 1 && (
                  <Button
                    className="bg-[#00bcd4] hover:bg-[#00acc1] text-white"
                    onClick={handleNextQuestion}
                  >
                    Next Question
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <img src={practiceTestImage} alt="Practice Test" className="w-64 h-auto mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a unit and topic from the left to start practicing</p>
              <p className="text-sm text-gray-400">{category}</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getSubjectStructure, getCategoryCustomName } from "./utils/dataManager";

interface SidebarProps {
  selectedSubject: string;
  selectedCategory: string;
  selectedSubCategory?: string;
  onCategoryChange: (category: string) => void;
  onSubCategoryChange?: (subCategory: string) => void;
  schoolType: 'korean' | 'international' | null;
  isCertificationMode?: boolean;
}

export function Sidebar({ selectedSubject, selectedCategory, selectedSubCategory, onCategoryChange, onSubCategoryChange, schoolType, isCertificationMode }: SidebarProps) {
  // 확장된 카테고리를 추적하는 state
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  // 중첩된 서브카테고리 확장 상태를 추적하는 state (SAT Reading 등)
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);
  // 카테고리 커스텀 이름 캐시
  const [customNames, setCustomNames] = useState<Record<string, string>>({});

  // Load custom names for categories
  useEffect(() => {
    if (!schoolType || isCertificationMode) return;
    
    const subjectStructure = getSubjectStructure(schoolType);
    const categories = subjectStructure[selectedSubject] || {};
    
    const loadCustomNames = async () => {
      const names: Record<string, string> = {};
      for (const [levelName, items] of Object.entries(categories)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            const key = `${levelName}::${item}`;
            names[key] = await getCategoryCustomName(schoolType, selectedSubject, levelName, item);
          }
        }
      }
      setCustomNames(names);
    };
    
    loadCustomNames();
  }, [schoolType, selectedSubject, isCertificationMode]);
  
  if (!schoolType && !isCertificationMode) {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-5 lg:p-6 w-full h-fit">
        <p className="text-gray-500 text-center">학교 타입을 선택해주세요.</p>
      </div>
    );
  }

  // Define certification test categories
  const certificationCategories = {
    "TOEFL": {
      "Reading": [
        "Complete Words",
        "Read in Daily Life",
        "Read an Academic Passage"
      ],
      "Listening": [
        "Listen and Response",
        "Short Conversation",
        "Announcements",
        "Academic Talk"
      ],
      "Speaking": [
        "Listen and Repeat",
        "Take an Interview"
      ],
      "Writing": [
        "Build a Sentence",
        "Write an Email",
        "Academic Discussion"
      ]
    },
    "SAT": {
      "Math": {
        "Algebra": [
          "Linear equations in one variable",
          "Linear equations in two variables",
          "Linear functions",
          "Systems of two linear equations in two variables",
          "Linear inequalities in one or two variables"
        ],
        "Advanced Math": [
          "Equivalent expressions",
          "Nonlinear equations in one variable and systems of equations in two variables",
          "Nonlinear functions"
        ],
        "Problem-Solving and Data Analysis": [
          "Ratios, rates, proportional relationships, and units",
          "Percentages",
          "One-variable data: distributions and measures of center and spread",
          "Two-variable data: models and scatterplots",
          "Probability and conditional probability",
          "Inference from sample statistics and margin of error",
          "Evaluating statistical claims: observational studies and experiments"
        ],
        "Geometry and Trigonometry": [
          "Area and volume",
          "Lines, angles, and triangles",
          "Right triangles and trigonometry",
          "Circles"
        ]
      },
      "Reading": {
        "Information and Ideas": [
          "Central Ideas and Details",
          "Command of Evidence (Textual)",
          "Command of Evidence (Quantitative)",
          "Inferences"
        ],
        "Craft and Structure": [
          "Words in Context",
          "Text Structure and Purpose",
          "Cross-Text Connections"
        ],
        "Expression of Ideas": [
          "Rhetorical Synthesis",
          "Transitions"
        ],
        "Standard English Conventions": [
          "Boundaries",
          "Form, Structure, and Sense"
        ]
      },
      "Writing": {
        "Expression of Ideas": [
          "Rhetorical Synthesis",
          "Transitions"
        ],
        "Standard English Conventions": [
          "Boundaries",
          "Form, Structure, and Sense"
        ]
      }
    },
    "ACT": {
      "English": [
        "Usage & Mechanics",
        "Rhetorical Skills", 
        "Grammar Rules",
        "Punctuation",
        "Style & Tone"
      ],
      "Math": [
        "Pre-Algebra",
        "Elementary Algebra", 
        "Intermediate Algebra",
        "Coordinate Geometry",
        "Plane Geometry"
      ],
      "Reading": [
        "Prose Fiction",
        "Social Science", 
        "Humanities",
        "Natural Science",
        "Reading Strategies"
      ],
      "Science": [
        "Data Interpretation",
        "Research Summaries", 
        "Conflicting Viewpoints",
        "Scientific Reasoning",
        "Charts & Graphs"
      ]
    },
    "IELTS": {
      "Listening": [
        "General Training",
        "Academic Context", 
        "Note Completion",
        "Multiple Choice",
        "Map Labeling"
      ],
      "Reading": [
        "Academic Passages",
        "General Training", 
        "Skimming & Scanning",
        "True/False/Not Given",
        "Matching Headings"
      ],
      "Writing": [
        "Task 1 Reports",
        "Task 2 Essays", 
        "Graph Description",
        "Argument Essays",
        "Academic Writing"
      ],
      "Speaking": [
        "Part 1 Interview",
        "Part 2 Presentation", 
        "Part 3 Discussion",
        "Fluency & Coherence",
        "Pronunciation"
      ]
    },
    "TOEIC": {
      "Listening": [
        "Photographs",
        "Question-Response",
        "Conversations",
        "Short Talks",
        "Listening Strategies"
      ],
      "Reading": [
        "Incomplete Sentences",
        "Text Completion",
        "Reading Comprehension",
        "Business Documents",
        "Grammar & Vocabulary"
      ],
      "Speaking": [
        "Read a Text Aloud",
        "Describe a Picture",
        "Respond to Questions",
        "Propose a Solution",
        "Express an Opinion"
      ],
      "Writing": [
        "Write a Sentence",
        "Respond to Request",
        "Write an Opinion Essay",
        "Business Email",
        "Formal Writing"
      ]
    }
  };

  const subjectStructure = isCertificationMode ? certificationCategories : getSubjectStructure(schoolType);
  const categories = subjectStructure[selectedSubject] || {};

  return (
    <motion.div
      key={selectedSubject}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg p-3 sm:p-4 lg:p-5 w-full h-fit"
    >
      <h2 className="text-sm sm:text-base lg:text-lg text-gray-800 mb-3 sm:mb-4 lg:mb-5 font-medium">{selectedSubject}</h2>
      
      <div className="space-y-3 sm:space-y-4 lg:space-y-5">
        {isCertificationMode ? (
          // Certification mode with subcategories
          Object.entries(categories).map(([categoryName, subItems]) => {
            // Check if subItems is an object (nested structure like SAT Reading) or array
            const isNestedStructure = subItems && typeof subItems === 'object' && !Array.isArray(subItems);
            const hasSubItems = Array.isArray(subItems) ? subItems.length > 0 : Object.keys(subItems).length > 0;
            
            return (
              <div key={categoryName}>
                <motion.div
                  onClick={() => {
                    // 카테고리 선택
                    onCategoryChange(categoryName);
                    // 확장/축소 토글
                    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`cursor-pointer transition-all duration-200 mb-2 sm:mb-3 lg:mb-4 pb-1.5 sm:pb-2 lg:pb-3 border-b border-gray-200 flex items-center justify-between ${
                    selectedCategory === categoryName 
                      ? "text-cyan-600 font-semibold text-sm sm:text-base lg:text-lg"
                      : "text-gray-800 hover:text-cyan-600 font-medium text-sm sm:text-base lg:text-lg"
                  }`}
                >
                  <span>{categoryName}</span>
                  {hasSubItems && (
                    <motion.div
                      animate={{ rotate: expandedCategory === categoryName ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                  )}
                </motion.div>
                
                {expandedCategory === categoryName && hasSubItems && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="pl-3 space-y-2"
                  >
                    {isNestedStructure ? (
                      // Nested structure (e.g., SAT Reading)
                      Object.entries(subItems).map(([subCategoryName, subCategoryItems]) => (
                        <div key={subCategoryName} className="mb-3">
                          <motion.div
                            onClick={() => {
                              setExpandedSubCategory(expandedSubCategory === subCategoryName ? null : subCategoryName);
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="cursor-pointer text-gray-800 hover:text-gray-900 font-medium text-sm flex items-center justify-between mb-2"
                          >
                            <span>{subCategoryName}</span>
                            <motion.div
                              animate={{ rotate: expandedSubCategory === subCategoryName ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-2"
                            >
                              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </motion.div>
                          </motion.div>
                          
                          {expandedSubCategory === subCategoryName && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                              className="space-y-1.5 pl-3"
                            >
                              {subCategoryItems.map((item) => (
                                <motion.div
                                  key={item}
                                  onClick={() => onSubCategoryChange && onSubCategoryChange(item)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`cursor-pointer transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg ${
                                    selectedSubCategory === item 
                                      ? "bg-cyan-100 text-cyan-800 font-medium border-l-4 border-cyan-600"
                                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                  }`}
                                >
                                  {item}
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      ))
                    ) : (
                      // Simple array structure (e.g., TOEFL)
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 sm:gap-2 lg:space-y-1.5 lg:space-x-0 text-xs sm:text-sm">
                        {(subItems as string[]).map((subItem) => (
                          <motion.div
                            key={subItem}
                            onClick={() => onSubCategoryChange && onSubCategoryChange(subItem)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`cursor-pointer transition-all duration-200 text-center sm:text-left lg:text-left min-h-7 sm:min-h-8 flex items-center justify-center sm:justify-start lg:justify-start ${
                              selectedSubCategory === subItem 
                                ? "bg-cyan-100 text-cyan-800 px-2 sm:px-3 py-1.5 sm:py-1.5 rounded-lg shadow-sm inline-block w-full font-medium border-l-4 border-cyan-600"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-1.5 rounded-lg"
                            }`}
                          >
                            {subItem}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })
        ) : (
          // Regular mode
          Object.entries(categories).map(([levelName, items]) => (
            <div key={levelName}>
              <motion.div
                onClick={() => {
                  setExpandedCategory(expandedCategory === levelName ? null : levelName);
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="cursor-pointer text-sm sm:text-base lg:text-lg text-gray-800 hover:text-cyan-600 mb-2 sm:mb-3 lg:mb-4 pb-1.5 sm:pb-2 lg:pb-3 border-b border-gray-200 font-medium flex items-center justify-between transition-colors duration-200"
              >
                <span>{levelName}</span>
                <motion.div
                  animate={{ rotate: expandedCategory === levelName ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              </motion.div>
              
              {expandedCategory === levelName && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 sm:gap-2 lg:space-y-1.5 lg:space-x-0 text-xs sm:text-sm"
                >
                  {(items as string[]).map((item) => {
                    const key = `${levelName}::${item}`;
                    const customName = customNames[key] || item;
                    return (
                      <motion.div
                        key={item}
                        onClick={() => onCategoryChange(item)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`cursor-pointer transition-all duration-200 text-center sm:text-left lg:text-left min-h-8 sm:min-h-10 flex items-center justify-center sm:justify-start lg:justify-start ${
                          selectedCategory === item 
                            ? "bg-cyan-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-md inline-block w-full font-medium"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
                        }`}
                      >
                        {customName}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
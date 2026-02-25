import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { ChevronDown, Download, User, CheckCircle2 } from "lucide-react";
import studyGuideImage from "figma:asset/2246e352f001976861139bec64e54ec669b3e4ec.png";
import { ContentRightSidebar } from "./ContentRightSidebar";

interface Topic {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
  topicCount: number;
  studyGuideCount: number;
  topics: Topic[];
}

interface StudyGuide {
  title: string;
  author: string;
  reviewer: string;
  lastUpdated: string;
  sections: {
    heading: string;
    content: string[];
  }[];
}

interface KeyNotesViewerProps {
  subject: string;
  category: string;
}

// AP Subject Study Guide Data
const AP_STUDY_GUIDES: Record<string, { units: Unit[], studyGuides: Record<string, StudyGuide> }> = {
  "AP Biology": {
    units: [
      {
        id: "1",
        name: "Biological Molecules",
        topicCount: 6,
        studyGuideCount: 6,
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
        studyGuideCount: 7,
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
        studyGuideCount: 5,
        topics: [
          { id: "3-1", name: "Photosynthesis: Light Reactions" },
          { id: "3-2", name: "Photosynthesis: Calvin Cycle" },
          { id: "3-3", name: "Cellular Respiration: Glycolysis" },
          { id: "3-4", name: "Cellular Respiration: Krebs Cycle" },
          { id: "3-5", name: "Electron Transport Chain" }
        ]
      }
    ],
    studyGuides: {
      "1-1": {
        title: "Structure & Properties of Carbohydrates",
        author: "Dr. Sarah Johnson",
        reviewer: "Prof. Michael Chen",
        lastUpdated: "15 January 2025",
        sections: [
          {
            heading: "Monosaccharides: The Building Blocks",
            content: [
              "Monosaccharides are simple sugars that cannot be hydrolyzed into simpler compounds",
              "Common examples include glucose (C₆H₁₂O₆), fructose, and galactose",
              "General formula: (CH₂O)n where n is typically 3-7",
              "Contain carbonyl group (C=O) and multiple hydroxyl groups (-OH)"
            ]
          },
          {
            heading: "Disaccharides & Glycosidic Bonds",
            content: [
              "Formed when two monosaccharides join via dehydration synthesis (condensation reaction)",
              "A glycosidic bond forms between the hydroxyl groups, releasing water (H₂O)",
              "Maltose = glucose + glucose (α-1,4-glycosidic bond)",
              "Sucrose = glucose + fructose (α-1,2-glycosidic bond)",
              "Lactose = glucose + galactose (β-1,4-glycosidic bond)"
            ]
          },
          {
            heading: "Polysaccharides: Complex Carbohydrates",
            content: [
              "Polymers of many monosaccharide units joined by glycosidic bonds",
              "**Starch**: Plant energy storage; composed of amylose (unbranched α-glucose chain) and amylopectin (branched α-glucose)",
              "**Glycogen**: Animal energy storage; highly branched α-glucose polymer stored in liver and muscles",
              "**Cellulose**: Plant structural support; linear β-glucose chains with extensive hydrogen bonding",
              "Humans cannot digest cellulose due to lack of cellulase enzyme to break β-1,4-glycosidic bonds"
            ]
          },
          {
            heading: "Key Functions of Carbohydrates",
            content: [
              "**Energy source**: Glucose is the primary fuel for cellular respiration",
              "**Energy storage**: Starch (plants) and glycogen (animals)",
              "**Structural support**: Cellulose in plant cell walls, chitin in arthropod exoskeletons",
              "**Cell recognition**: Glycoproteins and glycolipids on cell membranes"
            ]
          }
        ]
      },
      "1-6": {
        title: "Structure & Properties of Water",
        author: "Naomi Holzbook",
        reviewer: "Lara Marie McIvor",
        lastUpdated: "2 October 2025",
        sections: [
          {
            heading: "Polarity & hydrogen bonding in water",
            content: [
              "The properties of water allow it to sustain living systems; these essential properties include its:",
              "  ◦ polarity",
              "  ◦ high specific heat capacity",
              "  ◦ high heat of vaporization"
            ]
          },
          {
            heading: "Polarity",
            content: [
              "Water molecules contain an oxygen atom that is **covalently bonded** to two hydrogen atoms",
              "The electrons in these covalent bonds are shared unequally between oxygen and hydrogen; the oxygen atom has a **partial negative charge** (δ⁻) and the hydrogen atoms have a **partial positive charge** (δ⁺)",
              "The unequal distribution of charge means that water is a **polar** molecule",
              "The polar nature of water allows weak forces of attraction known as **hydrogen bonds** to form between water molecules, and this is why water can exist in liquid form at room temperature"
            ]
          },
          {
            heading: "High Specific Heat Capacity",
            content: [
              "Water has a high specific heat capacity, meaning it takes a lot of energy to raise its temperature",
              "This is because much of the heat energy is used to break hydrogen bonds between water molecules",
              "This property helps organisms maintain stable internal temperatures",
              "Aquatic environments have relatively stable temperatures, protecting organisms from rapid temperature changes"
            ]
          },
          {
            heading: "High Heat of Vaporization",
            content: [
              "Water has a high heat of vaporization - it requires significant energy to convert liquid water to vapor",
              "This is due to the many hydrogen bonds that must be broken",
              "Evaporative cooling is important for temperature regulation in organisms",
              "Sweating in mammals and transpiration in plants use this principle"
            ]
          },
          {
            heading: "Cohesion and Adhesion",
            content: [
              "**Cohesion**: water molecules stick to each other due to hydrogen bonding",
              "Allows water to be transported in continuous columns (e.g., xylem in plants)",
              "Creates surface tension, allowing some organisms to walk on water",
              "**Adhesion**: water molecules stick to other polar surfaces",
              "Combined with cohesion, enables capillary action in narrow tubes"
            ]
          },
          {
            heading: "Water as a Solvent",
            content: [
              "Water is an excellent solvent for polar and ionic substances",
              "The partial charges on water molecules attract and surround ions and polar molecules",
              "This allows metabolic reactions to occur in solution within cells",
              "Enables transport of dissolved substances in blood and xylem/phloem"
            ]
          }
        ]
      },
      "2-1": {
        title: "Prokaryotic Cell Structure",
        author: "Dr. James Wilson",
        reviewer: "Dr. Emily Rodriguez",
        lastUpdated: "20 December 2024",
        sections: [
          {
            heading: "Overview of Prokaryotic Cells",
            content: [
              "Prokaryotic cells are simple cells lacking membrane-bound organelles",
              "Found in bacteria and archaea domains",
              "Typically 0.1-5.0 μm in diameter (much smaller than eukaryotic cells)",
              "Have a nucleoid region containing circular DNA rather than a true nucleus"
            ]
          },
          {
            heading: "Key Structures",
            content: [
              "**Cell Wall**: rigid structure made of peptidoglycan (in bacteria); provides shape and protection",
              "**Plasma Membrane**: phospholipid bilayer controlling substance entry/exit",
              "**Cytoplasm**: gel-like substance where metabolic reactions occur",
              "**Ribosomes**: 70S ribosomes for protein synthesis (smaller than eukaryotic 80S)",
              "**Nucleoid**: region containing circular chromosome (not membrane-bound)",
              "**Plasmids**: small circular DNA molecules carrying additional genes"
            ]
          },
          {
            heading: "Additional Features",
            content: [
              "**Capsule**: protective layer outside cell wall in some bacteria",
              "**Flagella**: whip-like structures for locomotion",
              "**Pili**: hair-like projections for attachment and DNA transfer",
              "**Fimbriae**: shorter, more numerous projections for attachment to surfaces"
            ]
          }
        ]
      },
      "3-2": {
        title: "The Calvin Cycle",
        author: "Dr. Patricia Lee",
        reviewer: "Prof. David Martinez",
        lastUpdated: "8 January 2025",
        sections: [
          {
            heading: "Overview of the Calvin Cycle",
            content: [
              "The Calvin Cycle is the light-independent stage of photosynthesis",
              "Also known as the dark reactions (though it occurs during the day)",
              "Takes place in the stroma of chloroplasts",
              "Uses ATP and NADPH from light-dependent reactions to fix CO₂ into glucose"
            ]
          },
          {
            heading: "Three Stages of the Calvin Cycle",
            content: [
              "**1. Carbon Fixation**:",
              "  • CO₂ combines with ribulose bisphosphate (RuBP), a 5-carbon sugar",
              "  • Catalyzed by the enzyme RuBisCO (ribulose bisphosphate carboxylase)",
              "  • Forms an unstable 6-carbon compound that immediately splits into two 3-carbon molecules (3-phosphoglycerate, 3-PGA)",
              "",
              "**2. Reduction**:",
              "  • 3-PGA is phosphorylated by ATP to form 1,3-bisphosphoglycerate",
              "  • Then reduced by NADPH to form glyceraldehyde-3-phosphate (G3P)",
              "  • Some G3P molecules exit the cycle to form glucose",
              "",
              "**3. Regeneration of RuBP**:",
              "  • Remaining G3P molecules are rearranged using ATP",
              "  • Regenerates RuBP to continue the cycle",
              "  • Requires 3 ATP per RuBP regenerated"
            ]
          },
          {
            heading: "Overall Equation",
            content: [
              "3 CO₂ + 6 NADPH + 9 ATP → G3P + 6 NADP⁺ + 9 ADP + 8 Pi",
              "For one glucose molecule (6 carbons), the cycle must turn 6 times:",
              "6 CO₂ + 12 NADPH + 18 ATP → C₆H₁₂O₆ + 12 NADP⁺ + 18 ADP + 16 Pi"
            ]
          },
          {
            heading: "Importance of RuBisCO",
            content: [
              "RuBisCO is the most abundant protein on Earth",
              "It is relatively slow and inefficient",
              "Can catalyze both carboxylase (CO₂ fixation) and oxygenase (photorespiration) reactions",
              "Plants produce large amounts to compensate for its low efficiency"
            ]
          }
        ]
      }
    }
  }
};

// Generate study guides for other AP subjects (using similar structure)
const generateDefaultStudyGuides = (category: string): { units: Unit[], studyGuides: Record<string, StudyGuide> } => {
  return {
    units: [
      {
        id: "1",
        name: "Unit 1",
        topicCount: 5,
        studyGuideCount: 5,
        topics: Array.from({ length: 5 }, (_, i) => ({
          id: `1-${i + 1}`,
          name: `Topic ${i + 1}`
        }))
      }
    ],
    studyGuides: {
      "1-1": {
        title: `Introduction to ${category}`,
        author: "Study Guide Author",
        reviewer: "Content Reviewer",
        lastUpdated: "January 2025",
        sections: [
          {
            heading: "Key Concepts",
            content: [
              "This is a study guide for " + category,
              "Content would be added based on the specific subject",
              "Study guides provide comprehensive explanations and examples"
            ]
          }
        ]
      }
    }
  };
};

export function KeyNotesViewer({ subject, category }: KeyNotesViewerProps) {
  // Get subject data or use default
  const subjectData = AP_STUDY_GUIDES[category] || generateDefaultStudyGuides(category);
  const units = subjectData.units;
  const studyGuides = subjectData.studyGuides;

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(units[0] || null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(units[0]?.topics[0] || null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set([units[0]?.id || "1"]));
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
    // Auto-expand the unit when clicked
    if (!expandedUnits.has(unit.id)) {
      toggleUnit(unit.id);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  const handleDownloadPDF = () => {
    if (!currentStudyGuide) return;
    
    const pdfContent = `${currentStudyGuide.title}\n\nAuthor: ${currentStudyGuide.author}\nReviewer: ${currentStudyGuide.reviewer}\nLast Updated: ${currentStudyGuide.lastUpdated}\n\n${currentStudyGuide.sections.map(section => `${section.heading}\n${section.content.join('\n')}`).join('\n\n')}`;
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${category}_Study_Guide.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleAnswers = () => {
    setShowAllAnswers(!showAllAnswers);
  };

  const currentStudyGuide = selectedTopic ? studyGuides[selectedTopic.id] : null;

  return (
    <>
      <ContentRightSidebar />
      <div className="flex gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Left Sidebar - Units List */}
        <div className="w-56 bg-white rounded-lg overflow-y-auto flex-shrink-0" style={{ borderRight: '1px solid #e5e7eb' }}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[#00bcd4]">Study Guides</h3>
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
                      {unit.topicCount} Topics · {unit.studyGuideCount} Study Guides
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

        {/* Right Content - Study Guide Viewer */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
        {selectedUnit && selectedTopic && currentStudyGuide ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <span>Launchpad</span>
                <span>/</span>
                <span>{category}</span>
                <span>/</span>
                <span>Study Guides</span>
              </div>

              <h1 className="text-2xl mb-4">{currentStudyGuide.title}</h1>

              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={handleDownloadPDF}
                  className="bg-[#00bcd4] hover:bg-[#00acc1] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  onClick={handleToggleAnswers}
                  variant="ghost" 
                  className={`${
                    showAllAnswers 
                      ? 'bg-[#e0f7fa] text-[#00bcd4]' 
                      : 'text-[#00bcd4]'
                  } hover:text-[#00acc1] hover:bg-[#e0f7fa]`}
                >
                  {showAllAnswers ? 'Hide answers' : 'All answers'}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm">
                      <span className="text-gray-600">Written by: </span>
                      <span className="text-[#00bcd4]">{currentStudyGuide.author}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Reviewed by: </span>
                      <span className="text-[#00bcd4]">{currentStudyGuide.reviewer}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Updated on {currentStudyGuide.lastUpdated}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Guide Content */}
            <div className="p-6">
              <motion.div
                key={selectedTopic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl"
              >
                {currentStudyGuide.sections.map((section, idx) => (
                  <div key={idx} className="mb-8">
                    <h2 className="text-xl mb-4 text-gray-900 font-semibold">{section.heading}</h2>
                    <div className="space-y-3">
                      {section.content.map((paragraph, pIdx) => {
                        // Check if paragraph starts with bullet or special formatting
                        const isBullet = paragraph.trim().startsWith('•') || paragraph.trim().startsWith('◦');
                        const isSubBullet = paragraph.trim().startsWith('  •') || paragraph.trim().startsWith('  ◦');
                        const isBold = paragraph.includes('**');
                        
                        // Process bold text
                        let displayText = paragraph;
                        if (isBold) {
                          const parts = paragraph.split('**');
                          return (
                            <p key={pIdx} className={`text-gray-800 leading-relaxed text-base ${isSubBullet ? 'ml-6' : isBullet ? 'ml-3' : ''}`}>
                              {parts.map((part, i) => 
                                i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
                              )}
                            </p>
                          );
                        }
                        
                        return (
                          <p key={pIdx} className={`text-gray-800 leading-relaxed text-base ${isSubBullet ? 'ml-6' : isBullet ? 'ml-3' : ''}`}>
                            {displayText}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Bottom Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-[#00bcd4] mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Mark as complete</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Continue studying with practice questions and flashcards
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <img src={studyGuideImage} alt="Study Guides" className="w-96 h-auto mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a unit and topic from the left to view study guides</p>
              <p className="text-sm text-gray-400">{category}</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
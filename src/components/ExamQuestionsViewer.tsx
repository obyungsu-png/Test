import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ChevronDown, Download, CheckCircle2, XCircle } from "lucide-react";
import examImage from "figma:asset/ad37c91a48a6644d1d76af2aa34dc7a88ca9fddb.png";
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
  options: string[];
  correctAnswer?: number; // Index of the correct answer (0-based)
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicId?: string;
}

interface ExamQuestionsViewerProps {
  subject: string;
  category: string;
}

// AP Subject Data with Topics
const AP_SUBJECT_DATA: Record<string, { units: Unit[], questions: Question[] }> = {
  "AP Calculus BC": {
    units: [
      { 
        id: "1", 
        name: "Limits and Continuity", 
        topicCount: 5, 
        questionCount: 85,
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
        questionCount: 120,
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
      },
      { 
        id: "3", 
        name: "Integration", 
        topicCount: 7, 
        questionCount: 110,
        topics: [
          { id: "3-1", name: "Antiderivatives" },
          { id: "3-2", name: "Definite Integrals" },
          { id: "3-3", name: "Fundamental Theorem" },
          { id: "3-4", name: "U-Substitution" },
          { id: "3-5", name: "Integration by Parts" },
          { id: "3-6", name: "Partial Fractions" },
          { id: "3-7", name: "Area Between Curves" }
        ]
      },
      { 
        id: "4", 
        name: "Parametric & Polar", 
        topicCount: 4, 
        questionCount: 75,
        topics: [
          { id: "4-1", name: "Parametric Equations" },
          { id: "4-2", name: "Parametric Calculus" },
          { id: "4-3", name: "Polar Coordinates" },
          { id: "4-4", name: "Polar Calculus" }
        ]
      },
      { 
        id: "5", 
        name: "Series and Sequences", 
        topicCount: 6, 
        questionCount: 95,
        topics: [
          { id: "5-1", name: "Sequences" },
          { id: "5-2", name: "Series: Introduction" },
          { id: "5-3", name: "Convergence Tests" },
          { id: "5-4", name: "Power Series" },
          { id: "5-5", name: "Taylor Series" },
          { id: "5-6", name: "Series Applications" }
        ]
      }
    ],
    questions: [
      { id: 1, text: "Find the limit:\nlim(x→0) (sin(3x)/x)", options: ["A) 0", "B) 1", "C) 3", "D) undefined"], marks: 2, difficulty: 'Easy', topicId: "1-2" },
      { id: 2, text: "Find dy/dx if y = x³ + 2x² - 5x + 7", options: ["A) 3x² + 4x - 5", "B) 3x² + 2x - 5", "C) x³ + 4x - 5", "D) 3x² + 4x"], marks: 2, difficulty: 'Easy', topicId: "2-2" },
      { id: 3, text: "Evaluate the integral:\n∫(2x³ - 4x + 1)dx", options: [], marks: 3, difficulty: 'Medium', topicId: "3-1" },
      { id: 1, text: "Find the derivative of f(x) = e^(x²) using the chain rule.", options: [], marks: 3, difficulty: 'Medium', topicId: "2-4" },
      { id: 2, text: "Determine the convergence of the series:\n∑(n=1 to ∞) 1/n²", options: ["A) Converges to π²/6", "B) Diverges", "C) Conditionally converges", "D) Cannot determine"], marks: 4, difficulty: 'Medium', topicId: "5-3" },
      { id: 1, text: "Use Taylor series to approximate sin(x) near x = 0 up to the 5th degree term. Then use this to estimate sin(0.1).", options: [], marks: 6, difficulty: 'Hard', topicId: "5-5" },
      { id: 2, text: "Find the area enclosed by the polar curve r = 2 + 2cos(θ) for 0 ≤ θ ≤ 2π", options: [], marks: 5, difficulty: 'Hard', topicId: "4-4" }
    ]
  },
  "AP Biology": {
    units: [
      { 
        id: "1", 
        name: "Biological Molecules", 
        topicCount: 6, 
        questionCount: 90,
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
        questionCount: 95,
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
        questionCount: 80,
        topics: [
          { id: "3-1", name: "Photosynthesis: Light Reactions" },
          { id: "3-2", name: "Photosynthesis: Calvin Cycle" },
          { id: "3-3", name: "Cellular Respiration: Glycolysis" },
          { id: "3-4", name: "Cellular Respiration: Krebs Cycle" },
          { id: "3-5", name: "Electron Transport Chain" }
        ]
      },
      { 
        id: "4", 
        name: "Cell Communication", 
        topicCount: 4, 
        questionCount: 70,
        topics: [
          { id: "4-1", name: "Signal Transduction" },
          { id: "4-2", name: "Cell Signaling Pathways" },
          { id: "4-3", name: "Feedback Mechanisms" },
          { id: "4-4", name: "Cell Communication in Immunity" }
        ]
      },
      { 
        id: "5", 
        name: "Genetics & Heredity", 
        topicCount: 8, 
        questionCount: 110,
        topics: [
          { id: "5-1", name: "Mendelian Genetics" },
          { id: "5-2", name: "Non-Mendelian Inheritance" },
          { id: "5-3", name: "DNA Replication" },
          { id: "5-4", name: "Chromosome Structure" },
          { id: "5-5", name: "Genetic Variation" },
          { id: "5-6", name: "Genetic Disorders" },
          { id: "5-7", name: "Population Genetics" },
          { id: "5-8", name: "Hardy-Weinberg Equilibrium" }
        ]
      },
      { 
        id: "6", 
        name: "Gene Expression", 
        topicCount: 6, 
        questionCount: 85,
        topics: [
          { id: "6-1", name: "Transcription" },
          { id: "6-2", name: "RNA Processing" },
          { id: "6-3", name: "Translation" },
          { id: "6-4", name: "Gene Regulation" },
          { id: "6-5", name: "Mutations" },
          { id: "6-6", name: "Biotechnology" }
        ]
      },
      { 
        id: "7", 
        name: "Evolution & Natural Selection", 
        topicCount: 7, 
        questionCount: 100,
        topics: [
          { id: "7-1", name: "Evidence for Evolution" },
          { id: "7-2", name: "Natural Selection" },
          { id: "7-3", name: "Speciation" },
          { id: "7-4", name: "Phylogenetic Trees" },
          { id: "7-5", name: "Origin of Life" },
          { id: "7-6", name: "Coevolution" },
          { id: "7-7", name: "Extinction Events" }
        ]
      },
      { 
        id: "8", 
        name: "Ecology", 
        topicCount: 6, 
        questionCount: 90,
        topics: [
          { id: "8-1", name: "Population Ecology" },
          { id: "8-2", name: "Community Ecology" },
          { id: "8-3", name: "Energy Flow in Ecosystems" },
          { id: "8-4", name: "Biogeochemical Cycles" },
          { id: "8-5", name: "Biodiversity" },
          { id: "8-6", name: "Human Impact on Environment" }
        ]
      }
    ],
    questions: [
      { id: 1, text: "Name the monomer present in:\n(i) Cellulose\n(ii) Starch", options: [], marks: 2, difficulty: 'Easy', topicId: "1-1" },
      { id: 2, text: "Which organelle is responsible for ATP production?", options: ["A) Nucleus", "B) Mitochondria", "C) Ribosome", "D) Golgi apparatus"], correctAnswer: 1, marks: 1, difficulty: 'Easy', topicId: "2-5" },
      { id: 3, text: "What is the primary function of the Calvin Cycle?", options: ["A) ATP synthesis", "B) CO₂ fixation", "C) Water splitting", "D) Oxygen production"], correctAnswer: 1, marks: 1, difficulty: 'Easy', topicId: "3-2" },
      { id: 1, text: "Describe the structure of cellulose and explain how it relates to its function in plant cell walls.", options: [], marks: 4, difficulty: 'Medium', topicId: "1-1" },
      { id: 2, text: "Explain how the sodium-potassium pump maintains the resting potential of a neuron.", options: [], marks: 4, difficulty: 'Medium', topicId: "2-4" },
      { id: 1, text: "Compare and contrast the processes of photosynthesis and cellular respiration. Include the role of electron transport chains in both processes.", options: [], marks: 6, difficulty: 'Hard', topicId: "3-5" },
      { id: 2, text: "Explain how natural selection leads to evolution. Use specific examples and discuss genetic drift, gene flow, and mutation.", options: [], marks: 6, difficulty: 'Hard', topicId: "7-2" }
    ]
  },
  "AP Chemistry": {
    units: [
      { 
        id: "1", 
        name: "Atomic Structure & Properties", 
        topicCount: 6, 
        questionCount: 85,
        topics: [
          { id: "1-1", name: "Moles and Molar Mass" },
          { id: "1-2", name: "Mass Spectroscopy" },
          { id: "1-3", name: "Electron Configuration" },
          { id: "1-4", name: "Photoelectron Spectroscopy" },
          { id: "1-5", name: "Periodic Trends" },
          { id: "1-6", name: "Valence Electrons" }
        ]
      },
      { 
        id: "2", 
        name: "Molecular & Ionic Bonding", 
        topicCount: 7, 
        questionCount: 95,
        topics: [
          { id: "2-1", name: "Types of Chemical Bonds" },
          { id: "2-2", name: "Intramolecular Forces" },
          { id: "2-3", name: "Lewis Diagrams" },
          { id: "2-4", name: "Resonance and Formal Charge" },
          { id: "2-5", name: "VSEPR and Hybridization" },
          { id: "2-6", name: "Bond Energy and Strength" },
          { id: "2-7", name: "Molecular Polarity" }
        ]
      },
      { 
        id: "3", 
        name: "Intermolecular Forces", 
        topicCount: 5, 
        questionCount: 75,
        topics: [
          { id: "3-1", name: "London Dispersion Forces" },
          { id: "3-2", name: "Dipole-Dipole Interactions" },
          { id: "3-3", name: "Hydrogen Bonding" },
          { id: "3-4", name: "Properties of Solids" },
          { id: "3-5", name: "Properties of Liquids" }
        ]
      },
      { 
        id: "4", 
        name: "Chemical Reactions", 
        topicCount: 6, 
        questionCount: 90,
        topics: [
          { id: "4-1", name: "Chemical Equations" },
          { id: "4-2", name: "Net Ionic Equations" },
          { id: "4-3", name: "Stoichiometry" },
          { id: "4-4", name: "Types of Reactions" },
          { id: "4-5", name: "Oxidation-Reduction" },
          { id: "4-6", name: "Limiting Reactants" }
        ]
      },
      { 
        id: "5", 
        name: "Kinetics", 
        topicCount: 5, 
        questionCount: 80,
        topics: [
          { id: "5-1", name: "Reaction Rates" },
          { id: "5-2", name: "Rate Laws" },
          { id: "5-3", name: "Concentration Changes" },
          { id: "5-4", name: "Reaction Mechanisms" },
          { id: "5-5", name: "Catalysis" }
        ]
      },
      { 
        id: "6", 
        name: "Thermodynamics", 
        topicCount: 6, 
        questionCount: 85,
        topics: [
          { id: "6-1", name: "Enthalpy" },
          { id: "6-2", name: "Entropy" },
          { id: "6-3", name: "Gibbs Free Energy" },
          { id: "6-4", name: "Heat Capacity" },
          { id: "6-5", name: "Hess's Law" },
          { id: "6-6", name: "Phase Diagrams" }
        ]
      },
      { 
        id: "7", 
        name: "Equilibrium", 
        topicCount: 6, 
        questionCount: 88,
        topics: [
          { id: "7-1", name: "Equilibrium Constant" },
          { id: "7-2", name: "Le Chatelier's Principle" },
          { id: "7-3", name: "ICE Tables" },
          { id: "7-4", name: "Solubility Equilibrium" },
          { id: "7-5", name: "Common Ion Effect" },
          { id: "7-6", name: "pH and pOH" }
        ]
      },
      { 
        id: "8", 
        name: "Acids and Bases", 
        topicCount: 5, 
        questionCount: 82,
        topics: [
          { id: "8-1", name: "pH and Calculations" },
          { id: "8-2", name: "Weak Acids and Bases" },
          { id: "8-3", name: "Buffer Solutions" },
          { id: "8-4", name: "Titrations" },
          { id: "8-5", name: "Polyprotic Acids" }
        ]
      },
      { 
        id: "9", 
        name: "Electrochemistry", 
        topicCount: 4, 
        questionCount: 70,
        topics: [
          { id: "9-1", name: "Galvanic Cells" },
          { id: "9-2", name: "Electrolytic Cells" },
          { id: "9-3", name: "Cell Potential" },
          { id: "9-4", name: "Electrolysis" }
        ]
      }
    ],
    questions: [
      { id: 1, text: "What is the electron configuration of oxygen (O)?", options: ["A) 1s² 2s² 2p⁴", "B) 1s² 2s² 2p⁶", "C) 1s² 2s² 2p²", "D) 1s² 2s² 2p⁵"], correctAnswer: 0, marks: 1, difficulty: 'Easy', topicId: "1-3" },
      { id: 2, text: "Balance the equation: C₃H₈ + O₂ → CO₂ + H₂O", options: [], marks: 2, difficulty: 'Easy', topicId: "4-1" },
      { id: 1, text: "Calculate the pH of a 0.1 M solution of HCl.", options: ["A) 1", "B) 2", "C) 7", "D) 13"], correctAnswer: 0, marks: 3, difficulty: 'Medium', topicId: "8-1" },
      { id: 2, text: "Using the ideal gas law, calculate the pressure of 2 moles of gas at 298K in a 10L container.", options: [], marks: 3, difficulty: 'Medium', topicId: "4-3" },
      { id: 1, text: "For the reaction A + B ⇌ C + D, the equilibrium constant Kc = 4.0 at 298K. If [A] = [B] = 1.0M initially, calculate the equilibrium concentrations of all species.", options: [], marks: 5, difficulty: 'Hard', topicId: "7-1" },
      { id: 2, text: "Explain the trend in atomic radius across period 3 (Na to Ar) using principles of effective nuclear charge and electron shielding.", options: [], marks: 4, difficulty: 'Hard', topicId: "1-5" }
    ]
  },
  "AP Physics 1": {
    units: [
      { id: "1", name: "Kinematics", topicCount: 5, questionCount: 75, topics: [
        { id: "1-1", name: "Position and Velocity" },
        { id: "1-2", name: "Acceleration" },
        { id: "1-3", name: "Free Fall" },
        { id: "1-4", name: "Projectile Motion" },
        { id: "1-5", name: "Motion Graphs" }
      ]},
      { id: "2", name: "Dynamics (Forces)", topicCount: 6, questionCount: 85, topics: [
        { id: "2-1", name: "Newton's Laws" },
        { id: "2-2", name: "Free Body Diagrams" },
        { id: "2-3", name: "Friction" },
        { id: "2-4", name: "Tension" },
        { id: "2-5", name: "Normal Force" },
        { id: "2-6", name: "Inclined Planes" }
      ]},
      { id: "3", name: "Circular Motion & Gravitation", topicCount: 4, questionCount: 65, topics: [
        { id: "3-1", name: "Centripetal Acceleration" },
        { id: "3-2", name: "Centripetal Force" },
        { id: "3-3", name: "Universal Gravitation" },
        { id: "3-4", name: "Orbital Motion" }
      ]},
      { id: "4", name: "Energy", topicCount: 5, questionCount: 70, topics: [
        { id: "4-1", name: "Work" },
        { id: "4-2", name: "Kinetic Energy" },
        { id: "4-3", name: "Potential Energy" },
        { id: "4-4", name: "Conservation of Energy" },
        { id: "4-5", name: "Power" }
      ]},
      { id: "5", name: "Momentum", topicCount: 4, questionCount: 68, topics: [
        { id: "5-1", name: "Linear Momentum" },
        { id: "5-2", name: "Impulse" },
        { id: "5-3", name: "Conservation of Momentum" },
        { id: "5-4", name: "Collisions" }
      ]},
      { id: "6", name: "Simple Harmonic Motion", topicCount: 3, questionCount: 55, topics: [
        { id: "6-1", name: "Springs and Hooke's Law" },
        { id: "6-2", name: "Pendulums" },
        { id: "6-3", name: "Energy in SHM" }
      ]},
      { id: "7", name: "Torque & Rotational Motion", topicCount: 5, questionCount: 72, topics: [
        { id: "7-1", name: "Torque" },
        { id: "7-2", name: "Rotational Kinematics" },
        { id: "7-3", name: "Moment of Inertia" },
        { id: "7-4", name: "Angular Momentum" },
        { id: "7-5", name: "Rolling Motion" }
      ]},
      { id: "8", name: "Waves & Sound", topicCount: 4, questionCount: 60, topics: [
        { id: "8-1", name: "Wave Properties" },
        { id: "8-2", name: "Wave Interference" },
        { id: "8-3", name: "Sound Waves" },
        { id: "8-4", name: "Doppler Effect" }
      ]}
    ],
    questions: [
      { id: 1, text: "A car accelerates from rest at 2 m/s². What is its velocity after 5 seconds?", options: ["A) 5 m/s", "B) 10 m/s", "C) 15 m/s", "D) 20 m/s"], marks: 2, difficulty: 'Easy', topicId: "1-2" },
      { id: 2, text: "What is the net force on a 10 kg object accelerating at 3 m/s²?", options: ["A) 3 N", "B) 13 N", "C) 30 N", "D) 300 N"], marks: 2, difficulty: 'Easy', topicId: "2-1" },
      { id: 1, text: "A 500g ball is thrown upward with an initial velocity of 20 m/s. Calculate the maximum height reached. (g = 10 m/s²)", options: [], marks: 3, difficulty: 'Medium', topicId: "1-3" },
      { id: 2, text: "Two blocks of mass 2kg and 3kg are connected by a string over a frictionless pulley. Find the acceleration of the system.", options: [], marks: 4, difficulty: 'Medium', topicId: "2-1" },
      { id: 1, text: "A uniform rod of length L and mass M is pivoted at one end. Derive an expression for the period of small oscillations.", options: [], marks: 5, difficulty: 'Hard', topicId: "7-4" },
      { id: 2, text: "Using conservation of energy and momentum, analyze a perfectly inelastic collision between two objects with masses m₁ and m₂.", options: [], marks: 6, difficulty: 'Hard', topicId: "5-4" }
    ]
  },
  // Add remaining subjects with similar structure...
  "AP Physics C": {
    units: [
      { id: "1", name: "Kinematics (Calculus-Based)", topicCount: 4, questionCount: 70, topics: [{ id: "1-1", name: "Position, Velocity, Acceleration" }, { id: "1-2", name: "Derivatives in Motion" }, { id: "1-3", name: "Integrals in Motion" }, { id: "1-4", name: "Differential Equations" }]},
      { id: "2", name: "Newton's Laws & Applications", topicCount: 6, questionCount: 90, topics: [{ id: "2-1", name: "Newton's Laws" }, { id: "2-2", name: "Forces with Calculus" }, { id: "2-3", name: "Drag Forces" }, { id: "2-4", name: "Terminal Velocity" }, { id: "2-5", name: "Variable Mass Systems" }, { id: "2-6", name: "Center of Mass" }]},
      { id: "3", name: "Work, Energy & Power", topicCount: 5, questionCount: 80, topics: [{ id: "3-1", name: "Work Integrals" }, { id: "3-2", name: "Conservative Forces" }, { id: "3-3", name: "Potential Energy Functions" }, { id: "3-4", name: "Energy Conservation" }, { id: "3-5", name: "Power" }]},
      { id: "4", name: "Linear Momentum", topicCount: 4, questionCount: 65, topics: [{ id: "4-1", name: "Impulse-Momentum" }, { id: "4-2", name: "Variable Force Impulse" }, { id: "4-3", name: "Momentum Conservation" }, { id: "4-4", name: "Collisions" }]},
      { id: "5", name: "Rotational Motion", topicCount: 6, questionCount: 85, topics: [{ id: "5-1", name: "Rotational Kinematics" }, { id: "5-2", name: "Moment of Inertia Calculus" }, { id: "5-3", name: "Torque" }, { id: "5-4", name: "Angular Momentum" }, { id: "5-5", name: "Rolling Motion" }, { id: "5-6", name: "Parallel Axis Theorem" }]},
      { id: "6", name: "Oscillations", topicCount: 4, questionCount: 60, topics: [{ id: "6-1", name: "Simple Harmonic Motion" }, { id: "6-2", name: "Differential Equations in SHM" }, { id: "6-3", name: "Damped Oscillations" }, { id: "6-4", name: "Driven Oscillations" }]},
      { id: "7", name: "Electrostatics", topicCount: 7, questionCount: 95, topics: [{ id: "7-1", name: "Electric Charge" }, { id: "7-2", name: "Coulomb's Law" }, { id: "7-3", name: "Electric Fields" }, { id: "7-4", name: "Gauss's Law" }, { id: "7-5", name: "Electric Potential" }, { id: "7-6", name: "Capacitance" }, { id: "7-7", name: "Dielectrics" }]},
      { id: "8", name: "Electric Circuits", topicCount: 6, questionCount: 88, topics: [{ id: "8-1", name: "Current and Resistance" }, { id: "8-2", name: "Ohm's Law" }, { id: "8-3", name: "Series and Parallel" }, { id: "8-4", name: "RC Circuits" }, { id: "8-5", name: "Kirchhoff's Rules" }, { id: "8-6", name: "Power in Circuits" }]},
      { id: "9", name: "Magnetism", topicCount: 5, questionCount: 75, topics: [{ id: "9-1", name: "Magnetic Fields" }, { id: "9-2", name: "Ampere's Law" }, { id: "9-3", name: "Faraday's Law" }, { id: "9-4", name: "Inductance" }, { id: "9-5", name: "Electromagnetic Waves" }]}
    ],
    questions: [
      { id: 1, text: "Given position x(t) = 3t² - 2t + 1, find the velocity at t = 2s.", options: ["A) 8 m/s", "B) 10 m/s", "C) 12 m/s", "D) 14 m/s"], marks: 2, difficulty: 'Easy', topicId: "1-2" },
      { id: 2, text: "What is Gauss's Law in integral form?", options: [], marks: 2, difficulty: 'Easy', topicId: "7-4" },
      { id: 1, text: "A sphere of radius R has uniform charge density ρ. Derive the electric field at distance r from the center (r < R).", options: [], marks: 4, difficulty: 'Medium', topicId: "7-4" },
      { id: 2, text: "Calculate the moment of inertia of a solid cylinder of mass M and radius R about its central axis.", options: [], marks: 3, difficulty: 'Medium', topicId: "5-2" },
      { id: 1, text: "Use Ampere's Law to derive the magnetic field inside and outside a long, straight current-carrying wire.", options: [], marks: 6, difficulty: 'Hard', topicId: "9-2" },
      { id: 2, text: "A particle moves in a central force field with F = -kr. Derive the differential equation for the orbit and solve for circular motion.", options: [], marks: 6, difficulty: 'Hard', topicId: "3-2" }
    ]
  },
  "AP Statistics": {
    units: [
      { id: "1", name: "Exploring Data", topicCount: 5, questionCount: 70, topics: [{ id: "1-1", name: "Data Analysis" }, { id: "1-2", name: "Graphical Displays" }, { id: "1-3", name: "Measures of Center" }, { id: "1-4", name: "Measures of Spread" }, { id: "1-5", name: "Normal Distribution" }]},
      { id: "2", name: "Sampling & Experimentation", topicCount: 4, questionCount: 60, topics: [{ id: "2-1", name: "Sampling Methods" }, { id: "2-2", name: "Experimental Design" }, { id: "2-3", name: "Bias" }, { id: "2-4", name: "Random Selection" }]},
      { id: "3", name: "Probability", topicCount: 6, questionCount: 85, topics: [{ id: "3-1", name: "Probability Rules" }, { id: "3-2", name: "Conditional Probability" }, { id: "3-3", name: "Independence" }, { id: "3-4", name: "Bayes' Theorem" }, { id: "3-5", name: "Counting Methods" }, { id: "3-6", name: "Probability Distributions" }]},
      { id: "4", name: "Random Variables", topicCount: 5, questionCount: 75, topics: [{ id: "4-1", name: "Discrete Random Variables" }, { id: "4-2", name: "Continuous Random Variables" }, { id: "4-3", name: "Expected Value" }, { id: "4-4", name: "Variance" }, { id: "4-5", name: "Binomial Distribution" }]},
      { id: "5", name: "Sampling Distributions", topicCount: 4, questionCount: 65, topics: [{ id: "5-1", name: "Central Limit Theorem" }, { id: "5-2", name: "Distribution of Sample Means" }, { id: "5-3", name: "Distribution of Sample Proportions" }, { id: "5-4", name: "Standard Error" }]},
      { id: "6", name: "Inference for Proportions", topicCount: 5, questionCount: 72, topics: [{ id: "6-1", name: "Confidence Intervals" }, { id: "6-2", name: "Hypothesis Tests" }, { id: "6-3", name: "One-Sample Tests" }, { id: "6-4", name: "Two-Sample Tests" }, { id: "6-5", name: "Chi-Square Tests" }]},
      { id: "7", name: "Inference for Means", topicCount: 5, questionCount: 78, topics: [{ id: "7-1", name: "t-Distribution" }, { id: "7-2", name: "One-Sample t-Tests" }, { id: "7-3", name: "Two-Sample t-Tests" }, { id: "7-4", name: "Paired Data" }, { id: "7-5", name: "ANOVA" }]},
      { id: "8", name: "Chi-Square & Regression", topicCount: 6, questionCount: 80, topics: [{ id: "8-1", name: "Chi-Square Goodness of Fit" }, { id: "8-2", name: "Chi-Square Independence" }, { id: "8-3", name: "Linear Regression" }, { id: "8-4", name: "Residuals" }, { id: "8-5", name: "Correlation" }, { id: "8-6", name: "Inference for Regression" }]}
    ],
    questions: [
      { id: 1, text: "What is the mean of the data set: 2, 4, 6, 8, 10?", options: ["A) 5", "B) 6", "C) 7", "D) 8"], marks: 1, difficulty: 'Easy', topicId: "1-3" },
      { id: 2, text: "In a normal distribution, what percentage of data falls within 1 standard deviation of the mean?", options: ["A) 50%", "B) 68%", "C) 95%", "D) 99.7%"], marks: 1, difficulty: 'Easy', topicId: "1-5" },
      { id: 1, text: "Calculate the standard deviation of the data set: 10, 12, 14, 16, 18.", options: [], marks: 3, difficulty: 'Medium', topicId: "1-4" },
      { id: 2, text: "A random sample of 100 students shows a mean test score of 75 with a standard deviation of 10. Construct a 95% confidence interval for the population mean.", options: [], marks: 4, difficulty: 'Medium', topicId: "6-1" },
      { id: 1, text: "Perform a hypothesis test at α = 0.05 to determine if there's a significant difference between two population means. Sample 1: n=50, x̄=80, s=12. Sample 2: n=45, x̄=75, s=14.", options: [], marks: 5, difficulty: 'Hard', topicId: "7-3" },
      { id: 2, text: "Explain the difference between Type I and Type II errors. Discuss how changing the significance level affects the probability of each type of error.", options: [], marks: 4, difficulty: 'Hard', topicId: "6-2" }
    ]
  },
  "AP Computer Science A": {
    units: [
      { id: "1", name: "Primitive Types", topicCount: 4, questionCount: 55, topics: [{ id: "1-1", name: "Data Types" }, { id: "1-2", name: "Variables" }, { id: "1-3", name: "Operators" }, { id: "1-4", name: "Type Casting" }]},
      { id: "2", name: "Using Objects", topicCount: 5, questionCount: 70, topics: [{ id: "2-1", name: "Objects and Classes" }, { id: "2-2", name: "Creating Objects" }, { id: "2-3", name: "Calling Methods" }, { id: "2-4", name: "String Class" }, { id: "2-5", name: "Math Class" }]},
      { id: "3", name: "Boolean Expressions & if", topicCount: 4, questionCount: 65, topics: [{ id: "3-1", name: "Boolean Expressions" }, { id: "3-2", name: "if Statements" }, { id: "3-3", name: "if-else Statements" }, { id: "3-4", name: "Logical Operators" }]},
      { id: "4", name: "Iteration", topicCount: 5, questionCount: 75, topics: [{ id: "4-1", name: "while Loops" }, { id: "4-2", name: "for Loops" }, { id: "4-3", name: "Enhanced for Loops" }, { id: "4-4", name: "Nested Loops" }, { id: "4-5", name: "Loop Algorithms" }]},
      { id: "5", name: "Writing Classes", topicCount: 6, questionCount: 85, topics: [{ id: "5-1", name: "Class Design" }, { id: "5-2", name: "Constructors" }, { id: "5-3", name: "Methods" }, { id: "5-4", name: "Encapsulation" }, { id: "5-5", name: "this Keyword" }, { id: "5-6", name: "Static Variables" }]},
      { id: "6", name: "Arrays", topicCount: 5, questionCount: 80, topics: [{ id: "6-1", name: "Array Creation" }, { id: "6-2", name: "Array Traversal" }, { id: "6-3", name: "Array Algorithms" }, { id: "6-4", name: "Array of Objects" }, { id: "6-5", name: "Array Methods" }]},
      { id: "7", name: "ArrayList", topicCount: 4, questionCount: 68, topics: [{ id: "7-1", name: "ArrayList Methods" }, { id: "7-2", name: "ArrayList Traversal" }, { id: "7-3", name: "ArrayList Algorithms" }, { id: "7-4", name: "Searching and Sorting" }]},
      { id: "8", name: "2D Arrays", topicCount: 4, questionCount: 62, topics: [{ id: "8-1", name: "2D Array Creation" }, { id: "8-2", name: "2D Array Traversal" }, { id: "8-3", name: "2D Array Algorithms" }, { id: "8-4", name: "2D Array Applications" }]},
      { id: "9", name: "Inheritance", topicCount: 5, questionCount: 72, topics: [{ id: "9-1", name: "Superclass and Subclass" }, { id: "9-2", name: "extends Keyword" }, { id: "9-3", name: "Overriding Methods" }, { id: "9-4", name: "super Keyword" }, { id: "9-5", name: "Polymorphism" }]},
      { id: "10", name: "Recursion", topicCount: 4, questionCount: 58, topics: [{ id: "10-1", name: "Recursive Methods" }, { id: "10-2", name: "Base Cases" }, { id: "10-3", name: "Recursive Algorithms" }, { id: "10-4", name: "Recursion vs Iteration" }]}
    ],
    questions: [
      { id: 1, text: "What is the output?\nint x = 5;\nSystem.out.println(x++);\nSystem.out.println(x);", options: ["A) 5, 6", "B) 6, 6", "C) 5, 5", "D) 6, 7"], marks: 2, difficulty: 'Easy', topicId: "1-3" },
      { id: 2, text: "Which of the following is a valid declaration of an ArrayList of Strings?", options: ["A) ArrayList<String> list = new ArrayList<>();", "B) ArrayList list = new ArrayList<String>();", "C) List<String> list = new ArrayList();", "D) All of the above"], marks: 1, difficulty: 'Easy', topicId: "7-1" },
      { id: 1, text: "Write a method that takes an int array and returns the sum of all elements.", options: [], marks: 3, difficulty: 'Medium', topicId: "6-3" },
      { id: 2, text: "Implement a class Student with private instance variables name (String) and grade (int). Include appropriate constructor, getters, and setters.", options: [], marks: 4, difficulty: 'Medium', topicId: "5-1" },
      { id: 1, text: "Write a recursive method to calculate the nth Fibonacci number. Analyze its time complexity.", options: [], marks: 5, difficulty: 'Hard', topicId: "10-3" },
      { id: 2, text: "Implement a method that performs a binary search on a sorted int array. The method should return the index of the target value, or -1 if not found.", options: [], marks: 5, difficulty: 'Hard', topicId: "7-4" }
    ]
  },
  "AP English Literature": {
    units: [
      { id: "1", name: "Poetry Analysis", topicCount: 6, questionCount: 80, topics: [{ id: "1-1", name: "Form and Structure" }, { id: "1-2", name: "Figurative Language" }, { id: "1-3", name: "Sound Devices" }, { id: "1-4", name: "Imagery" }, { id: "1-5", name: "Tone and Mood" }, { id: "1-6", name: "Poetic Devices" }]},
      { id: "2", name: "Prose Fiction Analysis", topicCount: 5, questionCount: 75, topics: [{ id: "2-1", name: "Narrative Structure" }, { id: "2-2", name: "Point of View" }, { id: "2-3", name: "Setting" }, { id: "2-4", name: "Plot Development" }, { id: "2-5", name: "Style and Diction" }]},
      { id: "3", name: "Drama Analysis", topicCount: 4, questionCount: 60, topics: [{ id: "3-1", name: "Dramatic Structure" }, { id: "3-2", name: "Dialogue" }, { id: "3-3", name: "Stage Directions" }, { id: "3-4", name: "Conflict" }]},
      { id: "4", name: "Literary Devices", topicCount: 7, questionCount: 90, topics: [{ id: "4-1", name: "Metaphor and Simile" }, { id: "4-2", name: "Personification" }, { id: "4-3", name: "Allusion" }, { id: "4-4", name: "Irony" }, { id: "4-5", name: "Foreshadowing" }, { id: "4-6", name: "Symbolism" }, { id: "4-7", name: "Allegory" }]},
      { id: "5", name: "Character Analysis", topicCount: 5, questionCount: 70, topics: [{ id: "5-1", name: "Characterization" }, { id: "5-2", name: "Character Development" }, { id: "5-3", name: "Protagonist and Antagonist" }, { id: "5-4", name: "Foil Characters" }, { id: "5-5", name: "Character Motivation" }]},
      { id: "6", name: "Theme & Symbolism", topicCount: 6, questionCount: 82, topics: [{ id: "6-1", name: "Identifying Themes" }, { id: "6-2", name: "Developing Themes" }, { id: "6-3", name: "Symbols and Motifs" }, { id: "6-4", name: "Universal Themes" }, { id: "6-5", name: "Cultural Context" }, { id: "6-6", name: "Historical Context" }]},
      { id: "7", name: "Essay Writing Skills", topicCount: 5, questionCount: 65, topics: [{ id: "7-1", name: "Thesis Statements" }, { id: "7-2", name: "Textual Evidence" }, { id: "7-3", name: "Analysis vs Summary" }, { id: "7-4", name: "Essay Structure" }, { id: "7-5", name: "Literary Analysis" }]}
    ],
    questions: [
      { id: 1, text: "Identify the literary device:\n'The stars danced in the night sky.'", options: ["A) Metaphor", "B) Simile", "C) Personification", "D) Hyperbole"], marks: 1, difficulty: 'Easy', topicId: "4-2" },
      { id: 2, text: "What is the rhyme scheme of a Shakespearean sonnet?", options: ["A) ABAB CDCD EFEF GG", "B) ABBA ABBA CDE CDE", "C) AABB CCDD EEFF GG", "D) Free verse"], marks: 1, difficulty: 'Easy', topicId: "1-1" },
      { id: 1, text: "Analyze the use of imagery in the following excerpt:\n'The fog comes on little cat feet. It sits looking over harbor and city on silent haunches and then moves on.'", options: [], marks: 4, difficulty: 'Medium', topicId: "1-4" },
      { id: 2, text: "Compare and contrast the narrative perspectives in first-person and third-person omniscient point of view. Provide examples.", options: [], marks: 4, difficulty: 'Medium', topicId: "2-2" },
      { id: 1, text: "Write a literary analysis essay discussing how the author uses symbolism to develop the central theme in a work of your choice. Include specific textual evidence.", options: [], marks: 6, difficulty: 'Hard', topicId: "6-3" },
      { id: 2, text: "Analyze the following poem for tone, mood, and theme. Discuss how literary devices contribute to the overall meaning:\n[Poem excerpt would be provided]", options: [], marks: 6, difficulty: 'Hard', topicId: "1-5" }
    ]
  },
  "AP US History": {
    units: [
      { id: "1", name: "Pre-Columbian to 1754", topicCount: 5, questionCount: 65, topics: [{ id: "1-1", name: "Native American Societies" }, { id: "1-2", name: "European Exploration" }, { id: "1-3", name: "Columbian Exchange" }, { id: "1-4", name: "Spanish Colonization" }, { id: "1-5", name: "French and Dutch Colonies" }]},
      { id: "2", name: "Colonial Period 1607-1754", topicCount: 6, questionCount: 78, topics: [{ id: "2-1", name: "English Colonies" }, { id: "2-2", name: "Colonial Society" }, { id: "2-3", name: "Slavery in the Colonies" }, { id: "2-4", name: "Colonial Economy" }, { id: "2-5", name: "Religion in Colonies" }, { id: "2-6", name: "Colonial Government" }]},
      { id: "3", name: "American Revolution 1754-1800", topicCount: 5, questionCount: 72, topics: [{ id: "3-1", name: "Causes of Revolution" }, { id: "3-2", name: "Revolutionary War" }, { id: "3-3", name: "Articles of Confederation" }, { id: "3-4", name: "Constitution" }, { id: "3-5", name: "Bill of Rights" }]},
      { id: "4", name: "Early Republic 1800-1848", topicCount: 6, questionCount: 80, topics: [{ id: "4-1", name: "Jeffersonian Democracy" }, { id: "4-2", name: "War of 1812" }, { id: "4-3", name: "Westward Expansion" }, { id: "4-4", name: "Jacksonian Democracy" }, { id: "4-5", name: "Market Revolution" }, { id: "4-6", name: "Reform Movements" }]},
      { id: "5", name: "Civil War Era 1844-1877", topicCount: 7, questionCount: 95, topics: [{ id: "5-1", name: "Causes of Civil War" }, { id: "5-2", name: "Slavery and Abolition" }, { id: "5-3", name: "Secession" }, { id: "5-4", name: "Civil War Battles" }, { id: "5-5", name: "Emancipation" }, { id: "5-6", name: "Reconstruction" }, { id: "5-7", name: "Post-War Amendments" }]},
      { id: "6", name: "Gilded Age 1865-1898", topicCount: 5, questionCount: 70, topics: [{ id: "6-1", name: "Industrialization" }, { id: "6-2", name: "Immigration" }, { id: "6-3", name: "Urbanization" }, { id: "6-4", name: "Labor Unions" }, { id: "6-5", name: "Political Corruption" }]},
      { id: "7", name: "Progressive Era 1890-1920", topicCount: 6, questionCount: 82, topics: [{ id: "7-1", name: "Progressive Reforms" }, { id: "7-2", name: "Muckrakers" }, { id: "7-3", name: "Women's Suffrage" }, { id: "7-4", name: "Trust-Busting" }, { id: "7-5", name: "Conservation" }, { id: "7-6", name: "Spanish-American War" }]},
      { id: "8", name: "World Wars 1914-1945", topicCount: 7, questionCount: 98, topics: [{ id: "8-1", name: "WWI Causes" }, { id: "8-2", name: "US in WWI" }, { id: "8-3", name: "Roaring Twenties" }, { id: "8-4", name: "Great Depression" }, { id: "8-5", name: "New Deal" }, { id: "8-6", name: "WWII" }, { id: "8-7", name: "Holocaust" }]},
      { id: "9", name: "Cold War 1945-1980", topicCount: 8, questionCount: 105, topics: [{ id: "9-1", name: "Origins of Cold War" }, { id: "9-2", name: "Containment Policy" }, { id: "9-3", name: "Korean War" }, { id: "9-4", name: "McCarthy Era" }, { id: "9-5", name: "Civil Rights Movement" }, { id: "9-6", name: "Vietnam War" }, { id: "9-7", name: "Counterculture" }, { id: "9-8", name: "Watergate" }]},
      { id: "10", name: "Modern America 1980-Present", topicCount: 6, questionCount: 85, topics: [{ id: "10-1", name: "Reagan Era" }, { id: "10-2", name: "End of Cold War" }, { id: "10-3", name: "Globalization" }, { id: "10-4", name: "Technology Revolution" }, { id: "10-5", name: "War on Terror" }, { id: "10-6", name: "21st Century Challenges" }]}
    ],
    questions: [
      { id: 1, text: "Which document was signed in 1776?", options: ["A) Constitution", "B) Bill of Rights", "C) Declaration of Independence", "D) Articles of Confederation"], marks: 1, difficulty: 'Easy', topicId: "3-1" },
      { id: 2, text: "What was the main cause of the Civil War?", options: ["A) Taxation", "B) Slavery", "C) States' rights", "D) All of the above"], marks: 1, difficulty: 'Easy', topicId: "5-1" },
      { id: 1, text: "Analyze the economic and social impacts of the Industrial Revolution on American society in the late 19th century.", options: [], marks: 4, difficulty: 'Medium', topicId: "6-1" },
      { id: 2, text: "Compare and contrast the New Deal policies with the Great Society programs. Discuss their impacts on American government and society.", options: [], marks: 5, difficulty: 'Medium', topicId: "8-5" },
      { id: 1, text: "Evaluate the extent to which the Civil Rights Movement of the 1950s-1960s was successful in achieving its goals. Use specific examples and evidence.", options: [], marks: 6, difficulty: 'Hard', topicId: "9-5" },
      { id: 2, text: "To what extent did Manifest Destiny influence American foreign policy in the 19th century? Analyze its impact on Native Americans and Mexico.", options: [], marks: 6, difficulty: 'Hard', topicId: "4-3" }
    ]
  },
  "AP World History": {
    units: [
      { id: "1", name: "The Global Tapestry 1200-1450", topicCount: 6, questionCount: 85, topics: [{ id: "1-1", name: "Song Dynasty China" }, { id: "1-2", name: "Dar al-Islam" }, { id: "1-3", name: "South and Southeast Asia" }, { id: "1-4", name: "State Building in Americas" }, { id: "1-5", name: "State Building in Africa" }, { id: "1-6", name: "Europe in Medieval Period" }]},
      { id: "2", name: "Networks of Exchange 1200-1450", topicCount: 5, questionCount: 75, topics: [{ id: "2-1", name: "Silk Roads" }, { id: "2-2", name: "Indian Ocean Trade" }, { id: "2-3", name: "Trans-Saharan Trade" }, { id: "2-4", name: "Cultural Consequences" }, { id: "2-5", name: "Environmental Consequences" }]},
      { id: "3", name: "Land-Based Empires 1450-1750", topicCount: 7, questionCount: 95, topics: [{ id: "3-1", name: "Ottoman Empire" }, { id: "3-2", name: "Safavid Empire" }, { id: "3-3", name: "Mughal Empire" }, { id: "3-4", name: "Qing Dynasty" }, { id: "3-5", name: "Russian Empire" }, { id: "3-6", name: "European Monarchies" }, { id: "3-7", name: "Gunpowder Empires" }]},
      { id: "4", name: "Transoceanic Connections 1450-1750", topicCount: 6, questionCount: 88, topics: [{ id: "4-1", name: "European Exploration" }, { id: "4-2", name: "Columbian Exchange" }, { id: "4-3", name: "Atlantic Slave Trade" }, { id: "4-4", name: "Commercial Revolution" }, { id: "4-5", name: "Mercantilism" }, { id: "4-6", name: "Coerced Labor Systems" }]},
      { id: "5", name: "Revolutions 1750-1900", topicCount: 7, questionCount: 100, topics: [{ id: "5-1", name: "Enlightenment" }, { id: "5-2", name: "American Revolution" }, { id: "5-3", name: "French Revolution" }, { id: "5-4", name: "Haitian Revolution" }, { id: "5-5", name: "Latin American Independence" }, { id: "5-6", name: "Nationalism" }, { id: "5-7", name: "Abolition of Slavery" }]},
      { id: "6", name: "Industrialization 1750-1900", topicCount: 6, questionCount: 90, topics: [{ id: "6-1", name: "Industrial Revolution" }, { id: "6-2", name: "Factory System" }, { id: "6-3", name: "Industrialization Spread" }, { id: "6-4", name: "Economic Ideologies" }, { id: "6-5", name: "Social Effects" }, { id: "6-6", name: "Environmental Effects" }]},
      { id: "7", name: "Imperialism 1750-1900", topicCount: 6, questionCount: 92, topics: [{ id: "7-1", name: "Causes of Imperialism" }, { id: "7-2", name: "State Expansion" }, { id: "7-3", name: "Colonialism in Africa" }, { id: "7-4", name: "Colonialism in Asia" }, { id: "7-5", name: "Resistance to Imperialism" }, { id: "7-6", name: "Effects of Imperialism" }]},
      { id: "8", name: "World Wars 1900-present", topicCount: 8, questionCount: 110, topics: [{ id: "8-1", name: "Causes of WWI" }, { id: "8-2", name: "WWI Conduct" }, { id: "8-3", name: "WWI Consequences" }, { id: "8-4", name: "Rise of Totalitarianism" }, { id: "8-5", name: "WWII" }, { id: "8-6", name: "Holocaust" }, { id: "8-7", name: "WWII Consequences" }, { id: "8-8", name: "United Nations" }]},
      { id: "9", name: "Cold War & Decolonization", topicCount: 7, questionCount: 98, topics: [{ id: "9-1", name: "Cold War Origins" }, { id: "9-2", name: "Cold War Conflicts" }, { id: "9-3", name: "Decolonization in Africa" }, { id: "9-4", name: "Decolonization in Asia" }, { id: "9-5", name: "Non-Aligned Movement" }, { id: "9-6", name: "Proxy Wars" }, { id: "9-7", name: "End of Cold War" }]},
      { id: "10", name: "Globalization 1900-present", topicCount: 6, questionCount: 88, topics: [{ id: "10-1", name: "Technology and Communication" }, { id: "10-2", name: "Economic Globalization" }, { id: "10-3", name: "Migration" }, { id: "10-4", name: "Cultural Diffusion" }, { id: "10-5", name: "Disease and Epidemics" }, { id: "10-6", name: "Environmental Issues" }]}
    ],
    questions: [
      { id: 1, text: "Which empire controlled the Silk Road during the Mongol period?", options: ["A) Ottoman", "B) Mongol", "C) Byzantine", "D) Roman"], marks: 1, difficulty: 'Easy', topicId: "2-1" },
      { id: 2, text: "What was the primary motivation for European exploration in the 15th-16th centuries?", options: ["A) Religious conversion", "B) Trade routes to Asia", "C) Scientific discovery", "D) Territorial expansion"], marks: 1, difficulty: 'Easy', topicId: "4-1" },
      { id: 1, text: "Analyze the impact of the Columbian Exchange on both the Eastern and Western Hemispheres.", options: [], marks: 4, difficulty: 'Medium', topicId: "4-2" },
      { id: 2, text: "Compare and contrast the Ottoman and Mughal empires in terms of political structure, religious tolerance, and cultural achievements.", options: [], marks: 5, difficulty: 'Medium', topicId: "3-1" },
      { id: 1, text: "Evaluate the extent to which the Industrial Revolution transformed global economic and social structures in the 19th century.", options: [], marks: 6, difficulty: 'Hard', topicId: "6-1" },
      { id: 2, text: "Analyze the causes and consequences of decolonization in Africa and Asia following World War II. Include specific examples from at least three different regions.", options: [], marks: 6, difficulty: 'Hard', topicId: "9-3" }
    ]
  },
  "AP Psychology": {
    units: [
      { id: "1", name: "Scientific Foundations", topicCount: 5, questionCount: 68, topics: [{ id: "1-1", name: "History of Psychology" }, { id: "1-2", name: "Research Methods" }, { id: "1-3", name: "Statistics" }, { id: "1-4", name: "Ethics" }, { id: "1-5", name: "Psychological Perspectives" }]},
      { id: "2", name: "Biological Bases", topicCount: 6, questionCount: 82, topics: [{ id: "2-1", name: "Neurons and Neurotransmitters" }, { id: "2-2", name: "Brain Structure" }, { id: "2-3", name: "Brain Function" }, { id: "2-4", name: "Endocrine System" }, { id: "2-5", name: "Genetics" }, { id: "2-6", name: "Evolutionary Psychology" }]},
      { id: "3", name: "Sensation & Perception", topicCount: 6, questionCount: 85, topics: [{ id: "3-1", name: "Vision" }, { id: "3-2", name: "Hearing" }, { id: "3-3", name: "Other Senses" }, { id: "3-4", name: "Perceptual Organization" }, { id: "3-5", name: "Depth Perception" }, { id: "3-6", name: "Perceptual Constancies" }]},
      { id: "4", name: "Learning", topicCount: 5, questionCount: 75, topics: [{ id: "4-1", name: "Classical Conditioning" }, { id: "4-2", name: "Operant Conditioning" }, { id: "4-3", name: "Observational Learning" }, { id: "4-4", name: "Biological Constraints" }, { id: "4-5", name: "Learning and Cognition" }]},
      { id: "5", name: "Cognitive Psychology", topicCount: 7, questionCount: 95, topics: [{ id: "5-1", name: "Memory Processes" }, { id: "5-2", name: "Memory Storage" }, { id: "5-3", name: "Memory Retrieval" }, { id: "5-4", name: "Forgetting" }, { id: "5-5", name: "Thinking" }, { id: "5-6", name: "Problem Solving" }, { id: "5-7", name: "Language" }]},
      { id: "6", name: "Developmental Psychology", topicCount: 6, questionCount: 88, topics: [{ id: "6-1", name: "Prenatal Development" }, { id: "6-2", name: "Infancy and Childhood" }, { id: "6-3", name: "Piaget's Theory" }, { id: "6-4", name: "Adolescence" }, { id: "6-5", name: "Adulthood" }, { id: "6-6", name: "Aging" }]},
      { id: "7", name: "Motivation & Emotion", topicCount: 5, questionCount: 72, topics: [{ id: "7-1", name: "Theories of Motivation" }, { id: "7-2", name: "Hunger" }, { id: "7-3", name: "Sexual Motivation" }, { id: "7-4", name: "Emotion Theories" }, { id: "7-5", name: "Stress and Health" }]},
      { id: "8", name: "Personality", topicCount: 5, questionCount: 78, topics: [{ id: "8-1", name: "Psychoanalytic Theory" }, { id: "8-2", name: "Humanistic Theory" }, { id: "8-3", name: "Trait Theory" }, { id: "8-4", name: "Social-Cognitive Theory" }, { id: "8-5", name: "Assessment" }]},
      { id: "9", name: "Clinical Psychology", topicCount: 7, questionCount: 98, topics: [{ id: "9-1", name: "Defining Abnormality" }, { id: "9-2", name: "Anxiety Disorders" }, { id: "9-3", name: "Mood Disorders" }, { id: "9-4", name: "Schizophrenia" }, { id: "9-5", name: "Personality Disorders" }, { id: "9-6", name: "Therapies" }, { id: "9-7", name: "Biomedical Treatments" }]}
    ],
    questions: [
      { id: 1, text: "Which neurotransmitter is associated with pleasure and reward?", options: ["A) Serotonin", "B) Dopamine", "C) GABA", "D) Acetylcholine"], marks: 1, difficulty: 'Easy', topicId: "2-1" },
      { id: 2, text: "Who is considered the father of psychoanalysis?", options: ["A) B.F. Skinner", "B) Carl Jung", "C) Sigmund Freud", "D) Ivan Pavlov"], marks: 1, difficulty: 'Easy', topicId: "8-1" },
      { id: 1, text: "Explain the difference between classical and operant conditioning. Provide an example of each.", options: [], marks: 4, difficulty: 'Medium', topicId: "4-1" },
      { id: 2, text: "Describe Piaget's stages of cognitive development and identify the key characteristics of each stage.", options: [], marks: 4, difficulty: 'Medium', topicId: "6-3" },
      { id: 1, text: "Compare and contrast the psychodynamic, behavioral, cognitive, and humanistic perspectives in psychology. Discuss how each would explain depression.", options: [], marks: 6, difficulty: 'Hard', topicId: "1-5" },
      { id: 2, text: "Design an experiment to test the effectiveness of a new treatment for anxiety. Include hypothesis, variables, methodology, and potential ethical considerations.", options: [], marks: 6, difficulty: 'Hard', topicId: "1-2" }
    ]
  },
  "AP Economics": {
    units: [
      { id: "1", name: "Basic Economic Concepts", topicCount: 4, questionCount: 60, topics: [{ id: "1-1", name: "Scarcity and Choice" }, { id: "1-2", name: "Production Possibilities" }, { id: "1-3", name: "Comparative Advantage" }, { id: "1-4", name: "Economic Systems" }]},
      { id: "2", name: "Supply and Demand (Micro)", topicCount: 6, questionCount: 85, topics: [{ id: "2-1", name: "Demand" }, { id: "2-2", name: "Supply" }, { id: "2-3", name: "Market Equilibrium" }, { id: "2-4", name: "Elasticity" }, { id: "2-5", name: "Consumer and Producer Surplus" }, { id: "2-6", name: "Market Efficiency" }]},
      { id: "3", name: "Production & Costs (Micro)", topicCount: 5, questionCount: 72, topics: [{ id: "3-1", name: "Production Functions" }, { id: "3-2", name: "Short-Run Costs" }, { id: "3-3", name: "Long-Run Costs" }, { id: "3-4", name: "Economies of Scale" }, { id: "3-5", name: "Profit Maximization" }]},
      { id: "4", name: "Market Structures (Micro)", topicCount: 6, questionCount: 88, topics: [{ id: "4-1", name: "Perfect Competition" }, { id: "4-2", name: "Monopoly" }, { id: "4-3", name: "Monopolistic Competition" }, { id: "4-4", name: "Oligopoly" }, { id: "4-5", name: "Game Theory" }, { id: "4-6", name: "Antitrust Policy" }]},
      { id: "5", name: "Factor Markets (Micro)", topicCount: 4, questionCount: 65, topics: [{ id: "5-1", name: "Labor Market" }, { id: "5-2", name: "Wage Determination" }, { id: "5-3", name: "Capital and Land Markets" }, { id: "5-4", name: "Income Distribution" }]},
      { id: "6", name: "National Income (Macro)", topicCount: 5, questionCount: 75, topics: [{ id: "6-1", name: "GDP" }, { id: "6-2", name: "Economic Growth" }, { id: "6-3", name: "Business Cycles" }, { id: "6-4", name: "Aggregate Expenditure" }, { id: "6-5", name: "Multiplier Effect" }]},
      { id: "7", name: "Inflation & Unemployment (Macro)", topicCount: 5, questionCount: 78, topics: [{ id: "7-1", name: "Measuring Inflation" }, { id: "7-2", name: "Types of Unemployment" }, { id: "7-3", name: "Phillips Curve" }, { id: "7-4", name: "Natural Rate" }, { id: "7-5", name: "CPI and GDP Deflator" }]},
      { id: "8", name: "Fiscal Policy (Macro)", topicCount: 4, questionCount: 68, topics: [{ id: "8-1", name: "Government Spending" }, { id: "8-2", name: "Taxation" }, { id: "8-3", name: "Budget Deficits" }, { id: "8-4", name: "Automatic Stabilizers" }]},
      { id: "9", name: "Monetary Policy (Macro)", topicCount: 5, questionCount: 72, topics: [{ id: "9-1", name: "Money Supply" }, { id: "9-2", name: "Federal Reserve" }, { id: "9-3", name: "Open Market Operations" }, { id: "9-4", name: "Interest Rates" }, { id: "9-5", name: "Monetary Policy Tools" }]},
      { id: "10", name: "International Trade (Macro)", topicCount: 5, questionCount: 70, topics: [{ id: "10-1", name: "Comparative Advantage" }, { id: "10-2", name: "Trade Barriers" }, { id: "10-3", name: "Exchange Rates" }, { id: "10-4", name: "Balance of Payments" }, { id: "10-5", name: "Trade Agreements" }]}
    ],
    questions: [
      { id: 1, text: "What happens to equilibrium price when demand increases and supply remains constant?", options: ["A) Price increases", "B) Price decreases", "C) Price stays the same", "D) Cannot determine"], marks: 1, difficulty: 'Easy', topicId: "2-3" },
      { id: 2, text: "Which market structure has the most competition?", options: ["A) Monopoly", "B) Oligopoly", "C) Monopolistic competition", "D) Perfect competition"], marks: 1, difficulty: 'Easy', topicId: "4-1" },
      { id: 1, text: "Calculate the price elasticity of demand if quantity demanded decreases from 100 to 80 when price increases from $10 to $12.", options: [], marks: 3, difficulty: 'Medium', topicId: "2-4" },
      { id: 2, text: "Explain how the Federal Reserve uses monetary policy tools to combat inflation. Include discussion of open market operations, reserve requirements, and discount rate.", options: [], marks: 4, difficulty: 'Medium', topicId: "9-5" },
      { id: 1, text: "Using AD-AS model, analyze the short-run and long-run effects of an expansionary fiscal policy. Discuss potential crowding out effects.", options: [], marks: 6, difficulty: 'Hard', topicId: "8-1" },
      { id: 2, text: "Compare the effects of tariffs and quotas on domestic and international markets. Use supply and demand graphs to illustrate your analysis.", options: [], marks: 5, difficulty: 'Hard', topicId: "10-2" }
    ]
  }
};

export function ExamQuestionsViewer({ subject, category }: ExamQuestionsViewerProps) {
  // Get subject data or use default
  const subjectData = AP_SUBJECT_DATA[category] || AP_SUBJECT_DATA["AP Biology"];
  const units = subjectData.units;
  const allQuestions = subjectData.questions;

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(units[0] || null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(units[0]?.topics[0] || null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set([units[0]?.id || "1"]));
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

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
    setCurrentQuestionNumber(1);
    // Auto-expand the unit when clicked
    if (!expandedUnits.has(unit.id)) {
      toggleUnit(unit.id);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentQuestionNumber(1);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
  };

  const handleDownloadPDF = () => {
    // Create PDF content
    const pdfContent = questionsInDifficulty.map((q, idx) => 
      `Question ${idx + 1}:\n${q.text}\n${q.options.length > 0 ? q.options.join('\n') : ''}\n\n`
    ).join('');
    
    // Create a blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${category}_${selectedDifficulty}_Questions.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleAnswers = () => {
    setShowAllAnswers(!showAllAnswers);
  };

  // Filter questions by selected topic and difficulty
  const questionsInDifficulty = allQuestions.filter(
    q => q.difficulty === selectedDifficulty && (!selectedTopic || q.topicId === selectedTopic.id)
  );
  const currentQuestion = questionsInDifficulty[currentQuestionNumber - 1] || questionsInDifficulty[0];

  return (
    <>
      <ContentRightSidebar />
      <div className="flex gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Left Sidebar - Units List */}
        <div className="w-56 bg-white rounded-lg overflow-y-auto flex-shrink-0" style={{ borderRight: '1px solid #e5e7eb' }}>
        <div className="p-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <h3 className="text-[#00bcd4]">Exam Questions</h3>
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

        {/* Right Content - Question Viewer */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
        {selectedUnit && selectedTopic ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>AP</span>
                    <span>/</span>
                    <span>{category}</span>
                    <span>/</span>
                    <span>Exam Questions</span>
                    <span>/</span>
                    <span>{selectedUnit.name}</span>
                    <span>/</span>
                    <span>{selectedTopic.name}</span>
                  </div>
                  <h2 className="text-gray-800 mb-2 font-medium">
                    {selectedTopic.name}
                  </h2>
                  <div className="text-gray-600 text-sm font-medium">
                    Practice Questions
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-gray-600">
                  Practice Questions · Mixed Difficulty
                </div>
                <div className="flex gap-2">
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
              </div>
            </div>

            {/* Difficulty Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex px-6">
                {(['Easy', 'Medium', 'Hard'] as const).map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => {
                      setSelectedDifficulty(difficulty);
                      setCurrentQuestionNumber(1);
                      setSelectedAnswer(null);
                      setIsAnswerSubmitted(false);
                    }}
                    className={`px-6 py-3 relative font-semibold ${
                      selectedDifficulty === difficulty
                        ? 'text-[#00bcd4]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {difficulty}
                    {selectedDifficulty === difficulty && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00bcd4]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Numbers */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex gap-2 flex-wrap">
                {questionsInDifficulty.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestionNumber(idx + 1);
                      setSelectedAnswer(null);
                      setIsAnswerSubmitted(false);
                    }}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      currentQuestionNumber === idx + 1
                        ? 'bg-[#00bcd4] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Content */}
            <div className="p-6">
              {currentQuestion ? (
                <motion.div
                  key={`${selectedDifficulty}-${currentQuestionNumber}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-gray-600 font-medium">Question {currentQuestionNumber}</div>
                    <div className="text-gray-600 font-medium">{currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}</div>
                  </div>

                  <div className="text-gray-800 whitespace-pre-line mb-6 text-lg leading-relaxed font-medium">
                    {currentQuestion.text}
                  </div>

                  {currentQuestion.options.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = currentQuestion.correctAnswer === idx;
                        const showResult = isAnswerSubmitted || showAllAnswers;
                        
                        let borderColor = 'border-gray-300';
                        let bgColor = 'bg-white';
                        let textColor = 'text-gray-800';
                        let checkboxClass = '';
                        
                        if (showResult) {
                          if (isCorrect) {
                            borderColor = 'border-green-400';
                            bgColor = 'bg-green-50';
                            textColor = 'text-green-900';
                            checkboxClass = 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600';
                          } else if (isSelected && !isCorrect) {
                            borderColor = 'border-red-400';
                            bgColor = 'bg-red-50';
                            textColor = 'text-red-900';
                            checkboxClass = 'data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600';
                          }
                        } else if (isSelected) {
                          borderColor = 'border-[#00bcd4]';
                          bgColor = 'bg-[#e0f7fa]';
                        }
                        
                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${borderColor} ${bgColor} ${!isAnswerSubmitted && !showAllAnswers ? 'hover:border-[#00bcd4] hover:bg-[#e0f7fa]' : ''}`}
                          >
                            <Checkbox
                              checked={isSelected || (showResult && isCorrect)}
                              onCheckedChange={() => {
                                if (!isAnswerSubmitted && !showAllAnswers) {
                                  setSelectedAnswer(idx);
                                }
                              }}
                              disabled={isAnswerSubmitted || showAllAnswers}
                              className={`mt-0.5 ${checkboxClass}`}
                            />
                            <div className="flex-1 flex items-start justify-between gap-3">
                              <span className={`font-medium leading-relaxed ${textColor}`}>{option}</span>
                              {showResult && (
                                <div className="flex-shrink-0">
                                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                  {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {currentQuestion.options.length > 0 && !isAnswerSubmitted && !showAllAnswers && (
                    <div className="mb-6">
                      <Button 
                        onClick={() => {
                          if (selectedAnswer !== null) {
                            setIsAnswerSubmitted(true);
                          }
                        }}
                        disabled={selectedAnswer === null}
                        className="bg-[#00bcd4] hover:bg-[#00acc1] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </Button>
                    </div>
                  )}

                  {(isAnswerSubmitted || showAllAnswers) && currentQuestion.options.length > 0 && currentQuestion.correctAnswer !== undefined && (
                    <div className={`mb-6 p-4 rounded-lg border ${
                      selectedAnswer === currentQuestion.correctAnswer 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedAnswer === currentQuestion.correctAnswer ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-900">Correct! Well done!</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-900">Correct Answer:</span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-800 font-medium">
                        {currentQuestion.options[currentQuestion.correctAnswer]}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <div className="text-gray-500 mb-2">How did you do?</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">😊 Good</Button>
                      <Button variant="outline" size="sm">😐 OK</Button>
                      <Button variant="outline" size="sm">😞 Needs work</Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No questions available for this topic and difficulty level.
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="border-t border-gray-200 p-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentQuestionNumber(Math.max(1, currentQuestionNumber - 1));
                  setSelectedAnswer(null);
                  setIsAnswerSubmitted(false);
                }}
                disabled={currentQuestionNumber === 1}
              >
                Previous
              </Button>
              <Button
                className="bg-[#00bcd4] hover:bg-[#00acc1] text-white"
                onClick={() => {
                  setCurrentQuestionNumber(Math.min(questionsInDifficulty.length, currentQuestionNumber + 1));
                  setSelectedAnswer(null);
                  setIsAnswerSubmitted(false);
                }}
                disabled={currentQuestionNumber === questionsInDifficulty.length}
              >
                Next Question
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <img src={examImage} alt="Exam Questions" className="w-64 h-auto mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a unit and topic from the left to view exam questions</p>
              <p className="text-sm text-gray-400">{category}</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}

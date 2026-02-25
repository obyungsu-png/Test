import { 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  CreditCard, 
  FileText, 
  Clock,
  Edit
} from "lucide-react";

export const DOWNLOAD_OPTIONS = [
  {
    id: "key-notes",
    title: "Key Notes",
    icon: BookOpen,
    color: "bg-blue-500",
    description: "Essential study notes"
  },
  {
    id: "exam-questions", 
    title: "Exam Questions",
    icon: HelpCircle,
    color: "bg-blue-500",
    description: "Practice exam questions"
  },
  {
    id: "basic-concepts",
    title: "Basic Concepts",
    icon: Sparkles,
    color: "bg-blue-500",
    description: "Fundamental concepts"
  },
  {
    id: "flashcards",
    title: "Flashcards", 
    icon: CreditCard,
    color: "bg-blue-500",
    description: "Digital flashcards"
  },
  {
    id: "mock-exams",
    title: "Mock Exams",
    icon: FileText,
    color: "bg-blue-500",
    description: "Practice tests"
  }
];

export const PAST_PAPERS_OPTION = {
  id: "past-papers",
  title: "Past Papers",
  icon: Clock,
  color: "bg-blue-500",
  description: "Previous exam papers"
};

export const TEACHER_OPTIONS = [
  {
    id: "test-builder",
    title: "Test Builder",
    icon: Edit,
    color: "bg-blue-500", 
    description: "Test creation tool",
    isNew: true
  }
];
export interface QuizConfig {
  subjects: string[];
  courses: string[];
  modules: string[];
  categories: string[];
  tags: string[];
  questionTypes: QuestionType[];
  questionCount: number;
}

export type QuestionType =
  | "multiple-choice"
  | "fill-in-blank"
  | "true-false"
  | "matching"
  | "multiple-response";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  cardId: string;
  question: string;
  correctAnswer: string;
  options?: string[]; // For multiple choice
  blanks?: string[]; // For fill-in-blank (the missing words)
  originalText?: string; // For fill-in-blank (text with blanks)
  isTrue?: boolean; // For true/false
  pairs?: { left: string; right: string; cardId: string }[]; // For matching
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | string[] | { [key: string]: string }; // Different types for different question formats
  isCorrect: boolean;
  timeSpent?: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: QuizAnswer[];
  questions: QuizQuestion[];
  timeSpent: number;
  completedAt: string;
}

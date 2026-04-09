// Shared TypeScript interfaces for all syllabus module data.
// This file has NO imports and NO data — only type definitions.
// Import from here (not from syllabus-data.ts) inside src/data/modules/ files
// to avoid circular dependencies.

export interface CaseStudyVariant {
  title: string;
  scenario: string;
  questions: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  type: 'multiple-choice' | 'essay';
}

export interface LabDownload {
  name: string;
  url: string;
  description: string;
}

export interface LabStep {
  title: string;
  description: string;
  command?: string;
  expectedOutput?: string;
  hint?: string;
  screenshotNote?: string;
  warningNote?: string;
}

export interface TheoryItem {
  title: string;
  content: string;
  formula?: string;
  formulaLabel?: string;
  keyPoints?: string[];
  example?: {
    title: string;
    steps: string[];
    result?: string;
  };
  table?: {
    caption?: string;
    headers: string[];
    rows: string[][];
  };
  codeSnippet?: string;
  note?: string;
  noteType?: 'info' | 'warning' | 'success' | 'danger';
}

export interface VideoResource {
  title: string;
  youtubeId: string;
  description?: string;
  language?: 'id' | 'en';
  duration?: string;
}

export interface ModuleData {
  id: number;
  title: string;
  description: string;
  iconName: string;
  theory: TheoryItem[];
  lab: {
    title: string;
    downloads: LabDownload[];
    steps: LabStep[];
    deliverable: string;
  };
  caseStudy: CaseStudyVariant;
  caseStudyPool?: CaseStudyVariant[];
  quiz: QuizQuestion[];
  videoResources: VideoResource[];
}

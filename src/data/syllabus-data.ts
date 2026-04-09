// Pure data file — no React/icon imports so the server can import it via tsx.
// syllabus.tsx re-exports this with icon mappings.
// All content now lives in src/data/modules/ — this file is a thin re-export wrapper.

export type {
  CaseStudyVariant,
  QuizQuestion,
  LabDownload,
  LabStep,
  TheoryItem,
  VideoResource,
  ModuleData,
} from './module-types';

export { syllabusData } from './modules/index';

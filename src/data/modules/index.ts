// Barrel file: assembles all 16 modules into the syllabusData array.
// Also re-exports all shared types from module-types.ts (no circular deps).

export type {
  CaseStudyVariant,
  QuizQuestion,
  LabDownload,
  LabStep,
  TheoryItem,
  VideoResource,
  ModuleData,
} from '../module-types';

// Teaching modules (1-6, 9-14) — fully expanded content
import { module01 } from './module-01';
import { module02 } from './module-02';
import { module03 } from './module-03';
import { module04 } from './module-04';
import { module05 } from './module-05';
import { module06 } from './module-06';
import { module09 } from './module-09';
import { module10 } from './module-10';
import { module11 } from './module-11';
import { module12 } from './module-12';
import { module13 } from './module-13';
import { module14 } from './module-14';

// Exam/review modules (7, 8, 15, 16) — minimal content
import { module07 } from './module-07';
import { module08 } from './module-08';
import { module15 } from './module-15';
import { module16 } from './module-16';

import type { ModuleData } from '../module-types';

export const syllabusData: ModuleData[] = [
  module01,
  module02,
  module03,
  module04,
  module05,
  module06,
  module07,
  module08,
  module09,
  module10,
  module11,
  module12,
  module13,
  module14,
  module15,
  module16,
];

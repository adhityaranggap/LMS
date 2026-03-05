import {
  Shield,
  Server,
  Terminal,
  Activity,
  Globe,
  AlertTriangle,
  FileText,
  Award,
  Eye,
  Lock,
  Key,
  Cpu,
  Database,
  FileCode,
} from 'lucide-react';

import { syllabusData } from './syllabus-data';
import type { ModuleData } from './syllabus-data';

// Re-export all interfaces so existing imports from syllabus.tsx keep working
export type {
  QuizQuestion,
  LabDownload,
  LabStep,
  TheoryItem,
  VideoResource,
  ModuleData,
} from './syllabus-data';

// Module interface that replaces iconName (string) with an actual icon component
export interface Module extends Omit<ModuleData, 'iconName'> {
  icon: any;
}

// Map icon name strings to actual Lucide icon components
const iconMap: Record<string, any> = {
  Shield,
  Server,
  Terminal,
  Activity,
  Globe,
  AlertTriangle,
  FileText,
  Award,
  Eye,
  Lock,
  Key,
  Cpu,
  Database,
  FileCode,
};

// Resolve iconName to icon component for each module
export const syllabus: Module[] = syllabusData.map(({ iconName, ...rest }) => ({
  ...rest,
  icon: iconMap[iconName] ?? Shield,
}));

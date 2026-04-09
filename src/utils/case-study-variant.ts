// Deterministic per-student case study variant selection.
// Same studentId + moduleId always returns the same variant index,
// so the student always sees the same case study across sessions.

export interface CaseStudyVariant {
  title: string;
  scenario: string;
  questions: string[];
}

interface ModuleWithPool {
  caseStudy: CaseStudyVariant;
  caseStudyPool?: CaseStudyVariant[];
}

/** djb2-inspired hash, returns a 32-bit integer (may be negative). */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash | 0; // keep as 32-bit integer
  }
  return hash;
}

/**
 * Returns the variant index (0-based) assigned to this student for this module.
 * Returns -1 if there is no pool (i.e. use the default caseStudy).
 */
export function getCaseStudyVariantIndex(
  studentId: string,
  moduleId: number,
  poolLength: number
): number {
  if (poolLength <= 0) return -1;
  const hash = djb2Hash(`${studentId}-${moduleId}`);
  return Math.abs(hash) % poolLength;
}

/**
 * Returns the case study variant and its index for the given student and module.
 * Falls back to the default caseStudy (variantIndex = -1) if no pool exists.
 */
export function getStudentCaseStudy(
  module: ModuleWithPool,
  studentId: string,
  moduleId: number
): { variant: CaseStudyVariant; variantIndex: number } {
  const pool = module.caseStudyPool;
  if (!pool || pool.length === 0) {
    return { variant: module.caseStudy, variantIndex: -1 };
  }
  const idx = getCaseStudyVariantIndex(studentId, moduleId, pool.length);
  return { variant: pool[idx], variantIndex: idx };
}

export type CourseId = 'infosec' | 'crypto';

export const COURSES = {
  infosec: {
    id: 'infosec' as CourseId,
    name: 'Pengujian Keamanan Informasi',
    shortName: 'InfoSec',
    moduleMin: 1,
    moduleMax: 16,
    description: 'SOC, pentesting, dan analisis keamanan siber',
    meetingCount: 16,
  },
  crypto: {
    id: 'crypto' as CourseId,
    name: 'Kriptografi',
    shortName: 'Kriptografi',
    moduleMin: 101,
    moduleMax: 105,
    description: 'Sandi klasik, AES, RSA, dan mode operasi',
    meetingCount: 5,
  },
};

export function isValidModuleId(id: number, course: CourseId): boolean {
  const c = COURSES[course];
  return id >= c.moduleMin && id <= c.moduleMax;
}

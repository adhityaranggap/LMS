import { describe, it, expect } from 'vitest';

// Test the student ID regex and sanitization patterns used across routes
const STUDENT_ID_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;

describe('Student ID validation', () => {
  it('should accept valid student IDs', () => {
    expect(STUDENT_ID_REGEX.test('AB12345')).toBe(true);
    expect(STUDENT_ID_REGEX.test('student_01')).toBe(true);
    expect(STUDENT_ID_REGEX.test('stu-001')).toBe(true);
    expect(STUDENT_ID_REGEX.test('A')).toBe(true);
  });

  it('should reject invalid student IDs', () => {
    expect(STUDENT_ID_REGEX.test('')).toBe(false);
    expect(STUDENT_ID_REGEX.test('a'.repeat(51))).toBe(false);
    expect(STUDENT_ID_REGEX.test('hello world')).toBe(false); // space
    expect(STUDENT_ID_REGEX.test('test@user')).toBe(false); // @
    expect(STUDENT_ID_REGEX.test('<script>')).toBe(false); // XSS
    expect(STUDENT_ID_REGEX.test("'; DROP TABLE--")).toBe(false); // SQL injection
  });
});

describe('CSV injection prevention', () => {
  // escapeCsvField from lecturer.routes.ts
  function escapeCsvField(val: string): string {
    if (typeof val !== 'string') return String(val ?? '');
    if (/^[=+\-@\t\r]/.test(val)) {
      return "'" + val;
    }
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  }

  it('should escape formula injection chars', () => {
    expect(escapeCsvField('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(escapeCsvField('+cmd|echo')).toBe("'+cmd|echo");
    expect(escapeCsvField('-evil')).toBe("'-evil");
    expect(escapeCsvField('@import')).toBe("'@import");
  });

  it('should quote fields with commas', () => {
    expect(escapeCsvField('hello,world')).toBe('"hello,world"');
  });

  it('should escape double quotes', () => {
    expect(escapeCsvField('say "hello"')).toBe('"say ""hello"""');
  });

  it('should pass through safe values', () => {
    expect(escapeCsvField('normal text')).toBe('normal text');
    expect(escapeCsvField('12345')).toBe('12345');
  });
});

describe('Module ID validation', () => {
  it('should validate module ID range', () => {
    // InfoSec: 1-14, Crypto: 101-107
    const isValidModuleId = (id: number) =>
      (id >= 1 && id <= 14) || (id >= 101 && id <= 200);

    expect(isValidModuleId(1)).toBe(true);
    expect(isValidModuleId(14)).toBe(true);
    expect(isValidModuleId(101)).toBe(true);
    expect(isValidModuleId(107)).toBe(true);
    expect(isValidModuleId(0)).toBe(false);
    expect(isValidModuleId(-1)).toBe(false);
    expect(isValidModuleId(15)).toBe(false);
    expect(isValidModuleId(99)).toBe(false);
  });
});

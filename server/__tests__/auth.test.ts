import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../auth';

// Set up minimal env for tests
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-testing-purposes-abc123';
});

describe('Password hashing', () => {
  it('should hash and verify a password', () => {
    const password = 'TestPassword123!';
    const { hash, salt } = hashPassword(password);

    expect(hash).toBeTruthy();
    expect(salt).toBeTruthy();
    expect(hash).not.toBe(password);

    const isValid = verifyPassword(password, hash, salt);
    expect(isValid).toBe(true);
  });

  it('should reject wrong password', () => {
    const { hash, salt } = hashPassword('correct-password');
    const isValid = verifyPassword('wrong-password', hash, salt);
    expect(isValid).toBe(false);
  });

  it('should generate unique salts', () => {
    const { salt: salt1 } = hashPassword('same-password');
    const { salt: salt2 } = hashPassword('same-password');
    expect(salt1).not.toBe(salt2);
  });
});

describe('Token generation and verification', () => {
  it('should generate and verify a valid token', () => {
    const token = generateToken('user1', 'student', 'infosec', 1);
    expect(token).toBeTruthy();
    expect(token).toContain('.');

    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.id).toBe('user1');
    expect(payload!.role).toBe('student');
    expect(payload!.course).toBe('infosec');
    expect(payload!.tenant_id).toBe(1);
  });

  it('should reject token with invalid signature', () => {
    const token = generateToken('user1', 'student');
    const [payload] = token.split('.');
    const tamperedToken = `${payload}.deadbeef`;

    const result = verifyToken(tamperedToken);
    expect(result).toBeNull();
  });

  it('should reject token with invalid format', () => {
    expect(verifyToken('')).toBeNull();
    expect(verifyToken('no-dot-here')).toBeNull();
    expect(verifyToken('a.b.c')).toBeNull();
  });

  it('should generate tokens for different roles', () => {
    const roles = ['student', 'lecturer', 'tenant_admin', 'super_admin'] as const;
    for (const role of roles) {
      const token = generateToken('user1', role);
      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.role).toBe(role);
    }
  });
});

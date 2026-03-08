import { describe, it, expect, beforeAll } from 'vitest';
import { encryptData, decryptData, isEncryptedData, safeDecrypt } from '../crypto';

beforeAll(() => {
  // 64 hex chars = 32 bytes key
  process.env.PHOTO_ENCRYPTION_KEY = 'a'.repeat(64);
});

describe('Encrypt/Decrypt round-trip', () => {
  it('should encrypt and decrypt a string', () => {
    const original = 'Hello, World!';
    const encrypted = encryptData(original);
    expect(encrypted).not.toBe(original);

    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should encrypt and decrypt JSON data', () => {
    const data = JSON.stringify({ descriptor: [0.1, 0.2, 0.3], label: 'test' });
    const encrypted = encryptData(data);
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(data);
    expect(JSON.parse(decrypted)).toEqual({ descriptor: [0.1, 0.2, 0.3], label: 'test' });
  });

  it('should produce different ciphertexts for same plaintext (random IV)', () => {
    const text = 'same text';
    const enc1 = encryptData(text);
    const enc2 = encryptData(text);
    expect(enc1).not.toBe(enc2);
  });

  it('should handle empty string', () => {
    const encrypted = encryptData('');
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle Unicode text', () => {
    const text = 'Mahasiswa Universitas Bina Insani ';
    const encrypted = encryptData(text);
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(text);
  });
});

describe('isEncryptedData', () => {
  it('should detect encrypted data', () => {
    const encrypted = encryptData('test');
    expect(isEncryptedData(encrypted)).toBe(true);
  });

  it('should reject raw base64 photos', () => {
    expect(isEncryptedData('data:image/jpeg;base64,/9j/4AAQ')).toBe(false);
  });

  it('should reject plain text', () => {
    expect(isEncryptedData('hello world')).toBe(false);
  });
});

describe('safeDecrypt', () => {
  it('should decrypt encrypted data', () => {
    const encrypted = encryptData('secret');
    expect(safeDecrypt(encrypted)).toBe('secret');
  });

  it('should return null for null input', () => {
    expect(safeDecrypt(null)).toBeNull();
  });

  it('should return unencrypted data as-is (migration support)', () => {
    const raw = 'data:image/jpeg;base64,abc123';
    expect(safeDecrypt(raw)).toBe(raw);
  });
});

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.PHOTO_ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('PHOTO_ENCRYPTION_KEY must be set and at least 32 hex chars. Generate with: openssl rand -hex 32');
  }
  return Buffer.from(key, 'hex');
}

export function encryptData(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Format: base64(iv + tag + ciphertext)
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString('base64');
}

export function decryptData(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedBase64, 'base64');

  if (combined.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid encrypted data');
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Check if data looks like it was encrypted by us (base64 with sufficient length).
 * Used to handle migration: old unencrypted data vs new encrypted data.
 */
export function isEncryptedData(data: string): boolean {
  // Encrypted data is base64 and at least IV_LENGTH + TAG_LENGTH bytes when decoded
  try {
    if (data.startsWith('data:image/')) return false; // raw base64 photo
    const buf = Buffer.from(data, 'base64');
    // Re-encode to check it's valid base64
    if (buf.toString('base64') !== data) return false;
    return buf.length >= IV_LENGTH + TAG_LENGTH + 1;
  } catch {
    return false;
  }
}

/**
 * Safely decrypt data, returning original if it's not encrypted (migration support).
 */
export function safeDecrypt(data: string | null): string | null {
  if (!data) return null;
  if (!isEncryptedData(data)) return data; // unencrypted legacy data
  try {
    return decryptData(data);
  } catch {
    return data; // fallback to raw if decryption fails
  }
}

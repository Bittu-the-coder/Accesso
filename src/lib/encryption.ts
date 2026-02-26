import CryptoJS from 'crypto-js';

/**
 * Encrypts text with AES encryption using a password
 */
export function encryptText(text: string, password: string): string {
  const encrypted = CryptoJS.AES.encrypt(text, password).toString();
  return encrypted;
}

/**
 * Decrypts AES encrypted text using a password
 */
export function decryptText(encryptedText: string, password: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, password);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error('Failed to decrypt. Invalid password or corrupted data.');
  }
}

/**
 * Generates a secure random password for encryption
 */
export function generateSecurePassword(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Creates a deterministic encryption key from a code
 * This allows the same code to always generate the same encryption key
 */
export function deriveKeyFromCode(code: string): string {
  return CryptoJS.SHA256(
    code + process.env.NEXT_PUBLIC_ENCRYPTION_SALT
  ).toString();
}

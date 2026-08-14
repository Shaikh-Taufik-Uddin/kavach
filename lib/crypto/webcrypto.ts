import { MasterVaultPayload } from '@/lib/types';

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? window.btoa(binary) : '';
}

export function base64ToBuffer(base64: string): Uint8Array {
  if (typeof window === 'undefined') return new Uint8Array(0);
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function generate16CharKey(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
  const randomBytes = new Uint8Array(16);
  window.crypto.getRandomValues(randomBytes);
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += charset[randomBytes[i] % charset.length];
  }
  return result;
}

async function deriveAesKey(secretKey: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = enc.encode(secretKey);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', keyMaterial);

  return window.crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptVault(payload: MasterVaultPayload) {
  const secretKey = generate16CharKey();
  const aesKey = await deriveAesKey(secretKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(payload));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encodedData
  );

  return {
    secretKey,
    encryptedCiphertextBase64: bufferToBase64(ciphertextBuffer),
    ivBase64: bufferToBase64(iv),
  };
}

export async function decryptVault(
  ciphertextBase64: string,
  ivBase64: string,
  secretKey: string
): Promise<MasterVaultPayload> {
  const aesKey = await deriveAesKey(secretKey);
  const ciphertext = base64ToBuffer(ciphertextBase64);
  const iv = base64ToBuffer(ivBase64);

  try {
    // Added 'as BufferSource' to satisfy strict TypeScript DOM typings
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      aesKey,
      ciphertext as BufferSource
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonString) as MasterVaultPayload;
  } catch (error) {
    throw new Error('Decryption failed. Invalid 16-character Secret Key or corrupted data.');
  }
}

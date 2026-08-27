// Utility for client-side zero-knowledge encryption using native WebCrypto API

/**
 * Generates a cryptographically secure, random 16-character alphanumeric string.
 * Example format: A1B2-C3D4-E5F6-G7H8
 */
export function generate16CharKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomArray = new Uint8Array(16);
  window.crypto.getRandomValues(randomArray);
  
  let key = '';
  for (let i = 0; i < 16; i++) {
    key += chars[randomArray[i] % chars.length];
  }
  
  // Format with dashes for readability: XXXX-XXXX-XXXX-XXXX
  return `${key.slice(0, 4)}-${key.slice(4, 8)}-${key.slice(8, 12)}-${key.slice(12, 16)}`;
}

/**
 * Hashes the key string using SHA-256 and imports it as an AES-GCM CryptoKey.
 */
export async function deriveCryptoKey(keyString: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  // We hash the raw key string without dashes (or with dashes, as long as it's consistent)
  const keyData = encoder.encode(keyString.replace(/-/g, ''));
  
  // Hash to get 256 bits (32 bytes)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', keyData);
  
  return window.crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * ArrayBuffer to Base64 string converter
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Base64 string to ArrayBuffer converter
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export interface EncryptedPayload {
  ciphertextBase64: string;
  ivBase64: string;
}

/**
 * Stringifies a JSON payload, generates a random 12-byte IV, and encrypts it using AES-GCM.
 */
export async function encryptPayload(payloadJson: object, keyString: string): Promise<EncryptedPayload> {
  const cryptoKey = await deriveCryptoKey(keyString);
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payloadJson));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    cryptoKey,
    encodedPayload
  );
  
  return {
    ciphertextBase64: bufferToBase64(encryptedBuffer),
    ivBase64: bufferToBase64(iv.buffer)
  };
}

/**
 * Decrypts an AES-GCM encrypted payload using the provided key string and initialization vector.
 */
export async function decryptPayload(ciphertextBase64: string, ivBase64: string, keyString: string): Promise<any> {
  const cryptoKey = await deriveCryptoKey(keyString);
  
  const ivBuffer = base64ToBuffer(ivBase64);
  const ciphertextBuffer = base64ToBuffer(ciphertextBase64);
  
  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer)
      },
      cryptoKey,
      ciphertextBuffer
    );
    
    const decoder = new TextDecoder();
    const decryptedJsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedJsonString);
  } catch (error) {
    throw new Error("Decryption failed. Incorrect key or corrupted data.");
  }
}

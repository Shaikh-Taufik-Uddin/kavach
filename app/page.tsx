"use client";

import { useState } from 'react';
import { parseWhatsAppText } from '@/lib/utils/whatsapp-parser';
import { extractTextFromScreenshot } from '@/lib/ai/gemini-vision';
import { mergeAndSortLogs } from '@/lib/utils/fusion-engine';
import { deriveKey, encryptData, decryptData } from '@/lib/crypto/webcrypto';
import { ParsedLogItem } from '@/lib/types';

export default function Home() {
  const [txtFile, setTxtFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [results, setResults] = useState<ParsedLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Phase 2 state
  const [passcode, setPasscode] = useState('');
  const [encryptedPayload, setEncryptedPayload] = useState<{ ciphertextBase64: string, ivBase64: string } | null>(null);
  const [decryptedData, setDecryptedData] = useState<ParsedLogItem[] | null>(null);
  const [cryptoLoading, setCryptoLoading] = useState(false);

  const handleRunParsers = async () => {
    setLoading(true);
    try {
      let whatsappLogs: ParsedLogItem[] = [];
      let ocrLogs: ParsedLogItem[] = [];

      if (txtFile) {
        const text = await txtFile.text();
        whatsappLogs = parseWhatsAppText(text);
      }

      if (imgFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(imgFile);
        });
        const base64Data = await base64Promise;
        ocrLogs = await extractTextFromScreenshot(base64Data, imgFile.type);
      }

      const merged = mergeAndSortLogs(whatsappLogs, ocrLogs);
      setResults(merged);
    } catch (error) {
      console.error("Error running parsers:", error);
      alert("Error occurred. See console.");
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = async () => {
    if (!passcode || results.length === 0) {
      alert("Please generate results first and enter a passcode.");
      return;
    }
    setCryptoLoading(true);
    try {
      const key = await deriveKey(passcode);
      const encrypted = await encryptData(results, key);
      setEncryptedPayload(encrypted);
    } catch (error) {
      console.error("Encryption error:", error);
      alert("Encryption failed.");
    } finally {
      setCryptoLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!passcode || !encryptedPayload) {
      alert("Please encrypt data first and ensure passcode is entered.");
      return;
    }
    setCryptoLoading(true);
    try {
      const key = await deriveKey(passcode);
      const decrypted = await decryptData(encryptedPayload.ciphertextBase64, encryptedPayload.ivBase64, key);
      setDecryptedData(decrypted);
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Decryption failed. Incorrect passcode or corrupted data?");
    } finally {
      setCryptoLoading(false);
    }
  };

  return (
    <div>
      <h1>Phase 1: Ingestion & Parsing Engine Test UI</h1>
      
      <div style={{ marginTop: '20px' }}>
        <label>WhatsApp TXT Upload: </label>
        <input 
          type="file" 
          accept=".txt" 
          onChange={(e) => setTxtFile(e.target.files?.[0] || null)} 
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Screenshot Upload: </label>
        <input 
          type="file" 
          accept=".png,.jpg,.jpeg" 
          onChange={(e) => setImgFile(e.target.files?.[0] || null)} 
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleRunParsers} disabled={loading}>
          {loading ? "Processing..." : "Run Parsers"}
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Results:</h2>
        <pre style={{ background: '#eee', padding: '10px', overflowX: 'auto' }}>
          {results.length > 0 ? JSON.stringify(results, null, 2) : "No results yet."}
        </pre>
      </div>

      <hr style={{ margin: '40px 0' }} />

      <h1>Phase 2: Encryption Engine Test</h1>

      <div style={{ marginTop: '20px' }}>
        <label>Passcode: </label>
        <input 
          type="text" 
          maxLength={16} 
          placeholder="Enter 16-char passcode" 
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleEncrypt} disabled={cryptoLoading || results.length === 0}>
          {cryptoLoading ? "Working..." : "Encrypt Pipeline"}
        </button>
        {' '}
        <button onClick={handleDecrypt} disabled={cryptoLoading || !encryptedPayload}>
          {cryptoLoading ? "Working..." : "Decrypt Pipeline"}
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Encrypted Payload:</h2>
        <pre style={{ background: '#eee', padding: '10px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {encryptedPayload ? JSON.stringify(encryptedPayload, null, 2) : "No encrypted data yet."}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Decrypted Data:</h2>
        <pre style={{ background: '#eee', padding: '10px', overflowX: 'auto' }}>
          {decryptedData ? JSON.stringify(decryptedData, null, 2) : "No decrypted data yet."}
        </pre>
      </div>
    </div>
  );
}

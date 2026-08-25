"use client";

import { useState, useEffect } from 'react';
import { parseWhatsAppText } from '@/lib/utils/whatsapp-parser';
import { extractTextFromScreenshot } from '@/lib/ai/gemini-vision';
import { mergeAndSortLogs } from '@/lib/utils/fusion-engine';
import { deriveKey, encryptData, decryptData } from '@/lib/crypto/webcrypto';
import { ParsedLogItem } from '@/lib/types';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { saveEncryptedLog, fetchEncryptedLogs } from '@/lib/firebase/db';
import { generatePOSHReport } from '@/lib/ai/posh-analyzer';

export default function Home() {
  // Phase 1 state
  const [txtFile, setTxtFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [results, setResults] = useState<ParsedLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Phase 2 state
  const [passcode, setPasscode] = useState('');
  const [encryptedPayload, setEncryptedPayload] = useState<{ ciphertextBase64: string, ivBase64: string } | null>(null);
  const [decryptedData, setDecryptedData] = useState<ParsedLogItem[] | null>(null);
  const [cryptoLoading, setCryptoLoading] = useState(false);

  // Phase 3 state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [cloudLogs, setCloudLogs] = useState<{ ciphertextBase64: string, ivBase64: string }[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);

  // Phase 4 state
  const [poshReport, setPoshReport] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log("Login failed, trying register...");
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (regErr) {
        console.error("Auth error:", regErr);
        alert("Authentication failed.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveToFirebase = async () => {
    if (!user || !encryptedPayload) return;
    setCloudLoading(true);
    try {
      await saveEncryptedLog(user.uid, encryptedPayload.ciphertextBase64, encryptedPayload.ivBase64);
      alert("Saved to Firebase successfully.");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save to Firebase.");
    } finally {
      setCloudLoading(false);
    }
  };

  const handleFetchFromFirebase = async () => {
    if (!user) return;
    setCloudLoading(true);
    try {
      const logs = await fetchEncryptedLogs(user.uid);
      setCloudLogs(logs);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to fetch from Firebase.");
    } finally {
      setCloudLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!decryptedData || decryptedData.length === 0) {
      alert("Please decrypt some logs first.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const report = await generatePOSHReport(decryptedData);
      setPoshReport(report);
    } catch (error) {
      console.error("Report generation error:", error);
      alert("Failed to generate report.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      <h1>Phase 3: Auth</h1>
      <div style={{ marginTop: '20px', background: '#eef', padding: '10px' }}>
        {user ? (
          <div>
            <p>Logged in as: {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            {' '}
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            {' '}
            <button onClick={handleLogin} disabled={authLoading}>{authLoading ? 'Working...' : 'Login / Register'}</button>
          </div>
        )}
      </div>

      <hr style={{ margin: '40px 0' }} />

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

      <hr style={{ margin: '40px 0' }} />

      <h1>Phase 3: Cloud Vault</h1>
      
      <div style={{ marginTop: '20px' }}>
        {user ? (
          <>
            <button onClick={handleSaveToFirebase} disabled={cloudLoading || !encryptedPayload}>
              {cloudLoading ? "Working..." : "Save to Firebase"}
            </button>
            {' '}
            <button onClick={handleFetchFromFirebase} disabled={cloudLoading}>
              {cloudLoading ? "Working..." : "Fetch from Firebase"}
            </button>
          </>
        ) : (
          <p>Please login at the top to access Cloud Vault.</p>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Fetched Cloud Logs:</h2>
        <pre style={{ background: '#eee', padding: '10px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {cloudLogs.length > 0 ? JSON.stringify(cloudLogs, null, 2) : "No cloud data fetched yet."}
        </pre>
      </div>

      <hr style={{ margin: '40px 0' }} />

      <h1>Phase 4: POSH Legal Synthesis</h1>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleGenerateReport} disabled={isAnalyzing || !decryptedData}>
          {isAnalyzing ? "Analyzing..." : "Generate Legal Report"}
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>POSH Report:</h2>
        <pre style={{ background: '#eee', padding: '10px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {poshReport ? JSON.stringify(poshReport, null, 2) : "No report generated yet."}
        </pre>
      </div>
    </div>
  );
}

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
import { Loader2, ShieldCheck, FileText, Upload, Lock, DownloadCloud, AlertTriangle } from 'lucide-react';

export default function Home() {
  // Phase 1 state
  const [txtFile, setTxtFile] = useState<File | null>(null);
  const [imgFiles, setImgFiles] = useState<File[]>([]);
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

      if (imgFiles.length > 0) {
        const imagePromises = imgFiles.map(async (file) => {
          return new Promise<ParsedLogItem[]>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const base64 = reader.result as string;
                const result = await extractTextFromScreenshot(base64, file.type);
                resolve(result);
              } catch (err) {
                reject(err);
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        const imageResultsArray = await Promise.all(imagePromises);
        ocrLogs = imageResultsArray.flat();
      }

      const merged = mergeAndSortLogs(whatsappLogs, ocrLogs);
      setResults(merged);
    } catch (error) {
      console.error("Parser execution failed:", error);
      alert("Failed to process evidence. Check console for details.");
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <ShieldCheck className="h-6 w-6 text-indigo-400" />
          <h1 className="text-xl font-bold tracking-tight">KAVACH: <span className="font-light text-slate-300">POSH Legal Compliance Vault</span></h1>
        </div>
        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300">{user.email}</span>
              <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md text-sm transition-colors">Sign Out</button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="px-3 py-1.5 rounded-md text-sm text-black border border-slate-700 w-full sm:w-auto focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="px-3 py-1.5 rounded-md text-sm text-black border border-slate-700 w-full sm:w-auto focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button onClick={handleLogin} disabled={authLoading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50">
                {authLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                Login / Register
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Input & Vault */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Evidence Ingestion */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-indigo-500" />
              Phase 1: Evidence Ingestion
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp TXT Export</label>
                <input type="file" accept=".txt" onChange={(e) => setTxtFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Screenshot Evidence</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setImgFiles(e.target.files ? Array.from(e.target.files) : [])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                <p className="mt-1 text-xs text-slate-500">{imgFiles.length > 0 ? `${imgFiles.length} file(s) selected` : "No files chosen"}</p>
              </div>
              <button onClick={handleRunParsers} disabled={loading || (!txtFile && imgFiles.length === 0)} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {loading ? "Processing Evidence..." : "Run Parsers"}
              </button>

              {results.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Parsed {results.length} log items successfully.</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Zero-Knowledge Vault */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center mb-4">
              <Lock className="h-5 w-5 mr-2 text-indigo-500" />
              Phase 2/3: Zero-Knowledge Vault
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vault Passcode (16-char)</label>
                <input type="password" maxLength={16} placeholder="Enter decryption key" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleEncrypt} disabled={cryptoLoading || results.length === 0 || !passcode} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                   {cryptoLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                   Encrypt
                </button>
                <button onClick={handleDecrypt} disabled={cryptoLoading || (!encryptedPayload && cloudLogs.length === 0) || !passcode} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                   {cryptoLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                   Decrypt
                </button>
              </div>

              {encryptedPayload && (
                <div className="mt-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <details>
                    <summary className="cursor-pointer font-medium text-slate-600 flex items-center select-none">
                      <ShieldCheck className="h-4 w-4 mr-1 text-green-600 inline" />
                      Data Encrypted & Secured
                    </summary>
                    <div className="mt-2 text-slate-500 break-all space-y-1">
                      <p><strong>IV:</strong> {encryptedPayload.ivBase64}</p>
                      <p className="line-clamp-3" title={encryptedPayload.ciphertextBase64}><strong>Cipher:</strong> {encryptedPayload.ciphertextBase64}</p>
                    </div>
                  </details>
                </div>
              )}

              <hr className="border-slate-100" />

              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleSaveToFirebase} disabled={cloudLoading || !encryptedPayload || !user} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                   {cloudLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-3 w-3 mr-2" />}
                   Save Cloud
                </button>
                <button onClick={handleFetchFromFirebase} disabled={cloudLoading || !user} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                   {cloudLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <DownloadCloud className="h-3 w-3 mr-2" />}
                   Fetch Cloud
                </button>
              </div>
              {cloudLogs.length > 0 && (
                <p className="text-xs text-slate-500 text-center font-medium">Successfully fetched {cloudLogs.length} cloud payloads.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Synthesis Report */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                Phase 4: POSH Legal Synthesis
              </h2>
              <button onClick={handleGenerateReport} disabled={isAnalyzing || !decryptedData} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto justify-center">
                {isAnalyzing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                {isAnalyzing ? "Analyzing Evidence..." : "Generate AI Report"}
              </button>
            </div>

            <div className="flex-grow rounded-lg bg-slate-50 border border-slate-200 p-4 sm:p-6 overflow-y-auto">
              {!poshReport ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <ShieldCheck className="h-16 w-16 mb-4 text-slate-300" />
                  <p className="font-medium text-slate-500 text-center">No synthesis report available.</p>
                  <p className="text-sm text-slate-400 mt-2 text-center max-w-md">Upload evidence, encrypt to the vault, then decrypt and generate the AI report to view the analysis.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Case Summary</h3>
                    <p className="text-slate-800 leading-relaxed text-sm">{poshReport.caseSummary}</p>
                  </div>

                  {poshReport.identifiedParties && poshReport.identifiedParties.length > 0 && (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Identified Parties</h3>
                      <div className="flex flex-wrap gap-2">
                        {poshReport.identifiedParties.map((party: string, idx: number) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
                            {party}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {poshReport.potentialViolations && poshReport.potentialViolations.length > 0 && (
                    <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm">
                      <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Potential POSH Violations
                      </h3>
                      <ul className="space-y-2">
                        {poshReport.potentialViolations.map((violation: string, idx: number) => (
                          <li key={idx} className="flex items-start text-sm text-red-800 font-medium">
                            <span className="mr-2 mt-0.5">•</span>
                            <span>{violation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {poshReport.chronologicalTimeline && poshReport.chronologicalTimeline.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Chronological Timeline</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 font-medium">Timestamp</th>
                              <th className="px-4 py-3 font-medium">Sender</th>
                              <th className="px-4 py-3 font-medium">Description</th>
                              <th className="px-4 py-3 font-medium text-center">Severity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {poshReport.chronologicalTimeline.map((event: any, idx: number) => {
                              const dateStr = new Date(event.timestamp).toLocaleString();
                              
                              let severityBadge = "bg-slate-100 text-slate-700 border border-slate-200";
                              if (event.severityScore >= 8) severityBadge = "bg-red-100 text-red-700 border border-red-200";
                              else if (event.severityScore >= 5) severityBadge = "bg-orange-100 text-orange-700 border border-orange-200";
                              else if (event.severityScore > 0) severityBadge = "bg-yellow-100 text-yellow-700 border border-yellow-200";

                              return (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{dateStr}</td>
                                  <td className="px-4 py-3 font-medium text-slate-800">{event.sender}</td>
                                  <td className="px-4 py-3 text-slate-600 min-w-[200px]">{event.incidentDescription}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${severityBadge}`}>
                                      {event.severityScore}/10
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { parseWhatsAppText } from '@/lib/utils/whatsapp-parser';
import { extractTextFromScreenshot } from '@/lib/ai/gemini-vision';
import { mergeAndSortLogs } from '@/lib/utils/fusion-engine';
import { ParsedLogItem } from '@/lib/types';

export default function Home() {
  const [txtFile, setTxtFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [results, setResults] = useState<ParsedLogItem[]>([]);
  const [loading, setLoading] = useState(false);

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
        <pre style={{ background: '#eee', padding: '10px' }}>
          {results.length > 0 ? JSON.stringify(results, null, 2) : "No results yet."}
        </pre>
      </div>
    </div>
  );
}

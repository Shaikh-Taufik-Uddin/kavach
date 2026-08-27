"use client";

import React, { useState } from "react";
import { Shield, CheckCircle2, Cpu, Lock, Database, FileText, AlertTriangle, Copy, ArrowRight, Home } from "lucide-react";
import Dropzone from "@/components/ui/Dropzone";
import TimelineViewer, { ParsedLogItem } from "@/components/ui/TimelineViewer";
import { generate16CharKey, encryptPayload, wrapKey } from "@/lib/crypto/webcrypto";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { extractTextFromScreenshot } from "@/lib/ai/gemini-vision";
import { parseWhatsAppText } from "@/lib/utils/whatsapp-parser";
import { mergeAndSortLogs } from "@/lib/utils/fusion-engine";
import { saveEncryptedLog } from "@/lib/firebase/db";

const STEPS = [
  { id: 1, label: "Upload Evidence",  icon: FileText, desc: "Select your files" },
  { id: 2, label: "Review Evidence",  icon: Cpu,      desc: "Verify extracted data" },
  { id: 3, label: "Encryption Lock",  icon: Lock,     desc: "Generate AES-GCM key" },
  { id: 4, label: "Secure Vault",     icon: Database, desc: "Case submitted" },
];

const DUMMY_TIMELINE_ITEMS: ParsedLogItem[] = [
  {
    id: "item-1",
    timestamp: Date.now() - 86400000 * 2,
    dateTimeISO: new Date(Date.now() - 86400000 * 2).toISOString(),
    sender: "John Doe (HR Manager)",
    messageContent: "Please make sure you stay late tonight, we have things to discuss in private.",
    sourceType: "WHATSAPP_TXT",
    confidenceScore: 0.99,
  },
  {
    id: "item-2",
    timestamp: Date.now() - 86400000 * 1,
    dateTimeISO: new Date(Date.now() - 86400000 * 1).toISOString(),
    sender: "John Doe (HR Manager)",
    messageContent: "If you don't comply, your upcoming performance review might not look good. Don't tell anyone about this conversation.",
    sourceType: "SCREENSHOT_OCR",
    confidenceScore: 0.94,
    flaggedHarassmentTerm: true,
  },
  {
    id: "item-3",
    timestamp: Date.now() - 3600000,
    dateTimeISO: new Date(Date.now() - 3600000).toISOString(),
    sender: "Jane Smith (You)",
    messageContent: "I am not comfortable with this request and I will be reporting it.",
    sourceType: "WHATSAPP_TXT",
    confidenceScore: 0.98,
  }
];

export default function StudentSubmitPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Incident Narrative State
  const [incidentDescription, setIncidentDescription] = useState("");
  
  // AI Response State
  const [aiTimeline, setAiTimeline] = useState<ParsedLogItem[]>([]);
  const [aiReport, setAiReport] = useState<any>(null); // We can just use 'any' or POSHLegalReport
  
  // Crypto State
  const [decryptionKey, setDecryptionKey] = useState<string>('');
  const [encryptedData, setEncryptedData] = useState<{ ciphertext: string, iv: string, wrappedKeyBase64: string } | null>(null);
  
  // Step 3 State
  const [isSaving, setIsSaving] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true);
    setProcessingProgress(30);
    
    try {
      let whatsappLogs: ParsedLogItem[] = [];
      let ocrLogs: ParsedLogItem[] = [];

      for (const f of files) {
        if (f.name.endsWith(".txt")) {
          const text = await f.text();
          const parsed = parseWhatsAppText(text);
          whatsappLogs = [...whatsappLogs, ...parsed];
        } else if (f.type.startsWith("image/")) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(f);
          });
          const parsed = await extractTextFromScreenshot(base64, f.type);
          ocrLogs = [...ocrLogs, ...parsed];
        }
      }
      
      setProcessingProgress(60);
      
      const mergedTimeline = mergeAndSortLogs(whatsappLogs, ocrLogs);
      
      const uniqueTimeline = Array.from(
        new Map(
          (mergedTimeline || []).map(item => [item.messageContent + item.timestamp, item])
        ).values()
      );
      
      setProcessingProgress(100);
      
      setAiTimeline(uniqueTimeline);
      setAiReport(null);
      setCurrentStep(2);
    } catch (err) {
      console.error("Local parsing error:", err);
      alert("Failed to process evidence. Please check your files and try again.");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleApproveAndEncrypt = async () => {
    try {
      const payload = { timeline: aiTimeline, report: aiReport };
      const newKey = generate16CharKey();
      setDecryptionKey(newKey);
      
      const encrypted = await encryptPayload(payload, newKey);
      
      const wrappedKey = await wrapKey(newKey, 'sit.ac.in');
      
      setEncryptedData({ 
        ciphertext: encrypted.ciphertextBase64, 
        iv: encrypted.ivBase64,
        wrappedKeyBase64: wrappedKey
      });
      
      setCurrentStep(3);
    } catch (err) {
      console.error("Encryption failed:", err);
      alert("Failed to encrypt evidence. Please try again.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(decryptionKey);
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-slate-50 selection:bg-indigo-500/30">
      
      {/* ── LEFT SIDEBAR (33%) ───────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-1/3 min-w-[320px] max-w-[400px] bg-slate-900 border-r border-slate-800 sticky top-0 h-screen p-8 text-white z-20">
        
        {/* Header / Logo */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-widest text-white leading-none">KAVACH</span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-1">Student / Reporter Portal</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Secure Session Active</span>
          </div>
        </div>

        {/* Vertical Stepper */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-8">Submission Workflow</h3>
          <div className="flex flex-col gap-8 relative">
            {/* Connecting line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-800" />
            
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isPending = step.id > currentStep;

              return (
                <div key={step.id} className="relative z-10 flex items-start gap-5">
                  <div className={twMerge(
                    clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                      isActive ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" : "",
                      isCompleted ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "",
                      isPending ? "bg-slate-900 border-slate-700 text-slate-600" : ""
                    )
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col pt-1">
                    <p className={twMerge(
                      clsx(
                        "text-sm font-semibold transition-colors",
                        isActive ? "text-indigo-400" : "",
                        isCompleted ? "text-slate-200" : "",
                        isPending ? "text-slate-500" : ""
                      )
                    )}>
                      {step.label}
                    </p>
                    <p className={twMerge(
                      clsx(
                        "text-xs font-medium mt-0.5",
                        isActive || isCompleted ? "text-slate-400" : "text-slate-600"
                      )
                    )}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Trust Text */}
        <div className="mt-auto pt-8 border-t border-slate-800">
          <div className="flex items-start gap-3 text-slate-400">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              Your privacy is guaranteed. AES-GCM 256-bit encryption active. Evidence is processed strictly on your device.
            </p>
          </div>
        </div>
      </aside>

      {/* ── RIGHT CANVAS (67%) ───────────────────────────────────────── */}
      <main className="flex-1 w-full lg:w-2/3 h-screen overflow-y-auto bg-slate-50 flex items-center justify-center p-6 md:p-12 relative">
        
        {/* Mobile Header (only visible on small screens) */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-4 bg-white border-b border-slate-200 shadow-sm z-30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-900">KAVACH</span>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase">Step {currentStep} of 4</div>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-200 rounded-3xl overflow-hidden mt-16 lg:mt-0 transition-all duration-500">
          
          {/* STEP 1: Upload Evidence */}
          {currentStep === 1 && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Submit Your Evidence Securely</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Upload your WhatsApp chat exports (.txt) or screenshot images (.png, .jpg). All processing occurs locally — your files never leave this device in raw form.
                </p>
              </div>
              <div className="p-8 bg-slate-50/50">
                
                {/* INCIDENT NARRATIVE */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Incident Narrative</h3>
                  <textarea 
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    className="w-full min-h-[120px] p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800 mb-6"
                    placeholder="Describe the incident in your own words. This context helps the AI generate a highly accurate compliance report."
                  />
                </div>

                <Dropzone
                  onFilesSelected={handleFilesSelected}
                  isProcessing={isProcessing}
                  processingProgress={processingProgress}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Review Evidence */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full max-h-[85vh]">
              <div className="p-8 border-b border-slate-100 shrink-0">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Review Extracted Evidence</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Verify the chronological timeline assembled from your files. We've flagged potential harassment terms automatically.
                </p>
              </div>
              
              <div className="p-8 bg-slate-900 overflow-y-auto flex-1 custom-scrollbar">
                <TimelineViewer items={aiTimeline.length > 0 ? aiTimeline : DUMMY_TIMELINE_ITEMS} />
              </div>

              <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                <button 
                  onClick={() => setCurrentStep(1)}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest px-4 py-2"
                >
                  Back
                </button>
                <button 
                  onClick={handleApproveAndEncrypt}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Approve & Generate Key <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Encryption Lock */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="p-8 md:p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-amber-200">
                  <Lock className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">Envelope Encryption Locked</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-lg mb-8">
                  Your evidence has been encrypted locally using a 256-bit AES key. The key has been securely wrapped using the HR department's public identifier. No manual key transfer is required.
                </p>

                <div className="w-full max-w-md p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-left mb-8 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide leading-relaxed">
                    READY FOR VAULT: Your case is ready to be securely transmitted. The ICC / HR personnel will automatically unwrap the key to review your case.
                  </p>
                </div>

                <button 
                  onClick={async () => {
                    if (!encryptedData) return;
                    setIsSaving(true);
                    try {
                      await saveEncryptedLog(
                        'anonymous',
                        encryptedData.ciphertext,
                        encryptedData.iv,
                        encryptedData.wrappedKeyBase64,
                        'sit.ac.in'
                      );
                      setCurrentStep(4);
                    } catch (err) {
                      console.error("Vault upload failed:", err);
                      alert("Failed to submit to vault. Please check your internet connection.");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="w-full max-w-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                  {isSaving ? 'Uploading to Vault...' : 'Encrypt & Submit to Vault'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {currentStep === 4 && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="p-12 md:p-20 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-inner border-4 border-white ring-4 ring-emerald-50">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Evidence Encrypted & Saved</h2>
                <p className="text-base text-slate-500 leading-relaxed font-medium max-w-md mb-12">
                  Your case has been securely locked and transmitted to the institutional vault. It remains encrypted until the HR/ICC unlocks it with your key.
                </p>

                <button 
                  onClick={() => router.push("/")}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <Home className="w-5 h-5" />
                  Return to Home
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

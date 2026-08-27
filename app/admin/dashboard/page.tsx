'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  ArrowLeft,
  Activity,
  AlertCircle,
  Database
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

import AdminDashboardTable, { FirestoreVaultDocument } from '../../../components/ui/AdminDashboardTable';
import UnlockModal from '../../../components/ui/UnlockModal';
import LegalReportViewer, { POSHLegalReport } from '../../../components/ui/LegalReportViewer';
import TimelineViewer, { ParsedLogItem } from '../../../components/ui/TimelineViewer';
import { generatePOSHReport } from '../../../lib/ai/posh-analyzer';
import { fetchAllVaultLogs } from '../../../lib/firebase/db';
import { decryptPayload } from '../../../lib/crypto/webcrypto';

// --- DUMMY DATA ---
// DUMMY_CASES removed for final integration.

const DUMMY_TIMELINE: ParsedLogItem[] = [
  {
    id: 'evt-1',
    timestamp: Date.now() - 100000,
    dateTimeISO: new Date(Date.now() - 100000).toISOString(),
    sender: '+91 9876543210',
    messageContent: 'Hey, are you free tonight? We should go out.',
    sourceType: 'WHATSAPP_TXT',
    confidenceScore: 0.99,
  },
  {
    id: 'evt-2',
    timestamp: Date.now() - 90000,
    dateTimeISO: new Date(Date.now() - 90000).toISOString(),
    sender: 'Victim',
    messageContent: 'I am busy with assignments, please stop texting me this late.',
    sourceType: 'WHATSAPP_TXT',
    confidenceScore: 0.98,
  },
  {
    id: 'evt-3',
    timestamp: Date.now() - 80000,
    dateTimeISO: new Date(Date.now() - 80000).toISOString(),
    sender: '+91 9876543210',
    messageContent: "Come on, don't be a bitch. You know you want to.",
    sourceType: 'SCREENSHOT_OCR',
    confidenceScore: 0.95,
    flaggedHarassmentTerm: true,
  }
];

const DUMMY_REPORT: POSHLegalReport = {
  reportId: 'KV-2026-X89',
  generatedAtISO: new Date().toISOString(),
  tenantDomain: 'sit.ac.in',
  incidentSummary: 'The reported incident involves repeated unsolicited advances and inappropriate language via WhatsApp late at night. The complainant explicitly requested the communication to stop, which was subsequently ignored and followed up with derogatory remarks.',
  totalEvidenceCount: 3,
  dateRangeStart: new Date(Date.now() - 86400000 * 2).toISOString(),
  dateRangeEnd: new Date().toISOString(),
  primaryAllegedOffender: '+91 9876543210 (Unverified)',
  identifiedPlatforms: ['WhatsApp'],
  chronologicalTimeline: DUMMY_TIMELINE,
  applicableLegalSections: ['POSH Act Section 2(n)', 'IPC Section 354D', 'IPC Section 509'],
  cryptographicIntegrityHash: '8a2b9c7de4f5a6b7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1'
};

const DUMMY_AUDIT_LOGS = [
  { id: 'al-1', timestamp: Date.now() - 1000 * 60 * 5, adminUser: 'hr@sit.ac.in', event: 'Successful Decryption Key Entry', caseId: 'KV-2026-X89', ip: '192.168.1.45', status: 'SUCCESS' },
  { id: 'al-2', timestamp: Date.now() - 1000 * 60 * 45, adminUser: 'hr@sit.ac.in', event: 'Dossier Exported as PDF', caseId: 'KV-2026-Y42', ip: '192.168.1.45', status: 'INFO' },
  { id: 'al-3', timestamp: Date.now() - 1000 * 60 * 120, adminUser: 'hr@sit.ac.in', event: 'Failed Decryption Attempt - Invalid Key', caseId: 'KV-2026-X89', ip: '192.168.1.45', status: 'WARNING' },
  { id: 'al-4', timestamp: Date.now() - 1000 * 60 * 60 * 4, adminUser: 'system_admin@sit.ac.in', event: 'Admin Login', caseId: 'N/A', ip: '10.0.0.15', status: 'INFO' },
  { id: 'al-5', timestamp: Date.now() - 1000 * 60 * 60 * 24, adminUser: 'hr@sit.ac.in', event: 'Case Status Changed to UNDER_REVIEW', caseId: 'KV-2026-A11', ip: '192.168.1.45', status: 'SUCCESS' }
];
// -------------------

export default function AdminDashboardPage() {
  const [viewState, setViewState] = useState<'TABLE' | 'CASE_DETAIL' | 'AUDIT_LOGS'>('TABLE');
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'REPORT' | 'TIMELINE'>('REPORT');
  
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState<POSHLegalReport | null>(null);
  
  const [cases, setCases] = useState<FirestoreVaultDocument[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [decryptedTimeline, setDecryptedTimeline] = useState<ParsedLogItem[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await fetchAllVaultLogs();
        setCases(data);
      } catch (err) {
        console.error("Failed to fetch cases:", err);
      } finally {
        setIsLoadingCases(false);
      }
    };
    fetchCases();
  }, []);

  const handleReviewCaseClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setIsUnlockModalOpen(true);
  };

  const handleDecryptSubmit = async (key: string) => {
    setIsDecrypting(true);
    
    try {
      const selectedCase = cases.find(c => c.caseId === selectedCaseId);
      if (!selectedCase) throw new Error("Case not found");

      const decryptedPayload = await decryptPayload(
        selectedCase.encryptedCiphertextBase64,
        selectedCase.initializationVectorBase64,
        key
      );
      
      const timeline = decryptedPayload.timeline || [];
      setDecryptedTimeline(timeline);
      
      setIsAnalyzing(true);
      const report = await generatePOSHReport(timeline);
      
      const finalReport = {
        ...report,
        tenantDomain: selectedCase.tenantId || 'sit.ac.in',
        cryptographicIntegrityHash: 'Verified by AES-GCM (Local)',
        generatedAtISO: new Date().toISOString(),
        dateRangeStart: timeline[0]?.dateTimeISO || new Date().toISOString(),
        dateRangeEnd: timeline[timeline.length - 1]?.dateTimeISO || new Date().toISOString(),
        totalEvidenceCount: timeline.length,
        chronologicalTimeline: timeline 
      };
      
      setReportData(finalReport);
      setIsUnlockModalOpen(false);
      setViewState('CASE_DETAIL');
      setActiveTab('REPORT');
    } catch (err) {
      console.error("Decryption/Analysis Error:", err);
      alert("Decryption failed. Please ensure you have the exact 16-character key.");
    } finally {
      setIsDecrypting(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-[250px] fixed inset-y-0 left-0 bg-slate-950 text-slate-300 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-red-950/40 border border-red-500/30 text-red-500 p-3 rounded-lg">
            <div className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase leading-none">Restricted<br/>ICC Admin</span>
          </div>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          <button 
            onClick={() => setViewState('TABLE')}
            className={twMerge(
              clsx(
                "flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all font-medium border-l-4 text-left",
                viewState === 'TABLE' || viewState === 'CASE_DETAIL' 
                  ? "bg-slate-900 text-white border-red-500" 
                  : "border-transparent text-slate-500 hover:bg-slate-900/50 hover:text-white"
              )
            )}
          >
            <Database className="w-5 h-5" />
            Case Vault
          </button>
          <button 
            onClick={() => setViewState('AUDIT_LOGS')}
            className={twMerge(
              clsx(
                "flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all font-medium border-l-4 text-left",
                viewState === 'AUDIT_LOGS' 
                  ? "bg-slate-900 text-white border-red-500" 
                  : "border-transparent text-slate-500 hover:bg-slate-900/50 hover:text-white"
              )
            )}
          >
            <FileText className="w-5 h-5" />
            Audit Logs
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800 text-xs font-mono text-slate-600">
          KAVACH OS v3.0.1 <br/>
          Secure Terminal
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className={twMerge(clsx("flex-1 ml-[250px] overflow-y-auto min-h-screen relative transition-colors duration-300", viewState === 'CASE_DETAIL' ? 'bg-slate-200' : 'bg-slate-50'))}>
        <header className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Mandate-Ready Compliance Vault</h1>
            <p className="text-sm text-slate-500">Secure overview of active and pending cases.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              H
            </div>
            <span className="text-sm font-semibold text-slate-700">hr@sit.ac.in</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
          {viewState === 'AUDIT_LOGS' ? (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-1 mb-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  Immutable System Audit Trail
                </h2>
                <p className="text-sm text-slate-500">
                  Chronological record of all administrative actions and cryptographic key usages. This log cannot be altered or deleted.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <th className="px-4 py-3 font-semibold">Timestamp</th>
                      <th className="px-4 py-3 font-semibold">Admin User</th>
                      <th className="px-4 py-3 font-semibold">Action Event</th>
                      <th className="px-4 py-3 font-semibold">Target Case ID</th>
                      <th className="px-4 py-3 font-semibold text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DUMMY_AUDIT_LOGS.map(log => {
                       const isWarning = log.status === 'WARNING';
                       const isSuccess = log.status === 'SUCCESS';
                       
                       return (
                         <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                           <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                             {new Date(log.timestamp).toLocaleString()}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-700">
                             {log.adminUser}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap">
                             <span className={twMerge(
                               clsx(
                                 "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded",
                                 isWarning ? "bg-red-50 text-red-600" : isSuccess ? "bg-emerald-50 text-emerald-700" : "text-slate-600 bg-slate-50 border border-slate-200"
                               )
                             )}>
                               {log.event}
                             </span>
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-xs font-mono font-medium text-slate-500">
                             {log.caseId}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-400 text-right">
                             {log.ip}
                           </td>
                         </tr>
                       )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : viewState === 'TABLE' ? (
            <>
              {/* KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow-sm rounded-xl p-6 border-t-4 border-t-red-500 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Encrypted Payloads</span>
                    <Database className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-4xl font-black text-slate-900">12</div>
                </div>
                
                <div className="bg-white shadow-sm rounded-xl p-6 border-t-4 border-t-red-500 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Action Required / Locked</span>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-4xl font-black text-slate-900">4</div>
                </div>

                <div className="bg-white shadow-sm rounded-xl p-6 border-t-4 border-t-red-500 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Investigations</span>
                    <Activity className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-4xl font-black text-slate-900">8</div>
                </div>
              </div>

              {/* TABLE */}
              <AdminDashboardTable 
                cases={cases} 
                isLoading={isLoadingCases} 
                onReviewCaseClick={handleReviewCaseClick} 
              />
            </>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* BACK BUTTON & HEADER */}
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setViewState('TABLE')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors self-start"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Vault
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Case ID: #{selectedCaseId || 'KV-2026-X89'}
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase rounded-md border border-emerald-200 w-fit">
                    Decrypted
                  </span>
                </div>
              </div>

              {/* TABS */}
              <div className="flex bg-slate-200/50 p-1 rounded-xl self-start w-full max-w-sm">
                <button
                  onClick={() => setActiveTab('REPORT')}
                  className={twMerge(
                    clsx(
                      "flex-1 px-4 py-2 text-sm font-bold tracking-wide transition-all rounded-lg",
                      activeTab === 'REPORT' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )
                  )}
                >
                  LEGAL SYNTHESIS
                </button>
                <button
                  onClick={() => setActiveTab('TIMELINE')}
                  className={twMerge(
                    clsx(
                      "flex-1 px-4 py-2 text-sm font-bold tracking-wide transition-all rounded-lg",
                      activeTab === 'TIMELINE' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )
                  )}
                >
                  RAW EVIDENCE
                </button>
              </div>

              {/* CONTENT */}
              <div className="mt-4">
                {activeTab === 'REPORT' ? (
                  <div className="bg-white shadow-2xl max-w-5xl mx-auto rounded-sm border border-slate-300">
                    <LegalReportViewer 
                      report={reportData ? { ...reportData, reportId: selectedCaseId || reportData.reportId } : { ...DUMMY_REPORT, reportId: selectedCaseId || DUMMY_REPORT.reportId }} 
                    />
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-2xl p-6 md:p-8">
                    <TimelineViewer items={decryptedTimeline.length > 0 ? decryptedTimeline : DUMMY_TIMELINE} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* UNLOCK MODAL */}
      <UnlockModal 
        isOpen={isUnlockModalOpen}
        isDecrypting={isDecrypting}
        onClose={() => setIsUnlockModalOpen(false)}
        onDecryptSubmit={handleDecryptSubmit}
      />
    </div>
  );
}

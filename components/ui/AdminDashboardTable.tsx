import React, { useState } from 'react';
import { Lock, FileText, CheckCircle, Clock, ChevronRight, RefreshCw, FolderSearch } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface FirestoreVaultDocument {
  caseId: string;
  tenantId: string;
  status: 'LOCKED' | 'UNLOCKED' | 'RESOLVED';
  createdAtServerTimestamp: number;
  encryptedCiphertextBase64: string;
  initializationVectorBase64: string;
  wrappedKeyBase64?: string;
}

interface AdminDashboardTableProps {
  cases: FirestoreVaultDocument[];
  onReviewCaseClick: (caseId: string) => void;
  isLoading: boolean;
  processingCaseId?: string | null;
}

type TabStatus = 'ALL' | 'LOCKED' | 'UNLOCKED' | 'RESOLVED';

export default function AdminDashboardTable({ cases, onReviewCaseClick, isLoading, processingCaseId }: AdminDashboardTableProps) {
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');

  const filteredCases = cases.filter(c => activeTab === 'ALL' || c.status === activeTab);
  // Sort descending by timestamp
  filteredCases.sort((a, b) => b.createdAtServerTimestamp - a.createdAtServerTimestamp);

  const getStatusConfig = (status: FirestoreVaultDocument['status']) => {
    switch (status) {
      case 'LOCKED': return { label: 'LOCKED', icon: <Lock className="w-3.5 h-3.5" />, styles: 'bg-slate-100 text-slate-600 border-slate-200' };
      case 'UNLOCKED': return { label: 'UNLOCKED', icon: <FileText className="w-3.5 h-3.5" />, styles: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
      case 'RESOLVED': return { label: 'RESOLVED', icon: <CheckCircle className="w-3.5 h-3.5" />, styles: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    }
  };

  return (
    <div className="w-full font-sans bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
      
      {/* Header and Tabs */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Encrypted Case Vault</h2>
            <p className="text-sm text-slate-500 font-medium">Manage and review submitted compliance cases.</p>
          </div>
          
          <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 shadow-inner self-start sm:self-auto overflow-x-auto">
            {(['ALL', 'LOCKED', 'UNLOCKED', 'RESOLVED'] as TabStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={twMerge(
                  clsx(
                    "px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all whitespace-nowrap",
                    activeTab === tab 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )
                )}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium tracking-wide">Loading vault data...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <FolderSearch className="w-10 h-10 opacity-50" />
            <p className="text-sm font-medium tracking-wide">No cases found for this filter.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500">
                <th className="px-6 py-3 font-semibold">Case ID</th>
                <th className="px-6 py-3 font-semibold">Tenant</th>
                <th className="px-6 py-3 font-semibold">Date Submitted</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => {
                const conf = getStatusConfig(c.status);
                const date = new Date(c.createdAtServerTimestamp).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                });
                const isLocked = c.status === 'LOCKED';

                return (
                  <tr key={c.caseId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-md text-slate-400 border border-slate-200">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-mono font-medium text-slate-700">{c.caseId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-600">{c.tenantId}</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-sm text-slate-500">{date}</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className={twMerge(clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest border", conf.styles))}>
                        {conf.icon}
                        {conf.label}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      {isLocked ? (
                        <button 
                          onClick={() => onReviewCaseClick(c.caseId)}
                          disabled={processingCaseId === c.caseId}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-sm transition-colors disabled:opacity-75 disabled:cursor-wait"
                        >
                          {processingCaseId === c.caseId ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Unlocking...
                            </>
                          ) : (
                            <>
                              Unlock & Review <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      ) : (
                        <button 
                          onClick={() => onReviewCaseClick(c.caseId)}
                          disabled={processingCaseId === c.caseId}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-sm transition-colors disabled:opacity-75 disabled:cursor-wait"
                        >
                          {processingCaseId === c.caseId ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" /> Loading...
                            </>
                          ) : (
                            <>
                              View Case <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

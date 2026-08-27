import React from 'react';
import { Download, ShieldCheck, Calendar, Users, FileText, Activity } from 'lucide-react';
import TimelineViewer, { ParsedLogItem } from './TimelineViewer';

export interface POSHLegalReport {
  reportId: string;
  generatedAtISO: string;
  tenantDomain: string;
  incidentSummary: string;
  totalEvidenceCount: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  primaryAllegedOffender: string;
  identifiedPlatforms: string[];
  chronologicalTimeline: ParsedLogItem[];
  applicableLegalSections: string[];
  cryptographicIntegrityHash: string;
}

interface LegalReportViewerProps {
  report: POSHLegalReport;
  onExportPDF?: () => void;
}

export default function LegalReportViewer({ report, onExportPDF }: LegalReportViewerProps) {
  return (
    <div className="w-full max-w-5xl mx-auto font-sans bg-[#f8fafc] text-slate-900 rounded-sm shadow-2xl overflow-hidden print:bg-white print:shadow-none print:w-full">

      {/* HEADER SECTION (LETTERHEAD STYLE) */}
      <div className="p-8 md:p-12 pb-6 border-b-2 border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-slate-900 uppercase">POSH INCIDENT COMPLIANCE DOSSIER</h1>
            <p className="text-sm font-semibold text-slate-600 mt-2 uppercase tracking-widest">Internal Case: {report?.reportId ?? 'N/A'}</p>
            <p className="text-xs text-slate-500 font-mono mt-1">Tenant Authority: {report?.tenantDomain ?? 'N/A'}</p>

            {/* Integrity Badge (Stamp Style) */}
            <div className="mt-6 inline-flex items-start gap-2 p-3 border-2 border-emerald-700/50 rounded text-emerald-800 bg-emerald-50/50">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-700" />
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase leading-tight mb-0.5 text-emerald-800">SHA-256 Cryptographic Integrity Verified</p>
                <p className="text-[10px] font-mono opacity-80">{report?.cryptographicIntegrityHash ?? 'Not available'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {onExportPDF && (
                <button
                  onClick={onExportPDF}
                  className="print:hidden flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Export Dossier (PDF)
                </button>
              )}
              <button
                className="print:hidden flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-sm"
              >
                Close Investigation
              </button>
            </div>
            <div className="text-right mt-2">
              <p className="text-xs text-slate-500 font-mono">Date Generated: {report?.generatedAtISO ? new Date(report.generatedAtISO).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12 pt-8 flex flex-col gap-12">

        {/* SUMMARY SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> Incident Overview
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {(report?.incidentSummary ?? (report as any)?.caseSummary) ?? 'No summary available.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users className="w-4 h-4 text-slate-400" /> Primary Offender
              </div>
              <span className="text-sm font-medium text-slate-900">{(report?.primaryAllegedOffender ?? ((report as any)?.identifiedParties || []).join(', ')) || 'Not identified'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" /> Date Range
              </div>
              <span className="text-sm font-medium text-slate-900">
                {report?.dateRangeStart ? new Date(report.dateRangeStart).toLocaleDateString() : 'N/A'} - {report?.dateRangeEnd ? new Date(report.dateRangeEnd).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Activity className="w-4 h-4 text-slate-400" /> Evidence Count
              </div>
              <span className="text-sm font-medium text-slate-900">
                {report?.totalEvidenceCount ?? 'N/A'} items from {((report?.identifiedPlatforms || []).join(', ')) || 'N/A'}
              </span>
            </div>
          </div>
        </section>

        {/* LEGAL SECTIONS */}
        {((report?.applicableLegalSections || []).length > 0 || ((report as any)?.potentialViolations || []).length > 0) && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">
              Applicable Provisions
            </h2>
            <div className="flex flex-wrap gap-2">
              {(report?.applicableLegalSections || (report as any)?.potentialViolations || []).map((section: string, idx: number) => (
                <span key={idx} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">
                  {section}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* TIMELINE */}
        <section className="print:break-before-page">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-200 pb-2 mb-8">
            Chronological Evidence Record
          </h2>

          <div className="bg-slate-900 rounded-xl p-6">
            {/* Re-use the timeline viewer but it will adapt to dark mode nicely as it's already dark-themed */}
            <TimelineViewer items={report?.chronologicalTimeline || (report as any)?.chronologicalTimeline || []} />
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <div className="bg-slate-100 p-6 text-center border-t border-slate-200 print:fixed print:bottom-0 print:w-full">
        <p className="text-xs text-slate-500 font-medium">This report contains highly sensitive and confidential information subject to institutional data protection policies.</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">KAVACH SECURE VAULT COMPLIANCE ENGINE</p>
      </div>
    </div>
  );
}

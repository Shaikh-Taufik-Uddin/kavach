import React from 'react';
import { POSHLegalReport } from '@/lib/types';

export const ReportView = ({ report }: { report: POSHLegalReport }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow border border-gray-200 mt-6">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Official POSH Compliance Report</h2>
        <p className="text-sm text-gray-500">Case ID: {report.reportId} | Generated: {new Date(report.generatedAtISO).toLocaleString()}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold text-sm text-gray-700">Incident Summary</h3>
          <p className="text-sm mt-1">Offender: <span className="font-mono bg-yellow-100 px-1">{report.incidentSummary.primaryAllegedOffender}</span></p>
          <p className="text-sm">Evidence Count: {report.incidentSummary.totalEvidenceCount} items</p>
          <p className="text-sm">Platforms: {report.incidentSummary.identifiedPlatforms.join(', ')}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold text-sm text-gray-700">Applicable Legal Sections</h3>
          <ul className="list-disc pl-5 mt-1 text-sm text-gray-800">
            {report.applicableLegalSections.map((section, idx) => (
              <li key={idx}>{section}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded border border-red-100">
        <h3 className="font-semibold text-sm text-red-800 mb-2">Cryptographic Integrity Hash</h3>
        <p className="text-xs font-mono text-red-600 break-all">{report.cryptographicIntegrityHash}</p>
      </div>
    </div>
  );
};

import { MasterVaultPayload } from '@/lib/types';

export const mockParseEvidence = (tenantId: string): MasterVaultPayload => {
  const caseId = `POSH-${Date.now().toString().slice(-6)}`;
  return {
    caseId,
    tenantId,
    createdAt: Date.now(),
    timeline: [
      {
        id: '1', timestamp: Date.now(), dateTimeISO: new Date().toISOString(),
        sender: 'Aggressor', messageContent: 'Mock harassing message', sourceType: 'WHATSAPP_TXT',
        flaggedHarassmentTerm: true
      }
    ],
    legalReport: {
      reportId: caseId,
      generatedAtISO: new Date().toISOString(),
      tenantDomain: tenantId,
      incidentSummary: {
        totalEvidenceCount: 1, dateRangeStart: '2026-08-01', dateRangeEnd: '2026-08-14',
        primaryAllegedOffender: 'Aggressor', identifiedPlatforms: ['WhatsApp']
      },
      chronologicalTimeline: [],
      applicableLegalSections: ['POSH Act 2013 Sec 9'],
      cryptographicIntegrityHash: 'mock-sha-256-hash'
    }
  };
};

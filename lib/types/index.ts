export interface ParsedLogItem {
  id: string; 
  timestamp: number; 
  dateTimeISO: string; 
  sender: string; 
  messageContent: string; 
  sourceType: 'WHATSAPP_TXT' | 'SCREENSHOT_OCR';
  confidenceScore?: number; 
  flaggedHarassmentTerm?: boolean; 
}

export type UserRole = 'VICTIM_STUDENT' | 'HR_ADMIN' | 'UNKNOWN';

export interface FirestoreVaultDocument {
  caseId: string;
  tenantId: string;
  status: 'LOCKED' | 'UNDER_REVIEW' | 'RESOLVED';
  createdAtServerTimestamp: any;
  encryptedCiphertextBase64: string;
  initializationVectorBase64: string;
}

export interface MasterVaultPayload {
  caseId: string;
  tenantId: string;
  createdAt: number;
  timeline: ParsedLogItem[];
  legalReport: {
    reportId: string;
    generatedAtISO: string;
    tenantDomain: string;
    incidentSummary: {
      totalEvidenceCount: number;
      dateRangeStart: string;
      dateRangeEnd: string;
      primaryAllegedOffender: string;
      identifiedPlatforms: string[];
    };
    chronologicalTimeline: ParsedLogItem[];
    applicableLegalSections: string[];
    cryptographicIntegrityHash: string;
  };
}

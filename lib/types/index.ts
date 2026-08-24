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

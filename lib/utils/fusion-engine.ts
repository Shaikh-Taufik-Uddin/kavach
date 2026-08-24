import { ParsedLogItem } from '../types';

const HARASSMENT_KEYWORDS = ['bitch', 'kill', 'block', 'stop', 'stalk'];

export const mergeAndSortLogs = (whatsappLogs: ParsedLogItem[], ocrLogs: ParsedLogItem[]): ParsedLogItem[] => {
  const merged = [...whatsappLogs, ...ocrLogs];
  
  merged.sort((a, b) => a.timestamp - b.timestamp);
  
  return merged.map(item => {
    const lowerContent = item.messageContent.toLowerCase();
    const hasHarassmentTerm = HARASSMENT_KEYWORDS.some(keyword => lowerContent.includes(keyword));
    
    if (hasHarassmentTerm) {
      return {
        ...item,
        flaggedHarassmentTerm: true
      };
    }
    return item;
  });
};

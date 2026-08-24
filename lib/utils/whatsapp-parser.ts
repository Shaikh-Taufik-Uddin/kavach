import { ParsedLogItem } from '../types';

export const parseWhatsAppText = (rawText: string): ParsedLogItem[] => {
  const parsedItems: ParsedLogItem[] = [];
  const lines = rawText.split('\n');

  // Matches iOS: "[DD/MM/YY, HH:MM:SS] Sender: Message" or Android: "DD/MM/YY, HH:MM - Sender: Message"
  // ^\[?(\d{1,2}\/\d{1,2}\/\d{2,4})[,]?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[aApP][mM])?)\]?\s*(?:-)?\s*(.*?):\s+(.*)$
  const lineRegex = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4})[,]?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[aApP][mM])?)\]?\s*(?:-)?\s*(.*?):\s+(.*)$/;

  let currentItem: Partial<ParsedLogItem> | null = null;

  for (const line of lines) {
    const match = line.match(lineRegex);

    if (match) {
      if (currentItem) {
        parsedItems.push(currentItem as ParsedLogItem);
      }

      const [, dateStr, timeStr, sender, message] = match;
      
      const dateParts = dateStr.split('/');
      let day, month, year;
      if (dateParts[2].length === 2) { 
        day = parseInt(dateParts[0], 10);
        month = parseInt(dateParts[1], 10) - 1;
        year = 2000 + parseInt(dateParts[2], 10); 
      } else {
        day = parseInt(dateParts[0], 10);
        month = parseInt(dateParts[1], 10) - 1;
        year = parseInt(dateParts[2], 10);
      }

      let hours = 0, minutes = 0, seconds = 0;
      const timeMatches = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([aApP][mM])?/i);
      if (timeMatches) {
        hours = parseInt(timeMatches[1], 10);
        minutes = parseInt(timeMatches[2], 10);
        if (timeMatches[3]) seconds = parseInt(timeMatches[3], 10);
        
        const ampm = timeMatches[4]?.toLowerCase();
        if (ampm === 'pm' && hours < 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0;
      }

      const dateObj = new Date(year, month, day, hours, minutes, seconds);

      currentItem = {
        id: crypto.randomUUID(),
        timestamp: dateObj.getTime(),
        dateTimeISO: dateObj.toISOString(),
        sender: sender.trim(),
        messageContent: message.trim(),
        sourceType: 'WHATSAPP_TXT',
      };
    } else {
      if (currentItem && currentItem.messageContent !== undefined) {
        currentItem.messageContent += '\n' + line.trim();
      }
    }
  }

  if (currentItem) {
    parsedItems.push(currentItem as ParsedLogItem);
  }

  return parsedItems.filter(item => item.sender && !item.messageContent.startsWith('Messages and calls are end-to-end encrypted'));
};

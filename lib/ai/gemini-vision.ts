import { GoogleGenAI } from '@google/genai';
import { ParsedLogItem } from '../types';

export const extractTextFromScreenshot = async (imageBase64: string, mimeType: string): Promise<ParsedLogItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

  const systemInstruction = `
You are an OCR and log parsing assistant. Your task is to extract messages from screenshots of chats (e.g. WhatsApp, Instagram, Gmail).
Return the result strictly as a JSON array of objects, where each object perfectly matches this TypeScript interface:
{
  "id": "A UUID v4 you generate",
  "timestamp": number (epoch milliseconds),
  "dateTimeISO": string (ISO-8601 string, e.g., "YYYY-MM-DDTHH:mm:ss.sssZ"),
  "sender": string (the name or handle of the person sending the message),
  "messageContent": string (the extracted text of the message),
  "sourceType": "SCREENSHOT_OCR",
  "confidenceScore": number (your confidence in the OCR extraction, 0.0 to 1.0)
}

Important Rules:
- If you only see a partial date (e.g. "Today, 10:00 AM"), assume the current year is 2026. Estimate the exact date to the best of your ability.
- Only output the JSON array. Do not include markdown blocks like \`\`\`json or any other text.
`;

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: "Extract the chat messages from this screenshot as a JSON array of ParsedLogItem objects." },
          { inlineData: { data: base64Data, mimeType: mimeType } }
        ]
      }
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.1
    }
  });

  if (!response.text) {
    return [];
  }

  try {
    const rawText = response.text.trim();
    const cleanedText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
    const data = JSON.parse(cleanedText) as ParsedLogItem[];
    
    return data.map(item => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      sourceType: 'SCREENSHOT_OCR'
    }));
  } catch (error) {
    console.error("Failed to parse Gemini output:", error);
    return [];
  }
};

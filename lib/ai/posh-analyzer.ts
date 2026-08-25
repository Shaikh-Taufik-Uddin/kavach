import { GoogleGenAI } from '@google/genai';
import { ParsedLogItem } from '../types';

export const generatePOSHReport = async (decryptedLogs: ParsedLogItem[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

  const systemInstruction = `
You are an impartial ICC (Internal Complaints Committee) Legal Analyst under the Indian POSH Act, 2013.
Your task is to analyze the provided digital interaction logs and synthesize them into a structured incident timeline.

You MUST return a JSON object with the following exact structure:
{
  "caseSummary": "A brief, objective overview of the digital interaction.",
  "identifiedParties": ["Name1", "Name2"],
  "chronologicalTimeline": [
    {
      "timestamp": 1234567890,
      "sender": "Name",
      "incidentDescription": "Description of what happened",
      "severityScore": 5
    }
  ],
  "potentialViolations": [
    "Specific references to POSH Act Section 2(n) violations if detected (e.g., 'sexually colored remarks', 'unwelcome non-verbal conduct')"
  ]
}

Important Rules:
- Only output the JSON object. Do not include markdown blocks like \`\`\`json or any other text.
- severityScore must be a number from 1 to 10.
`;

  const logsString = JSON.stringify(decryptedLogs, null, 2);

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: [
      {
        role: 'user',
        parts: [
          { text: "Analyze the following decrypted chat logs and generate the POSH report:\n\n" + logsString }
        ]
      }
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.2
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini API");
  }

  try {
    const rawText = response.text.trim();
    const cleanedText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse Gemini output:", error);
    throw new Error("Failed to parse POSH report JSON");
  }
};

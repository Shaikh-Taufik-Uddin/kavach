import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const incidentDescription = formData.get('incidentDescription') as string || '';
    
    // Extract all files
    const files = formData.getAll('files') as File[];
    
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Returning error.");
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

    const parts: any[] = [];
    
    // Convert files to base64 for Gemini
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Data = buffer.toString('base64');
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        }
      });
    }

    const prompt = `You are an expert POSH legal analyzer. Read the victim's narrative: 
    
[Narrative Start]
${incidentDescription}
[Narrative End]

Now analyze the attached evidence files. 
1. Synthesize a POSHLegalReport JSON object. 
2. Extract key events into a ParsedLogItem JSON array. 

Return ONLY raw JSON matching this EXACT structure:
{
  "report": {
    "reportId": "KV-2026-X89",
    "generatedAtISO": "2026-08-27T00:00:00Z",
    "tenantDomain": "sit.ac.in",
    "incidentSummary": "A concise summary of the incident based on narrative and evidence.",
    "totalEvidenceCount": 1,
    "dateRangeStart": "2026-08-01T00:00:00Z",
    "dateRangeEnd": "2026-08-27T00:00:00Z",
    "primaryAllegedOffender": "Name or identifier",
    "identifiedPlatforms": ["WhatsApp"],
    "applicableLegalSections": ["POSH Act Section 2(n)"],
    "cryptographicIntegrityHash": "generate-a-dummy-sha256-hash-string"
  },
  "timeline": [
    {
      "id": "item-1",
      "timestamp": 1693123200000,
      "dateTimeISO": "2026-08-27T00:00:00Z",
      "sender": "Name",
      "messageContent": "The message",
      "sourceType": "WHATSAPP_TXT",
      "confidenceScore": 0.95,
      "flaggedHarassmentTerm": true
    }
  ]
}`;
    
    parts.unshift({ text: prompt });

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text);
      return NextResponse.json({ success: false, error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Map chronologicalTimeline to timeline in the report for completeness
    if (parsedData.report && parsedData.timeline) {
       parsedData.report.chronologicalTimeline = parsedData.timeline;
    }

    return NextResponse.json({
      success: true,
      timeline: parsedData.timeline || [],
      report: parsedData.report || null,
    });
    
  } catch (error: any) {
    console.error("Error analyzing evidence:", error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

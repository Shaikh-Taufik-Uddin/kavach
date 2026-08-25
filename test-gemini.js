const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: 'AQ.Ab8RN6KXIgV4G5Se9RGLhsw6uiFTnlPJjZPVaClQU5YoHkgg7g' });

async function test() {
  try {
    console.log('Testing with gemini-3.6-flash...');
    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [{ role: 'user', parts: [{ text: 'Say hello in one word.' }] }]
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT after 15s')), 15000))
    ]);
    console.log('✅ SUCCESS! Response:', response.text);
  } catch (error) {
    console.error('❌ FAILED:', error.message ? error.message.substring(0, 300) : error);
  }
}

test();

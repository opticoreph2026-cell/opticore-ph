import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getCurrentUser } from '@/lib/auth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const maxDuration = 60; 

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await import('@/lib/db');
    const client = await db.client.findUnique({ where: { id: user.sub } });
    if (client?.planTier === 'starter') {
      return NextResponse.json({ 
        error: 'FORBIDDEN', 
        message: 'Acoustic Hardware Audit is a Pro feature. Please upgrade to unlock high-fidelity diagnostics.' 
      }, { status: 403 });
    }

    const { audioData } = await request.json(); 
    
    if (!audioData) {
      return NextResponse.json({ error: 'No audio data provided.' }, { status: 400 });
    }

    const mimeMatch = audioData.match(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-.]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';
    const base64Data = audioData.split(',')[1] || audioData;

    const prompt = `
      You are an expert mechanical sound engineer and HVAC diagnostic AI for the Philippines.
      Analyze the acoustic frequency signature from the provided data. Determine if the sound indicates a healthy baseline hum, or if there is evidence of hardware degradation (e.g., struggling compressor, failing capacitor high-pitch whine, rattling fan blades, or excessive vibration).

      Return your analysis strictly in the following JSON format:
      {
        "status": "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN",
        "diagnosis": "Short technical description of what you hear (e.g., 'Normal compressor cycle', 'High-pitch whine indicative of failing run capacitor').",
        "phantomLoadPenalty": "Estimated extra electricity percentage being wasted (e.g., 0 for healthy, 35 for critical). Only output the number.",
        "estimatedWastedCost": "Estimated monthly PHP wasted due to this inefficiency (e.g., 0, 800, 1500). Only output the number.",
        "recommendedAction": "Actionable advice for the user (e.g., 'No action needed', 'Schedule a cleaning', 'Replace compressor capacitor immediately')."
      }

      Return ONLY the raw JSON object. Do not use markdown backticks. If you cannot identify the sound or if it's completely silent, return status "UNKNOWN".
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON safely
    let jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const startIndex = jsonStr.indexOf('{');
    const endIndex = jsonStr.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        jsonStr = jsonStr.substring(startIndex, endIndex + 1);
    }
    
    let analysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error("Failed to parse AI output: " + jsonStr);
    }

    return NextResponse.json({ success: true, data: analysis });

  } catch (error) {
    console.error('[Acoustic Auditor] Error:', error);
    return NextResponse.json({ error: 'Audio analysis failed. Ensure the clip is clear and at least 3 seconds long.' }, { status: 500 });
  }
}

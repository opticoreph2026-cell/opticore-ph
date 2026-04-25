import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrentUser } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const maxDuration = 60; // Allow more time for audio processing if deployed on Vercel

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { audioData } = await request.json(); 
    
    if (!audioData) {
      return NextResponse.json({ error: 'No audio data provided.' }, { status: 400 });
    }

    const mimeMatch = audioData.match(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-.]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';
    const base64Data = audioData.split(',')[1] || audioData;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert mechanical sound engineer and HVAC diagnostic AI for the Philippines.
      Listen to this short audio clip of a household appliance (likely an air conditioner or refrigerator).
      Analyze the acoustic frequency signature. Determine if the sound indicates a healthy baseline hum, or if there is evidence of hardware degradation (e.g., struggling compressor, failing capacitor high-pitch whine, rattling fan blades, or excessive vibration).

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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
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

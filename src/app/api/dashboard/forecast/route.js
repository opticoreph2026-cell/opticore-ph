export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getClientById, getReadingsByClient, ensureDefaultProperty } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function GET(request) {
  try {
    // 1. Authenticate
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await getClientById(user.sub);
    const plan = client?.planTier ?? 'starter';

    // Feature Gate - Business Only
    if (plan === 'starter' || plan === 'pro') {
      return NextResponse.json({ error: 'Business subscription required for AI Forecasting.' }, { status: 403 });
    }

    const activeProperty = await ensureDefaultProperty(client.id);
    const readings = await getReadingsByClient(client.id, activeProperty.id);

    if (!readings || readings.length < 2) {
      return NextResponse.json({ 
        success: true,
        data: null, 
        message: 'Need at least 2 months of data to generate a forecast.' 
      });
    }

    // Sort ascending for the prompt (oldest first)
    const history = readings.slice(0, 12).reverse().map(r => ({
      date: r.readingDate,
      kwh: r.kwhUsed,
      bill: r.billAmountElectric
    }));

    const prompt = `
      You are OptiCore PH Predictive AI.
      Given the following historical electricity readings for a property:
      ${JSON.stringify(history)}
      
      Identify the trend (increasing, decreasing, stable, seasonal).
      Predict the NEXT month's expected kWh consumption and estimated Bill Amount (PHP).
      Base predictions on average consumption and observed trends.
      
      Respond STRICTLY in JSON format:
      {
        "trend": "increasing"|"decreasing"|"stable",
        "predictedKwh": <number>,
        "predictedBill": <number>,
        "confidence": "high"|"medium"|"low",
        "reasoning": "<short 1-sentence explanation focusing on the trend and next month's expectation>"
      }
    `;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text()?.trim() || '{}';
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const forecastData = JSON.parse(rawText);

    return NextResponse.json({ success: true, data: forecastData });
  } catch (error) {
    console.error('[Forecast API Error]:', error);
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 });
  }
}

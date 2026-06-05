import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

/**
 * Generates an AI advisory report based on a user's recent bills, fuel logs, and appliances
 */
export async function generateAdvisoryReport(
  utilityData: any,
  appliances: any,
  fuelLogs: any,
  targetType: 'electric' | 'water' | 'fuel' | 'all' = 'all'
) {
  try {
    const prompt = `
      You are an expert energy and utility auditor for Philippine households and SMEs.
      Analyze the following data and generate an advisory report.

      Target Scope: ${targetType}
      Utility Data: ${JSON.stringify(utilityData)}
      Appliances: ${JSON.stringify(appliances)}
      Fuel Logs: ${JSON.stringify(fuelLogs)}

      Output JSON with:
      {
        "summary": "1 sentence executive summary",
        "narrativeSummary": "2-3 paragraphs of detailed analysis and trends",
        "recommendations": [
          {
            "title": "Actionable advice",
            "description": "Why to do this",
            "estimatedSavingsCentavos": 10000,
            "category": "appliance_upgrade" // or behavioral, maintenance, etc.
          }
        ],
        "potentialSavingsCentavos": 50000
      }
    `

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      }
    })

    const text = response.text()
    return JSON.parse(text || '{}')
  } catch (error) {
    console.error('Advisory Gen Error:', error)
    throw new Error('Failed to generate advisory report')
  }
}

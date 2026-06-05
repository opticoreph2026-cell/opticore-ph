import { GoogleGenAI } from '@google/genai'

// The Gen AI SDK is initialized here
// We use Gemini 2.5 Flash as per the AGENTS.md specs
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

/**
 * Extracts data from an electric or water bill image
 * @param imageBase64 Base64 string of the image
 * @param mimeType MIME type (e.g. image/jpeg)
 * @param utilityType "electric" or "water"
 */
export async function parseBillImage(imageBase64: string, mimeType: string, utilityType: string) {
  try {
    const prompt = `
      You are an expert OCR and data extraction system for Philippine utility bills.
      This is a ${utilityType} bill.
      Extract the following fields in JSON format:
      {
        "billingPeriodStart": "YYYY-MM-DD",
        "billingPeriodEnd": "YYYY-MM-DD",
        "dueDate": "YYYY-MM-DD",
        "amountDueCentavos": number (amount in PHP * 100),
        "consumption": number (in kWh or cubic meters),
        "previousReading": number,
        "currentReading": number,
        "providerCode": "MERALCO" (guess from logos/text),
        "lineItems": [
          { "label": "string", "amountCentavos": number }
        ]
      }
      If a field is not found or unreadable, return null for it. Ensure the output is strictly valid JSON without markdown wrapping.
    `

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { data: imageBase64, mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    })

    const text = response.text
    return JSON.parse(text || '{}')
  } catch (error) {
    console.error('OCR Parsing Error:', error)
    throw new Error('Failed to parse bill image')
  }
}

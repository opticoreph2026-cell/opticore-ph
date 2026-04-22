import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config();

async function testPDF() {
  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Minimal valid PDF (Blank single page)
    const pdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSPj4KZW5kb2JqCjIgMCBvYmogICUKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmogICUKPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0+PgplbmRvYmoKNHgwCg==";

    console.log('Sending PDF via inlineData...');
    const result = await model.generateContent([
      "Extract the providerName and totalAmount from this bill. If it's blank say 'Blank'.",
      {
        inlineData: {
          data: pdfBase64,
          mimeType: "application/pdf"
        }
      }
    ]);
    console.log("Success! Response:", result.response.text());
  } catch (e) {
    console.error("Failed!", e);
  }
}

testPDF();

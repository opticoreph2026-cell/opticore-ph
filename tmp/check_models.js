const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function check() {
  try {
    const list = await genAI.listModels();
    console.log("=== AVAILABLE MODELS ===");
    list.models.forEach(m => console.log(`- ${m.name}`));
  } catch (e) {
    console.error("Error Listing Models:", e.status, e.statusText);
    console.error(e.message);
  }
}

check();

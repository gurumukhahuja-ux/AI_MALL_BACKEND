import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log("Testing Gemini API...");
console.log("API Key exists:", !!apiKey);
console.log("API Key length:", apiKey ? apiKey.length : 0);

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in .env file");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log("\n🔍 Attempting to generate content...");

        const result = await model.generateContent("Say hello");
        const response = await result.response;
        const text = response.text();

        console.log("✅ Success! Gemini responded:");
        console.log(text);

    } catch (error) {
        console.error("❌ Error testing Gemini:");
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error status:", error.status);

        if (error.message.includes("API_KEY_INVALID")) {
            console.error("\n⚠️  The API key is invalid. Please check your GEMINI_API_KEY in .env");
        } else if (error.message.includes("quota")) {
            console.error("\n⚠️  API quota exceeded. Check your Google Cloud Console.");
        } else if (error.message.includes("404")) {
            console.error("\n⚠️  Model not found. The model name might be incorrect.");
        }
    }
}

testGemini();

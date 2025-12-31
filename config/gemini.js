import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Mock implementation to prevent crashes if API key is missing
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : {
    getGenerativeModel: () => ({
        generateContent: async () => ({
            response: {
                candidates: [{
                    content: { parts: [{ text: "AI features are disabled due to missing GEMINI_API_KEY." }] }
                }]
            }
        })
    })
};

const textModelName = 'gemini-1.5-flash';

export const generativeModel = genAI.getGenerativeModel({
    model: textModelName,
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
    ],
    generationConfig: {
        maxOutputTokens: 4192
    }
});

export const generativeVisionModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
});

export const generativeModelPreview = generativeModel;

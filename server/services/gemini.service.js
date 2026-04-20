import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates content using Google Gemini
 * @param {string} prompt - The prompt to send to Gemini
 * @param {string} modelName - The model to use (default: gemini-1.5-flash)
 * @returns {Promise<string>} - The generated content
 */
export const askGemini = async (prompt, modelName = "gemini-2.5-flash") => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
            throw new Error("GEMINI_API_KEY is not configured in .env");
        }

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
            throw new Error("Gemini returned empty response.");
        }

        return text;
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw new Error(`Gemini API Error: ${error.message}`);
    }
};

/**
 * Specialized function for structured JSON response from Gemini
 * @param {string} prompt - The prompt (should specify JSON format)
 * @returns {Promise<Object>} - Parsed JSON object
 */
export const askGeminiJSON = async (prompt) => {
    try {
        const text = await askGemini(prompt + "\n\nIMPORTANT: Return ONLY valid JSON. No markdown formatting, no backticks, no explanatory text.");
        // Clean up possible markdown code blocks
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini JSON Parsing Error:", error.message);
        throw new Error("Failed to get structured response from Gemini.");
    }
};

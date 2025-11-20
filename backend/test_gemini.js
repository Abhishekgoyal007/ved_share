import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.log("GEMINI_API_KEY not found in .env");
        return;
    }

    console.log("Fetching available models via REST API...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or unexpected response format:", data);
        }

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

testModels();

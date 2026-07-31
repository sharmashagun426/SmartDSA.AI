import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import systemInstruction from './prompts/dsa.js'

// Load environment variables
dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (index.html, style.css, script.js)
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const model = process.env.MODEL || "gemini-3.6-flash"

console.log(model, "model is here")

app.post("/chat", async (req, res) => {
    try {

        const { prompt } = req.body;

        const response = await ai.models.generateContent({
            model: model,
            contents:` ${systemInstruction} User Question :  ${prompt} `
        });

        res.json({
            success: true,
            response: response.text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

// Test Route
app.get("/", (req, res) => {
    res.send("🚀 DSA AI Instructor Backend Running...");
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
require("dotenv").config();
import express, { request, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";
import { CLIENT_RENEG_LIMIT } from "tls";
import { Console } from "console";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const app = express();
app.use(cors({ origin: '*' })) // Allow access to all
app.use(express.json())

app.get("/", (req, res) => {
    res.send("<h1>Welcome to the AI-powered API Server!</h1><p>Use the endpoints to interact with Gemini.</p>");
});

app.post("/template", async (req, res) => { // Changed from GET to POST
    const prompt = req.body.prompt;
    console.log("Incoming request body:", req.body);

    try {
        const result = await model.generateContent(
            "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra" + prompt
        );
        const answer = result.response.text().trim().toLowerCase();

        if (answer === "react") {
            res.json({
                prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [reactBasePrompt]
            })
            return;
        }

        if (answer === "node") {
            res.json({
                prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [nodeBasePrompt]
            })
            return;
        }

        res.status(403).json({ message: "Invalid response from AI" })
        return;

    } catch (error) {
        console.error("Error:", error); // Log actual error
        res.status(500).json({ message: "Error processing request" });
        return;
    }
})

app.post("/chat", async (req, res) => {
    try {
        const chatSession = model.startChat();
        let messages = req.body.messages;

        // Properly format messages for Gemini API
        const formattedMessages = [
            { role: "user", parts: [{ text: getSystemPrompt() }] },
            ...messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }))
        ];

        // Directly call generateContent
        const chatResult = await model.generateContent({
            contents: formattedMessages,
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 8000,
            }
        });

        // Extract response
        const response = chatResult.response;
        console.log("LLM model response:", response.candidates[0].content);

        // Log the files being created
        console.log("Files to be mounted:", response.candidates[0].content.parts[0].text);

        res.json({ response: response.candidates[0].content });

    } catch (error) {
        console.error("❌ Error processing chat request:", error);
        res.status(500).json({ message: "Error processing chat request" });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



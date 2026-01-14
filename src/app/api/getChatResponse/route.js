import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize outside the handler for better performance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a helpful AI chatbot. Respond directly as if in a chat. 
    Request: ${message}`;

    // Generate content
    const result = await model.generateContent(prompt);
    
    // Ensure we handle the response object correctly
    const response = await result.response;
    const aiResponse = response.text().trim();

    return NextResponse.json({ aiResponse }, { status: 200 });

  } catch (error) {
    console.error("Gemini API Error:", error);

    // Handle Quota/Rate Limit (429) errors specifically
    if (error.message?.includes("429") || error.status === 429) {
      return NextResponse.json(
        { error: "Quota exhausted. Please wait 60 seconds and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate response. Check your API key or server logs." },
      { status: 500 }
    );
  }
}

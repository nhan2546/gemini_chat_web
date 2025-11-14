// This is a Vercel-style serverless function, which Render supports.
// All files in the /api directory become API endpoints.
// This file will be accessible at /api/chat.

import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// IMPORTANT: The user must set this in the Render dashboard Environment variables.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey });

const model = ai.models.create({ model: "gemini-2.5-flash" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Handle CORS preflight requests.
  response.setHeader('Access-Control-Allow-Origin', '*'); // Or a specific origin
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = request.body;

    if (!messages || !Array.isArray(messages)) {
      return response.status(400).json({ error: 'Invalid message history format.' });
    }

    // Convert the message history to the format expected by the Gemini API
    const history = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // The last message is the new user prompt
    const userPrompt = history.pop();
    if (!userPrompt) {
        return response.status(400).json({ error: 'No user prompt found.' });
    }


    const chat = model.startChat({
      history: history,
      generationConfig,
      safetySettings,
    });

    const result = await chat.sendMessage(userPrompt.parts);
    const modelResponse = result.response;
    
    return response.status(200).json({ response: modelResponse.text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return response.status(500).json({ error: 'Failed to get response from AI model.' });
  }
}

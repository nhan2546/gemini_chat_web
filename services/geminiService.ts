import { ChatMessage } from '../types';

/**
 * Sends the entire chat history to the backend proxy running on Render.
 * The backend will then securely forward this to the Gemini API.
 * @param messages - The history of messages in the chat.
 * @returns The model's response as a string.
 */
export const sendMessage = async (messages: ChatMessage[]): Promise<string> => {
  // This now points to the serverless function located in the /api directory.
  // Render will automatically route requests to /api/* to the correct function.
  const API_URL = '/api/chat';

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Backend proxy error:", errorBody);
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
      throw new Error(data.error);
  }

  return data.response;
};

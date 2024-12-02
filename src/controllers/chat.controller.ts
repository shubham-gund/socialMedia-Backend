import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error('Google API key is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
export const chatWithAI =  async (req: Request, res: Response) => {
  try {
    const { messages }: { messages: ChatMessage[] } = req.body;

    // Validate input
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    const lastMessage = messages[messages.length - 1].content;

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Convert ChatMessage[] to Content[]
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Start the chat and get the response
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      message: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(401).json({ error: 'Invalid or missing API key' });
      }
      if (error.message.includes('quota')) {
        return res.status(429).json({ error: 'API quota exceeded' });
      }
    }

    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
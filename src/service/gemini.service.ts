import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

/**
 * Generates reply suggestions using Google's Gemini AI API
 * @param messageText The message to generate replies for
 * @param previousMessages Previous messages for context (optional)
 * @param numSuggestions Number of suggestions to generate (default: 4)
 * @returns Array of suggested replies
 */
export const generateReplySuggestions = async (
  messageText: string,
  previousMessages: any[] = [],
  numSuggestions: number = 4
): Promise<string[]> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // Format previous messages for context
    const formattedPreviousMessages = previousMessages
      .slice(0, 5) // Limit to 5 most recent messages for context
      .map(msg => `${msg.senderId === previousMessages[0].receiverId ? 'User1' : 'User2'}: ${msg.text}`)
      .join('\n');

    // Create prompt for Gemini
    const prompt = `
You are an AI assistant helping to generate reply suggestions for a social media chat.

Previous conversation:
${formattedPreviousMessages}

Most recent message:
"${messageText}"

Generate ${numSuggestions} different natural-sounding reply suggestions that match the tone, style, and context of the conversation. 
The replies should sound like they're coming from a real person, not an AI.
Each reply should be different in content and approach.
Keep the replies concise and conversational.
Don't include any prefixes, numbering, or quotation marks in your responses.
Separate each suggestion with a ||| delimiter.
`;

    console.log('Sending request to Gemini API with prompt:', prompt);

    // Call Gemini API
    const response = await axios.post<GeminiResponse>(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Received response from Gemini API:', response.data);

    // Process the response
    const generatedText = response.data.candidates[0]?.content.parts[0].text || '';
    
    // Split by the delimiter and clean up
    let suggestions = generatedText.split('|||')
      .map(text => text.trim())
      .filter(text => text.length > 0);
    
    // Ensure we have exactly numSuggestions
    if (suggestions.length < numSuggestions) {
      // Add generic responses if we don't have enough
      const genericResponses = [
        "I see what you mean. What do you think about this?",
        "That's interesting! Tell me more.",
        "I appreciate your perspective on this.",
        "Thanks for sharing that with me."
      ];
      
      while (suggestions.length < numSuggestions && genericResponses.length > 0) {
        suggestions.push(genericResponses.shift() || "");
      }
    } else if (suggestions.length > numSuggestions) {
      // Trim to the requested number
      suggestions = suggestions.slice(0, numSuggestions);
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error generating reply suggestions with Gemini:', error);
    
    // Fallback to generic responses if the API call fails
    return [
      "I see what you mean. What do you think about this?",
      "That's interesting! Tell me more.",
      "I appreciate your perspective on this.",
      "Thanks for sharing that with me."
    ];
  }
}; 
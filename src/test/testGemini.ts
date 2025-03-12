import { generateReplySuggestions } from '../service/gemini.service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample message and conversation history
const messageText = "Hey, how's your day going? I've been really busy with work lately.";
const previousMessages = [
  {
    senderId: 'user1',
    receiverId: 'user2',
    text: "Hi there! Long time no see."
  },
  {
    senderId: 'user2',
    receiverId: 'user1',
    text: "Yeah, it's been a while! How have you been?"
  },
  {
    senderId: 'user1',
    receiverId: 'user2',
    text: messageText
  }
];

// Test the Gemini API integration
async function testGeminiIntegration() {
  console.log('Testing Gemini API integration...');
  console.log('Message to respond to:', messageText);
  
  try {
    const suggestions = await generateReplySuggestions(messageText, previousMessages);
    
    console.log('\nGenerated reply suggestions:');
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing Gemini integration:', error);
  }
}

// Run the test
testGeminiIntegration(); 
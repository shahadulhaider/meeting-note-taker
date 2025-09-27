import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { logger } from '../utils/logger';

let openaiClient: OpenAI | null = null;
let geminiClient: GoogleGenerativeAI | null = null;

// Initialize AI clients
if (config.ai.openaiKey) {
  openaiClient = new OpenAI({
    apiKey: config.ai.openaiKey,
  });
}

if (config.ai.googleAiKey) {
  geminiClient = new GoogleGenerativeAI(config.ai.googleAiKey);
}

export async function generateSummary(transcript: string): Promise<string> {
  const prompt = `Please provide a concise summary of the following meeting transcript.
  Focus on the main topics discussed, key decisions made, and important points raised.
  Keep it under 300 words.

  Transcript:
  ${transcript}`;

  // Try OpenAI first
  if (openaiClient && config.ai.openaiKey) {
    try {
      logger.info('Generating summary with OpenAI');
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes meeting transcripts.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0].message.content || 'Unable to generate summary';
    } catch (error) {
      logger.error('OpenAI summary generation failed:', error);
    }
  }

  // Try Gemini
  if (geminiClient && config.ai.googleAiKey) {
    try {
      logger.info('Generating summary with Gemini');
      const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Gemini summary generation failed:', error);
    }
  }

  // Fallback
  logger.warn('No AI service available, using mock summary');
  return getMockSummary();
}

export async function extractActionItems(transcript: string): Promise<any[]> {
  const prompt = `Extract action items from the following meeting transcript.
  Return them as a JSON array with the following structure:
  [{ "id": "1", "text": "action item description", "assignee": "person name if mentioned", "priority": "high/medium/low" }]

  Only return the JSON array, no additional text.

  Transcript:
  ${transcript}`;

  // Try OpenAI first
  if (openaiClient && config.ai.openaiKey) {
    try {
      logger.info('Extracting action items with OpenAI');
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that extracts action items from meeting transcripts. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '[]';
      try {
        return JSON.parse(content);
      } catch {
        return [];
      }
    } catch (error) {
      logger.error('OpenAI action item extraction failed:', error);
    }
  }

  // Try Gemini
  if (geminiClient && config.ai.googleAiKey) {
    try {
      logger.info('Extracting action items with Gemini');
      const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          return [];
        }
      }
    } catch (error) {
      logger.error('Gemini action item extraction failed:', error);
    }
  }

  // Fallback
  logger.warn('No AI service available, using mock action items');
  return getMockActionItems();
}

function getMockSummary(): string {
  return `This meeting focused on reviewing the current sprint progress and addressing key development tasks. The authentication module has been completed and is ready for testing, while the frontend UI components are 80% complete with an expected completion by tomorrow. The team discussed technical decisions regarding caching strategy, agreeing to use Redis for better scalability. A demo is scheduled for Friday, with a sync-up meeting planned for Thursday to ensure everyone is on track. The main blockers identified were around the caching implementation, which has now been resolved with the Redis decision.`;
}

function getMockActionItems(): any[] {
  return [
    {
      id: '1',
      text: 'Implement Redis caching for user sessions',
      assignee: 'Speaker 2',
      priority: 'high'
    },
    {
      id: '2',
      text: 'Complete frontend UI components and dashboard layout',
      assignee: 'Speaker 3',
      priority: 'high'
    },
    {
      id: '3',
      text: 'Connect frontend to backend API',
      assignee: 'Speaker 3',
      priority: 'medium'
    },
    {
      id: '4',
      text: 'Prepare deployment pipeline',
      assignee: 'Speaker 1',
      priority: 'medium'
    },
    {
      id: '5',
      text: 'Prepare demo for Friday presentation',
      assignee: 'Team',
      priority: 'high'
    }
  ];
}

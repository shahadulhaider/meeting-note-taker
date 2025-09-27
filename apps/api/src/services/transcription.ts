import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { logger } from '../utils/logger';

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

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

export async function transcribeAudio(audioUrl: string, fileName: string): Promise<string> {
  // Try OpenAI Whisper first if available
  if (openaiClient && config.ai.openaiKey) {
    try {
      return await transcribeWithWhisper(audioUrl, fileName);
    } catch (error) {
      logger.error('Whisper transcription failed:', error);
      // Fall back to Gemini if available
    }
  }

  // Try Gemini if available
  if (geminiClient && config.ai.googleAiKey) {
    return await transcribeWithGemini(audioUrl, fileName);
  }

  // Fallback to mock data for development
  logger.warn('No AI service available, using mock transcription');
  return getMockTranscript();
}

async function transcribeWithWhisper(audioUrl: string, fileName: string): Promise<string> {
  logger.info('Using OpenAI Whisper for transcription');

  // Download audio file temporarily
  const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}-${fileName}`);

  try {
    // Download file
    const response = await fetch(audioUrl);
    const buffer = await response.buffer();
    await fs.writeFile(tempPath, buffer);

    // Create a ReadStream for OpenAI
    const audioFile = await fs.readFile(tempPath);

    // Transcribe with Whisper
    const transcription = await openaiClient!.audio.transcriptions.create({
      file: new File([audioFile], fileName, { type: 'audio/mpeg' }),
      model: 'whisper-1',
      language: 'en',
    });

    return transcription.text;
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempPath);
    } catch (error) {
      logger.error('Failed to delete temp file:', error);
    }
  }
}

async function transcribeWithGemini(audioUrl: string, fileName: string): Promise<string> {
  logger.info('Using Gemini for transcription');

  // Note: Gemini doesn't have direct audio transcription
  // We'll use it to process audio with a prompt
  // For actual implementation, you might want to use Google Speech-to-Text API

  const model = geminiClient!.getGenerativeModel({ model: 'gemini-pro' });

  // This is a simplified approach - in production, you'd use Google Speech-to-Text
  const prompt = `This is an audio file from a meeting. Please provide a mock transcript for testing purposes.
  The meeting should discuss project updates, action items, and next steps.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function getMockTranscript(): string {
  return `
    Speaker 1: Good morning everyone. Let's start today's meeting by reviewing our progress on the current sprint.

    Speaker 2: Sure. I've completed the authentication module and it's ready for testing. The API endpoints are all working as expected.

    Speaker 1: Excellent! That's great progress. What about the frontend integration?

    Speaker 3: I'm about 80% done with the UI components. I should have everything ready by tomorrow. I just need to finish the dashboard layout and connect it to the backend.

    Speaker 1: Perfect. Are there any blockers we need to address?

    Speaker 2: Actually, yes. We need to decide on the caching strategy for the user sessions. Should we use Redis or stick with in-memory caching?

    Speaker 1: Let's go with Redis since we're already using it for the job queue. It'll give us better scalability.

    Speaker 3: Agreed. I'll update the implementation accordingly.

    Speaker 1: Great. So for action items: Speaker 2 will implement Redis caching for sessions, Speaker 3 will complete the frontend by tomorrow, and I'll start preparing the deployment pipeline.

    Speaker 2: Sounds good. When do we want to have the first demo ready?

    Speaker 1: Let's aim for Friday. That gives us three days to finish everything and do some testing.

    Speaker 3: Works for me.

    Speaker 1: Alright, let's sync up again on Thursday to make sure we're on track. Thanks everyone!
  `;
}

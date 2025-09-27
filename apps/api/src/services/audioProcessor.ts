import { logger } from '../utils/logger';
import { transcribeAudio } from './transcription';
import { generateSummary, extractActionItems } from './aiService';

export interface ProcessingResult {
  transcript: string;
  summary: string;
  actionItems: any[];
  processingTime: number;
  audioLength: number;
}

export async function processAudioFile(
  audioUrl: string,
  fileName: string,
  onProgress: (status: string, progress: number) => void
): Promise<ProcessingResult> {
  const startTime = Date.now();

  try {
    // Step 1: Transcribe audio
    onProgress('transcribing', 20);
    logger.info(`Starting transcription for ${fileName}`);

    const transcript = await transcribeAudio(audioUrl, fileName);
    logger.info(`Transcription completed: ${transcript.substring(0, 100)}...`);
    onProgress('transcribing', 50);

    // Step 2: Generate summary
    onProgress('summarizing', 60);
    logger.info('Generating summary...');

    const summary = await generateSummary(transcript);
    logger.info('Summary generated');
    onProgress('summarizing', 80);

    // Step 3: Extract action items
    onProgress('extracting', 90);
    logger.info('Extracting action items...');

    const actionItems = await extractActionItems(transcript);
    logger.info(`Found ${actionItems.length} action items`);

    const processingTime = Date.now() - startTime;

    return {
      transcript,
      summary,
      actionItems,
      processingTime,
      audioLength: 0, // Will be updated if we can get audio duration
    };
  } catch (error) {
    logger.error('Audio processing failed:', error);
    throw error;
  }
}

import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { config } from '../../config';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor() {
    if (!config.openaiApiKey) {
      console.warn('[OpenAiService] OPENAI_API_KEY is not set. OpenAI features will run in fallback mode.');
    }
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey || 'disabled-key',
    });
  }

  public getClient(): OpenAI {
    return this.openai;
  }

  public async getLlmCompletionStream(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
    if (!config.openaiApiKey) {
      console.warn('[OpenAiService] OPENAI_API_KEY missing, unable to create completion stream.');
      throw new Error('OPENAI_API_KEY is not configured in environment variables');
    }
    return this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      stream: true,
    });
  }

  public async analyzeCallDialogue(dialogueHistory: { role: string; content: string }[]) {
    if (!config.openaiApiKey) {
      console.warn('[OpenAiService] OPENAI_API_KEY missing. Returning fallback summary.');
      return {
        summary: 'Call dialogue recorded (OpenAI key not configured).',
        sentiment: 'NEUTRAL',
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a call analysis engine. Summarize the call history in one short sentence, and classify the overall sentiment as POSITIVE, NEUTRAL, or NEGATIVE.',
          },
          {
            role: 'user',
            content: JSON.stringify(dialogueHistory),
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || 'Conversation analyzed.',
        sentiment: parsed.sentiment || 'NEUTRAL',
      };
    } catch (err) {
      console.error('[OpenAiService] Failed to analyze call dialogue:', err);
      return {
        summary: 'Call dialogue recorded.',
        sentiment: 'NEUTRAL',
      };
    }
  }
}

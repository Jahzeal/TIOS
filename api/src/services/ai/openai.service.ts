import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { config } from '../../config';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = this.createClient();
  }

  private createClient(): OpenAI {
    const key = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || config.groqApiKey || config.openaiApiKey;
    const isGroq = key?.startsWith('gsk_') || !!process.env.GROQ_API_KEY;

    if (isGroq) {
      return new OpenAI({
        apiKey: key,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }

    return new OpenAI({
      apiKey: key || 'disabled-key',
    });
  }

  public getClient(): OpenAI {
    const key = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || config.groqApiKey || config.openaiApiKey;
    if (key && (this.openai as any)?.apiKey !== key) {
      this.openai = this.createClient();
    }
    return this.openai;
  }

  public getModel(): string {
    const key = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || config.groqApiKey || config.openaiApiKey;
    if (key?.startsWith('gsk_') || !!process.env.GROQ_API_KEY) {
      return 'llama-3.3-70b-versatile';
    }
    return 'gpt-4o-mini';
  }

  public async getLlmCompletionStream(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
    const key = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || config.groqApiKey || config.openaiApiKey;
    if (!key) {
      console.warn('[OpenAiService] API key missing, unable to create completion stream.');
      throw new Error('AI API Key is not configured in environment variables');
    }
    const client = this.getClient();
    const model = this.getModel();
    return client.chat.completions.create({
      model: model,
      messages: messages,
      stream: true,
    });
  }

  public async analyzeCallDialogue(dialogueHistory: { role: string; content: string }[]) {
    const key = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || config.groqApiKey || config.openaiApiKey;
    if (!key) {
      console.warn('[OpenAiService] API Key missing. Returning fallback summary.');
      return {
        summary: 'Call dialogue recorded (AI key not configured).',
        sentiment: 'NEUTRAL',
      };
    }

    try {
      const client = this.getClient();
      const model = this.getModel();
      const response = await client.chat.completions.create({
        model: model,
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
      });

      const content = response.choices[0]?.message?.content || '{}';
      try {
        const parsed = JSON.parse(content);
        return {
          summary: parsed.summary || content.slice(0, 100),
          sentiment: parsed.sentiment || 'NEUTRAL',
        };
      } catch (e) {
        return {
          summary: content.slice(0, 100) || 'Conversation analyzed.',
          sentiment: 'NEUTRAL',
        };
      }
    } catch (err) {
      console.error('[OpenAiService] Failed to analyze call dialogue:', err);
      return {
        summary: 'Call dialogue recorded.',
        sentiment: 'NEUTRAL',
      };
    }
  }
}

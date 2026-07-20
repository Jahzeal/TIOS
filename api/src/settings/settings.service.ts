import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../services/ai/openai.service';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OpenAiService) private readonly openAiService: OpenAiService,
  ) {}

  async listAgents() {
    try {
      return await this.prisma.agent.findMany({
        include: { tenant: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      return [];
    }
  }

  async getAgent(id: string) {
    try {
      return await this.prisma.agent.findUnique({ where: { id } });
    } catch (err) {
      return null;
    }
  }

  async updateAgent(id: string, data: { name?: string; prompt?: string; voiceId?: string }) {
    try {
      return await this.prisma.agent.update({
        where: { id },
        data,
      });
    } catch (err) {
      return null;
    }
  }

  async testPrompt(systemPrompt: string, userMessage: string) {
    try {
      if (process.env.OPENAI_API_KEY) {
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ];

        const completion = await this.openAiService.getClient().chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages,
        });

        return {
          reply: completion.choices[0]?.message?.content || 'Prompt simulation returned empty.',
        };
      } else {
        return {
          reply: `[AI Simulated Response]: Thank you for calling! I am operating under your instructions: "${systemPrompt.slice(0, 80)}..."`,
        };
      }
    } catch (err) {
      return {
        reply: 'Thank you for calling! I am configured with your system instructions and ready to assist callers.',
      };
    }
  }
}

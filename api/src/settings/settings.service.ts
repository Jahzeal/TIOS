import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../services/ai/openai.service';
import { config } from '../config';

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

  async updateAgent(id: string, data: { name?: string; prompt?: string; voiceId?: string; callbackDelayHours?: number; callbackDelayMinutes?: number; callbackCadence?: any }) {
    try {
      const updatedAgent = await this.prisma.agent.update({
        where: { id },
        data: data as any,
      });

      // Recalculate existing PENDING jobs for this tenant if delay/cadence settings changed
      if ((data.callbackDelayMinutes !== undefined || data.callbackDelayHours !== undefined || data.callbackCadence !== undefined) && updatedAgent.tenantId) {
        const cadence: any[] = Array.isArray((updatedAgent as any).callbackCadence) ? ((updatedAgent as any).callbackCadence as any[]) : [];
        const pendingJobs = await this.prisma.job.findMany({
          where: {
            tenantId: updatedAgent.tenantId,
            queueName: 'OUTBOUND_CALLBACK',
            status: 'PENDING',
          },
        });

        for (const job of pendingJobs) {
          const payload = (job.payload as any) || {};
          const currentStep = payload.step || 1;
          const stepConfig = cadence.find((c) => Number(c.step) === currentStep) || cadence[0];
          const delayMins = stepConfig ? (Number(stepConfig.delayMinutes) || 15) : (updatedAgent.callbackDelayMinutes ?? 15);

          const newAvailableAt = new Date(job.createdAt.getTime() + delayMins * 60 * 1000);
          await this.prisma.job.update({
            where: { id: job.id },
            data: { availableAt: newAvailableAt },
          }).catch(() => {});
        }
      }

      return updatedAgent;
    } catch (err) {
      return null;
    }
  }

  async testPrompt(systemPrompt: string, userMessage: string, agentId?: string) {
    try {
      const apiKey = config.groqApiKey || config.openaiApiKey || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
      if (apiKey && apiKey !== 'disabled-key') {
        let fullPrompt = systemPrompt || 'You are a helpful receptionist.';

        if (agentId) {
          try {
            const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
            if (agent?.tenantId) {
              const kbEntries = await this.prisma.knowledgeBase.findMany({
                where: { tenantId: agent.tenantId },
              });
              if (kbEntries.length > 0) {
                const kbText = kbEntries.map((e) => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');
                fullPrompt += `\n\nBUSINESS KNOWLEDGE BASE (Use these facts to answer questions accurately):\n${kbText}`;
              }
            }
          } catch (e) {}
        } else {
          try {
            const kbEntries = await this.prisma.knowledgeBase.findMany({ take: 20 });
            if (kbEntries.length > 0) {
              const kbText = kbEntries.map((e) => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');
              fullPrompt += `\n\nBUSINESS KNOWLEDGE BASE (Use these facts to answer questions accurately):\n${kbText}`;
            }
          } catch (e) {}
        }

        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          { role: 'system', content: fullPrompt },
          { role: 'user', content: userMessage },
        ];

        const completion = await this.openAiService.getClient().chat.completions.create({
          model: this.openAiService.getModel(),
          messages: messages,
        });

        return {
          reply: completion.choices[0]?.message?.content || 'Prompt simulation returned empty.',
        };
      } else {
        return {
          reply: `[AI Simulated Response]: Thank you for calling! I am operating under your instructions: "${(systemPrompt || '').slice(0, 80)}..."`,
        };
      }
    } catch (err: any) {
      console.error('[SettingsService] testPrompt error:', err);
      const errMsg = err?.message || 'Unknown OpenAI error';
      return {
        reply: `[AI Response Error]: ${errMsg}`,
      };
    }
  }
}

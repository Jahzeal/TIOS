import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { config } from '../config';

@Injectable()
export class VoiceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  public async getTenantAndAgent(rawTwilioPhone: string) {
    const twilioPhone = (rawTwilioPhone || '').trim();
    const cleanDigits = twilioPhone.replace(/\D/g, '');

    let tenant = null;

    if (twilioPhone) {
      tenant = await this.prisma.tenant.findFirst({
        where: {
          OR: [
            { twilioPhone: twilioPhone },
            { twilioPhone: { contains: cleanDigits.slice(-10) } },
          ],
        },
        include: { agents: true },
      });
    }

    if (!tenant) {
      tenant = await this.prisma.tenant.findFirst({
        include: { agents: true },
      });
    }

    if (!tenant) {
      const safePhone = twilioPhone || `+1888${Math.floor(1000000 + Math.random() * 9000000)}`;
      try {
        tenant = await this.prisma.tenant.create({
          data: {
            name: 'Default Business',
            twilioPhone: safePhone,
            forwardPhone: '+15555555555',
            agents: {
              create: {
                name: 'Emma',
                prompt:
                  'You are Emma, a friendly 24/7 AI Receptionist. Answer questions politely and concisely. Keep responses under 2 sentences.',
                voiceId: 'EXAVITQu4vr4xnSDxMaL',
              },
            },
          },
          include: { agents: true },
        });
      } catch (e) {
        tenant = await this.prisma.tenant.findFirst({ include: { agents: true } });
      }
    }

    let agent = tenant?.agents?.[0];
    if (!agent && tenant) {
      try {
        agent = await this.prisma.agent.create({
          data: {
            name: 'Emma',
            prompt: 'You are Emma, a friendly 24/7 AI Receptionist. Answer questions politely and concisely.',
            voiceId: 'EXAVITQu4vr4xnSDxMaL',
            tenantId: tenant.id,
          },
        });
      } catch (e) {
        // Fallback dummy agent
        agent = {
          id: 'default-agent',
          name: 'Emma',
          prompt: 'You are Emma, a friendly 24/7 AI Receptionist.',
          voiceId: 'EXAVITQu4vr4xnSDxMaL',
          tenantId: tenant.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any;
      }
    }

    return { tenant, agent };
  }

  public async isRateLimited(fromNumber: string, tenantId: string): Promise<boolean> {
    if (!fromNumber || fromNumber === 'Unknown' || !tenantId) return false;

    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
    const recentCallCount = await this.prisma.call.count({
      where: {
        callerPhone: fromNumber,
        tenantId: tenantId,
        createdAt: {
          gte: ONE_HOUR_AGO,
        },
      },
    });
    return recentCallCount >= config.rateLimitCallsPerHour;
  }

  public async handlePostStream(callSid: string): Promise<string> {
    const call = await this.prisma.call.findUnique({
      where: { sid: callSid },
      include: { tenant: true },
    });

    if (call && call.status === 'FORWARD_REQUESTED' && call.tenant?.forwardPhone) {
      console.log(`[Emergency Routing] Dialing forward phone: ${call.tenant.forwardPhone}`);
      return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>An emergency has been detected. Forwarding you to our support staff immediately. Please hold.</Say><Dial>${call.tenant.forwardPhone}</Dial></Response>`.trim();
    }

    return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thank you for calling. Goodbye.</Say><Hangup/></Response>`.trim();
  }

  public async createInitialCallRecord(data: { sid: string; callerPhone: string; tenantId: string; agentId: string }) {
    if (!data.sid) return null;
    try {
      return await this.prisma.call.upsert({
        where: { sid: data.sid },
        update: { callerPhone: data.callerPhone },
        create: {
          sid: data.sid,
          direction: 'INBOUND',
          status: 'IN_PROGRESS',
          callerPhone: data.callerPhone,
          tenantId: data.tenantId,
          agentId: data.agentId,
        },
      });
    } catch (err) {
      console.error('[VoiceService] Failed to create initial call record:', err);
      return null;
    }
  }
}

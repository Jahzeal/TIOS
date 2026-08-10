import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { config } from '../config';

@Injectable()
export class VoiceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  public async getTenantAndAgentById(tenantId?: string) {
    if (!tenantId) return { tenant: null, agent: null };
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { agents: true },
      });
      if (!tenant) return { tenant: null, agent: null };
      const agent = tenant.agents[0] || null;
      return { tenant, agent };
    } catch (e) {
      return { tenant: null, agent: null };
    }
  }

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
            name: 'Hive Business',
            twilioPhone: safePhone,
            forwardPhone: '+15555555555',
            agents: {
              create: {
                name: 'Hive AI Agent',
                prompt:
                  'You are Hive, a friendly 24/7 AI Receptionist. Answer questions politely and concisely.',
                voiceId: '21m00Tcm4TlvDq8ikWAM',
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
            name: 'Hive AI Agent',
            prompt: 'You are Hive, a friendly 24/7 AI Receptionist. Answer questions politely and concisely.',
            voiceId: '21m00Tcm4TlvDq8ikWAM',
            tenantId: tenant.id,
          },
        });
      } catch (e) {
        // Fallback dummy agent
        agent = {
          id: 'default-agent',
          name: 'Hive AI Agent',
          prompt: 'You are Hive, a friendly 24/7 AI Receptionist.',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
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

    if (call) {
      if (call.status === 'FORWARD_REQUESTED') {
        if (call.tenant?.forwardPhone) {
          console.log(`[Emergency/Callback Routing] Dialing forward phone: ${call.tenant.forwardPhone}`);
          return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>A representative is being connected to your line immediately. Please hold.</Say><Dial>${call.tenant.forwardPhone}</Dial></Response>`.trim();
        } else {
          console.log(`[Callback Request] No forward phone configured. Sending Hangup TwiML.`);
          return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thank you. A representative has been notified and will call you back shortly. Goodbye.</Say><Hangup/></Response>`.trim();
        }
      }

      if (call.status === 'IN_PROGRESS') {
        await this.prisma.call.update({
          where: { id: call.id },
          data: { status: 'COMPLETED' },
        }).catch((e) => console.error('[VoiceService] Failed to update post-stream call status:', e));
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thank you for calling. Goodbye.</Say><Hangup/></Response>`.trim();
  }

  public async createInitialCallRecord(data: { sid: string; callerPhone: string; tenantId: string; agentId: string; direction?: string }) {
    if (!data.sid) return null;
    const callDirection = (data.direction || 'INBOUND').toUpperCase();
    try {
      return await this.prisma.call.upsert({
        where: { sid: data.sid },
        update: { callerPhone: data.callerPhone, direction: callDirection },
        create: {
          sid: data.sid,
          direction: callDirection,
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

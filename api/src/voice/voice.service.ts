import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { config } from '../config';

@Injectable()
export class VoiceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  public async getTenantAndAgent(twilioPhone: string) {
    let tenant = await this.prisma.tenant.findFirst({
      where: { twilioPhone },
      include: { agents: true },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: 'Default Business',
          twilioPhone: twilioPhone || '+18885550101',
          forwardPhone: '+15555555555',
          agents: {
            create: {
              name: 'Emma',
              prompt:
                'You are Emma, a friendly 24/7 AI Receptionist. Answer questions politely and concisely. Keep responses under 2 sentences.',
              voiceId: '21m00Tcm4TlvDq8ikWAM',
            },
          },
        },
        include: { agents: true },
      });
    }

    const agent =
      tenant.agents[0] ||
      (await this.prisma.agent.create({
        data: {
          name: 'Emma',
          prompt: 'You are Emma, a friendly 24/7 AI Receptionist. Answer questions politely and concisely.',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          tenantId: tenant.id,
        },
      }));

    return { tenant, agent };
  }

  public async isRateLimited(fromNumber: string, tenantId: string): Promise<boolean> {
    if (!fromNumber || fromNumber === 'Unknown') return false;

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
      return `
        <Response>
          <Say>An emergency has been detected. Forwarding you to our support staff immediately. Please hold.</Say>
          <Dial>${call.tenant.forwardPhone}</Dial>
        </Response>
      `;
    }

    return `
      <Response>
        <Say>Thank you for calling. Goodbye.</Say>
        <Hangup/>
      </Response>
    `;
  }
}

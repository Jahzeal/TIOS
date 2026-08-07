import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { config } from '../config';

@Injectable()
export class QueueWorkerService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  onModuleInit() {
    console.log('[QueueWorkerService] Outbound Callback Worker initialized. Polling every 30 seconds...');
    this.timer = setInterval(() => this.processDueJobs(), 30000);
    // Also run an immediate check 5 seconds after startup
    setTimeout(() => this.processDueJobs(), 5000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  public async processDueJobs() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      const dueJobs = await this.prisma.job.findMany({
        where: {
          queueName: 'OUTBOUND_CALLBACK',
          status: 'PENDING',
          availableAt: { lte: now },
        },
        take: 10,
        include: { tenant: true },
      });

      if (dueJobs.length > 0) {
        console.log(`[QueueWorkerService] Found ${dueJobs.length} due outbound callback jobs to process.`);
      }

      for (const job of dueJobs) {
        await this.executeOutboundCallbackJob(job);
      }
    } catch (err) {
      console.error('[QueueWorkerService] Error processing due jobs:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeOutboundCallbackJob(job: any) {
    try {
      const payload = (job.payload as any) || {};
      const phone = payload.phone || payload.callerPhone;
      const tenantId = job.tenantId || payload.tenantId;

      if (!phone || phone.includes('Web Voice') || phone.includes('Inbound Phone Call')) {
        console.log(`[QueueWorkerService] Job ${job.id} skipped (Web Call / Invalid phone: "${phone}"). Marking COMPLETED.`);
        await this.prisma.job.update({
          where: { id: job.id },
          data: { status: 'COMPLETED', error: 'Skipped for web call simulator phone' },
        });
        return;
      }

      const accountSid = config.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
      const authToken = config.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
      const fromPhone = job.tenant?.twilioPhone || config.twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER || '+15876028009';

      if (!accountSid || !authToken || !fromPhone) {
        console.warn(`[QueueWorkerService] Job ${job.id} postponed. Missing Twilio credentials (Sid: ${!!accountSid}, Auth: ${!!authToken}, From: ${fromPhone}).`);
        return;
      }

      const host = process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.port}`;
      const serviceParam = encodeURIComponent((payload.inquiredService || payload.service || '').toString());
      const amountParam = payload.amount || 0;
      const intentParam = encodeURIComponent((payload.intentType || payload.intent || 'PAYMENT_LINK').toString());
      const callbackWebhookUrl = `${host}/voice?direction=OUTBOUND&tenantId=${tenantId || ''}&service=${serviceParam}&amount=${amountParam}&intent=${intentParam}`;

      console.log(`[QueueWorkerService] Triggering Twilio Outbound Call for Job ${job.id} to ${phone} (Webhook: ${callbackWebhookUrl})...`);

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const bodyParams = new URLSearchParams();
      bodyParams.append('From', fromPhone);
      bodyParams.append('To', phone);
      bodyParams.append('Url', callbackWebhookUrl);

      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      if (twilioRes.ok) {
        const resData: any = await twilioRes.json();
        console.log(`[QueueWorkerService] Twilio Outbound Call dispatched! CallSid: ${resData.sid}`);

        await this.prisma.job.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            attempts: job.attempts + 1,
          },
        });
      } else {
        const errText = await twilioRes.text();
        console.error(`[QueueWorkerService] Twilio Call Dispatch Failed for Job ${job.id}:`, errText);

        const nextAttempts = job.attempts + 1;
        const isFailed = nextAttempts >= job.maxAttempts;

        await this.prisma.job.update({
          where: { id: job.id },
          data: {
            status: isFailed ? 'FAILED' : 'PENDING',
            attempts: nextAttempts,
            availableAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
            error: errText.slice(0, 250),
          },
        });
      }
    } catch (jobErr: any) {
      console.error(`[QueueWorkerService] Failed to execute job ${job.id}:`, jobErr);
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: jobErr.message || 'Job execution error',
        },
      }).catch(() => {});
    }
  }

  public async scheduleOutboundCallback(params: {
    tenantId?: string;
    phone: string;
    inquiredService?: string;
    amount?: number;
    delayMinutes?: number;
    delayHours?: number;
  }) {
    try {
      let delayMs = (15 * 60 * 1000); // Default 15 minutes

      if (typeof params.delayMinutes === 'number' && params.delayMinutes > 0) {
        delayMs = params.delayMinutes * 60 * 1000;
      } else if (typeof params.delayHours === 'number' && params.delayHours > 0) {
        delayMs = params.delayHours * 60 * 60 * 1000;
      } else if (params.tenantId) {
        const agent = await this.prisma.agent.findFirst({
          where: { tenantId: params.tenantId },
        });
        if (agent) {
          const agentAny = agent as any;
          if (typeof agentAny.callbackDelayMinutes === 'number' && agentAny.callbackDelayMinutes > 0) {
            delayMs = agentAny.callbackDelayMinutes * 60 * 1000;
          } else if (typeof agentAny.callbackDelayHours === 'number' && agentAny.callbackDelayHours > 0) {
            delayMs = agentAny.callbackDelayHours * 60 * 60 * 1000;
          }
        }
      }

      const availableAt = new Date(Date.now() + delayMs);

      const job = await this.prisma.job.create({
        data: {
          queueName: 'OUTBOUND_CALLBACK',
          status: 'PENDING',
          attempts: 0,
          maxAttempts: 3,
          availableAt: availableAt,
          tenantId: params.tenantId || null,
          payload: {
            phone: params.phone,
            tenantId: params.tenantId,
            inquiredService: params.inquiredService,
            amount: params.amount,
          },
        } as any,
      });

      console.log(`[QueueWorkerService] Enqueued OUTBOUND_CALLBACK Job ${job.id} for phone ${params.phone}. Target AvailableAt: ${availableAt.toISOString()}`);
      return job;
    } catch (err) {
      console.error('[QueueWorkerService] Failed to schedule outbound callback job:', err);
      return null;
    }
  }
}

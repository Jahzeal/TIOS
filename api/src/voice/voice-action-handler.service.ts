import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../services/ai/openai.service';
import { PaymentsService } from '../payments/payments.service';
import { QueueWorkerService } from '../queue/queue-worker.service';
import { VoiceService } from './voice.service';

@Injectable()
export class VoiceActionHandlerService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OpenAiService) private readonly openAiService: OpenAiService,
    @Inject(PaymentsService) private readonly paymentsService: PaymentsService,
    @Inject(QueueWorkerService) private readonly queueWorkerService: QueueWorkerService,
    @Inject(VoiceService) private readonly voiceService: VoiceService,
  ) {}

  public async handleHangupAction(callSid: string) {
    if (!callSid) return;
    setTimeout(async () => {
      console.log(`[VoiceActionHandler] [ACTION:HANGUP] Triggered. Executing clean Twilio call hangup for ${callSid}`);
      await this.voiceService.hangupCall(callSid);
    }, 4500);
  }

  public async handlePaymentAction(params: {
    responseText: string;
    chatHistory: { role: string; content: string }[];
    callerPhone: string;
    targetTenantId?: string;
    callRecordId?: string;
  }) {
    const { responseText, chatHistory, callerPhone, targetTenantId, callRecordId } = params;

    let itemDesc = 'Utility Service Setup';
    let itemPrice = 250;

    const lowerResponse = responseText.toLowerCase();
    const lowerHistory = chatHistory.map((h) => h.content.toLowerCase()).join(' ');

    if (lowerResponse.includes('wooden') || lowerHistory.includes('wooden door')) {
      itemDesc = 'wooden door';
      itemPrice = 500;
    } else if (lowerResponse.includes('italian') || lowerHistory.includes('italian door')) {
      itemDesc = 'Italian door';
      itemPrice = 2000;
    }

    const priceMatch = responseText.match(/\$([0-9]+(?:\.[0-9]{2})?)/);
    if (priceMatch && priceMatch[1]) {
      const parsedPrice = parseFloat(priceMatch[1]);
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        itemPrice = parsedPrice;
      }
    }

    try {
      const checkoutResult = await this.paymentsService.createCheckoutLink({
        tenantId: targetTenantId,
        amount: itemPrice,
        phone: callerPhone,
        inquiredService: itemDesc,
        callId: callRecordId,
        status: 'SMS_SENT',
        notes: `AI Voice Receptionist dispatched checkout link for ${itemDesc} ($${itemPrice}).`,
      });

      console.log(`[VoiceActionHandler] Created checkout link for ${callerPhone}: ${checkoutResult.link}`);

      if (checkoutResult && checkoutResult.id) {
        if ((checkoutResult as any).wasReused) {
          // SMS was already sent for this payment record on the first dispatch — skip to avoid duplicate texts
          console.log(`[VoiceActionHandler] Skipping duplicate SMS for reused payment record ${checkoutResult.id}`);
        } else {
          await this.paymentsService.sendPaymentSms(checkoutResult.id);
          console.log(`[VoiceActionHandler] Dispatched payment SMS for payment ID ${checkoutResult.id}`);
        }
      }

      // Schedule outbound callback job based on tenant settings
      if (callerPhone && !callerPhone.includes('Web Voice') && !callerPhone.includes('Inbound Phone Call')) {
        await this.queueWorkerService.scheduleOutboundCallback({
          tenantId: targetTenantId,
          phone: callerPhone,
          inquiredService: itemDesc,
          amount: itemPrice,
        });
      }

      return checkoutResult;
    } catch (err) {
      console.error('[VoiceActionHandler] Failed to handle payment action:', err);
      return null;
    }
  }

  public async handleCallbackAction(callRecordId?: string) {
    if (!callRecordId) return;
    try {
      await this.prisma.call.update({
        where: { id: callRecordId },
        data: { status: 'FORWARD_REQUESTED' },
      });
      console.log(`[VoiceActionHandler] Human callback requested for call record: ${callRecordId}`);
    } catch (err) {
      console.error('[VoiceActionHandler] Failed to log callback request:', err);
    }
  }

  public async finalizeCallSummary(params: {
    callRecordId?: string;
    callSid?: string;
    trueSid?: string;
    chatHistory: { role: string; content: string }[];
    startTime: number;
    callerPhone: string;
    targetTenantId?: string;
  }) {
    const { callRecordId, callSid, trueSid, chatHistory, startTime, callerPhone, targetTenantId } = params;

    const duration = Math.round((Date.now() - startTime) / 1000);

    try {
      let targetCallId = callRecordId;
      if (!targetCallId && (callSid || trueSid)) {
        const foundCall = await this.prisma.call.findFirst({
          where: { sid: { in: [trueSid, callSid].filter(Boolean) as string[] } },
        });
        if (foundCall) targetCallId = foundCall.id;
      }

      if (targetCallId) {
        const callRecord = await this.prisma.call.findUnique({ where: { id: targetCallId } });
        const finalStatus =
          callRecord?.status === 'FORWARD_REQUESTED' ? 'FORWARD_REQUESTED' : 'COMPLETED';

        const dialogueHistory = chatHistory.filter((t) => t.role !== 'system');
        const formattedHistory = dialogueHistory.map((t) => ({
          role: t.role,
          text: t.content,
          timestamp: new Date().toISOString(),
        }));

        const analysis = await this.openAiService.analyzeCallDialogue(dialogueHistory);

        await this.prisma.call.update({
          where: { id: targetCallId },
          data: {
            status: finalStatus,
            duration: duration,
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            transcript: formattedHistory as any,
          },
        });
        console.log(`[VoiceActionHandler] Saved call record ${targetCallId} summary & transcript successfully.`);

        // Auto-create PENDING_QUOTE for prospective inquiries if none exists
        try {
          const existingPayment = await this.prisma.payment.findFirst({
            where: { phone: callerPhone, status: { in: ['PENDING_QUOTE', 'SMS_SENT', 'PAID'] } },
          });

          const quoteAmount = (analysis as any).quotedAmount;
          const serviceName = (analysis as any).inquiredService;

          if (callerPhone && typeof quoteAmount === 'number' && quoteAmount > 0) {
            if (existingPayment && existingPayment.status === 'PENDING_QUOTE') {
              await this.prisma.payment.update({
                where: { id: existingPayment.id },
                data: {
                  amount: quoteAmount,
                  inquiredService: serviceName || 'Service Inquiry',
                  callId: targetCallId,
                  notes: `Updated from call dialogue: "${analysis.summary || 'Caller inquired about service options.'}"`,
                },
              });
              console.log(`[VoiceActionHandler] Updated PENDING_QUOTE ($${quoteAmount} for ${serviceName || 'Service Inquiry'}) for caller ${callerPhone}.`);
            } else if (!existingPayment) {
              await this.paymentsService.createCheckoutLink({
                tenantId: targetTenantId,
                amount: quoteAmount,
                phone: callerPhone,
                inquiredService: serviceName || 'Service Inquiry',
                callId: targetCallId,
                status: 'PENDING_QUOTE',
                notes: `Auto-captured from call dialogue: "${analysis.summary || 'Caller inquired about service options.'}"`,
              });

              if (!callerPhone.includes('Web Voice') && !callerPhone.includes('Inbound Phone Call')) {
                await this.queueWorkerService.scheduleOutboundCallback({
                  tenantId: targetTenantId,
                  phone: callerPhone,
                  inquiredService: serviceName || 'Service Inquiry',
                  amount: quoteAmount,
                });
              }

              console.log(`[VoiceActionHandler] Logged new PENDING_QUOTE ($${quoteAmount} for ${serviceName || 'Service Inquiry'}) for caller ${callerPhone}.`);
            }
          }
        } catch (quoteErr) {
          console.error('[VoiceActionHandler] Failed to log pending quote:', quoteErr);
        }
      }
    } catch (err) {
      console.error('[VoiceActionHandler] Cleanup update failed:', err);
    }
  }
}

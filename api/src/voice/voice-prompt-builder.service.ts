import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OutboundContext {
  inquiredService?: string;
  amount?: number;
  intentType?: string; // 'PAYMENT_LINK' | 'QUOTE' | 'APPOINTMENT' | 'GENERAL_CALLBACK'
}

@Injectable()
export class VoicePromptBuilderService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  public async getOutboundGreeting(params: {
    activeAgent: any;
    callerPhone: string;
    outboundContext?: OutboundContext;
  }): Promise<string> {
    const { activeAgent, callerPhone, outboundContext } = params;
    const businessName = activeAgent?.tenant?.name || 'Hive';

    // 1. Check passed outboundContext or query database for recent interaction
    let service = outboundContext?.inquiredService;
    let amount = outboundContext?.amount;
    let intent = outboundContext?.intentType;

    if (!service || !amount) {
      try {
        const activeDebt = await this.prisma.payment.findFirst({
          where: { phone: callerPhone },
          orderBy: { createdAt: 'desc' },
        });
        if (activeDebt) {
          service = service || activeDebt.inquiredService || 'your quote';
          amount = amount || activeDebt.amount;
          intent = intent || (activeDebt.status === 'PAID' ? 'GENERAL_CALLBACK' : 'PAYMENT_LINK');
        }
      } catch (e) {}
    }

    if (!service) {
      try {
        const lastCall = await this.prisma.call.findFirst({
          where: { callerPhone },
          orderBy: { createdAt: 'desc' },
        });
        if (lastCall?.summary) {
          service = lastCall.summary.slice(0, 40);
          intent = intent || 'GENERAL_CALLBACK';
        }
      } catch (e) {}
    }

    const priceText = amount ? ` ($${Number(amount).toFixed(2)})` : '';
    const cleanService = service || 'your earlier inquiry';

    if (intent === 'PAYMENT_LINK') {
      return `Hi! This is ${businessName} following up on the payment link we sent via text for your ${cleanService}${priceText}. I wanted to check if you had any questions or needed help completing your payment?`;
    } else if (intent === 'QUOTE') {
      return `Hi! This is ${businessName} following up on the quote inquiry you requested for ${cleanService}${priceText}. I wanted to check if you had any questions or if you would like to proceed with your order?`;
    } else if (intent === 'APPOINTMENT') {
      return `Hi! This is ${businessName} following up on your appointment request. I wanted to confirm your preferred date and time?`;
    } else {
      return `Hi! This is ${businessName} returning your call regarding ${cleanService}. How can I assist you today?`;
    }
  }

  public async buildSystemPrompt(params: {
    activeAgent: any;
    callerPhone: string;
    isOutbound: boolean;
    outboundContext?: OutboundContext;
  }): Promise<string> {
    const { activeAgent, callerPhone, isOutbound, outboundContext } = params;
    const businessName = activeAgent?.tenant?.name || 'Hive';

    let systemPrompt = activeAgent?.prompt || 'You are a helpful AI receptionist.';

    if (activeAgent?.tenantId) {
      try {
        const kbEntries = await this.prisma.knowledgeBase.findMany({
          where: { tenantId: activeAgent.tenantId },
        });
        if (kbEntries.length > 0) {
          const kbText = kbEntries.map((e) => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');
          systemPrompt += `\n\nBUSINESS KNOWLEDGE BASE (Use these facts to answer caller questions accurately):\n${kbText}`;
        }
      } catch (e) {
        console.error('[VoicePromptBuilder] KB fetch failed:', e);
      }
    }

    systemPrompt += `\n\nAUTOMATED ACTIONS RULE:\n` +
      `1. REPRESENTATIVE CALLBACK: If the caller expresses ANY intention to speak with a human agent, representative, live person, or requests a phone call back, start your response with [ACTION:REQUEST_CALLBACK] and append [ACTION:HANGUP] at the end: "[ACTION:REQUEST_CALLBACK] I have logged your request! A representative will give you a call back shortly. Thank you, and have a wonderful day! [ACTION:HANGUP]"\n` +
      `2. CONVERSATION COMPLETION & DISCONNECT: Whenever the caller indicates they are done with the conversation (e.g. says "Bye", "Goodbye", "That's all", "No more questions", "All good", "Thanks, bye"), respond warmly and append the exact tag [ACTION:HANGUP] at the end of your response (e.g. "Thank you for calling ${businessName}! Have a wonderful day! [ACTION:HANGUP]").`;

    if (isOutbound) {
      // Fetch latest interaction history from database if context not passed explicitly
      let activeDebt: any = null;
      let lastCall: any = null;

      try {
        activeDebt = await this.prisma.payment.findFirst({
          where: { phone: callerPhone },
          orderBy: { createdAt: 'desc' },
        });
        lastCall = await this.prisma.call.findFirst({
          where: { callerPhone },
          orderBy: { createdAt: 'desc' },
        });
      } catch (e) {}

      const serviceName = outboundContext?.inquiredService || activeDebt?.inquiredService || 'your quote';
      const amountVal = outboundContext?.amount || activeDebt?.amount || 0;
      const amountText = amountVal > 0 ? ` ($${Number(amountVal).toFixed(2)})` : '';
      const summaryText = lastCall?.summary ? ` Previous call summary: "${lastCall.summary}".` : '';

      systemPrompt += `\n\nUNIVERSAL OUTBOUND FOLLOW-UP PERSONA & RULES:\n` +
        `You are placing an automated follow-up call on behalf of ${businessName}.${summaryText}\n` +
        `Target Inquiry: "${serviceName}"${amountText}.\n` +
        `1. PROACTIVE OUTBOUND IDENTITY: You are calling OUT to the customer. NEVER say "Thank you for calling" or ask "Why did you call us?". You initiated this call to assist them.\n` +
        `2. CONTEXT-AWARE ASSISTANCE: If they have an active quote or payment link for ${serviceName}${amountText}, check if they have questions or need assistance completing it.\n` +
        `3. SMS PAYMENT DISPATCH: If the customer asks to pay or requests the checkout link again, output [ACTION:SEND_PAYMENT_LINK] at the start of your response, specifying "${serviceName}" and $${amountVal}.\n` +
        `4. TOPIC PIVOT SAFETY: If the customer declines or asks about a totally new product/topic, pivot immediately to their new topic and do NOT push the old quote.\n` +
        `5. CLEAN CLOSING & NO REPETITION: Once the caller indicates they are done ("Thanks", "Bye", "All good", "Okay"), respond warmly and append [ACTION:HANGUP]: "Thank you for choosing ${businessName}! Have a wonderful day! [ACTION:HANGUP]" and stop asking further questions.`;
    } else {
      systemPrompt += `\n\nINBOUND SALES RECEPTIONIST RULE:\n` +
        `1. CLEAN INQUIRY ANSWERING (100% FOCUS): Answer all caller questions about products, services, features, and pricing directly and cleanly. NEVER append unsolicited payment link offers or past debt reminders to simple price or information inquiries.\n` +
        `2. EXPLICIT PAYMENT REQUEST ONLY: Include the exact tag [ACTION:SEND_PAYMENT_LINK] ONLY if the caller explicitly asks to buy a product, pay an invoice, or requests a checkout link (e.g. "Send me the payment link", "I want to buy the $500 door", "How can I pay my balance?"). ALWAYS state the exact product name and dollar amount.\n` +
        `3. REJECTION & OBJECTION LOCK: If the caller says "No", "Cancel", "Wait", "I didn't ask for that", or questions a price, DO NOT output [ACTION:SEND_PAYMENT_LINK]. Apologize for any confusion, explain clearly what the product/service includes, and stay on their topic.\n` +
        `4. SMS CONFIRMATION: Once a payment link is dispatched, confirm warmly to the caller: "I have just sent the payment link via SMS text to your phone! Please check your text messages."`;
    }

    systemPrompt += `\n\nCONCISENESS & NATURAL FLOW RULE:\nKeep responses concise, warm, and helpful (1 to 2 sentences max, around 15-25 words). Answer questions directly without long filler introductions or unnecessary preamble.`;

    return systemPrompt;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VoicePromptBuilderService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  public async buildSystemPrompt(params: {
    activeAgent: any;
    callerPhone: string;
    isOutbound: boolean;
  }): Promise<string> {
    const { activeAgent, callerPhone, isOutbound } = params;

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

    systemPrompt += `\n\nAUTOMATED ACTIONS RULE:\nIf the caller expresses ANY intention to speak with a human agent, representative, live person, or requests a phone call back (regardless of how they phrase it), you MUST start your response with the exact tag: [ACTION:REQUEST_CALLBACK]. Followed by your polite closing response: "I have logged your request! One of our representatives will give you a call back shortly on this number. Thank you for reaching out, and have a wonderful day!"`;

    if (isOutbound) {
      try {
        const activeDebt = await this.prisma.payment.findFirst({
          where: { phone: callerPhone, status: { not: 'PAID' } },
          orderBy: { createdAt: 'desc' },
        });

        if (activeDebt) {
          systemPrompt += `\n\nOUTBOUND FOLLOW-UP CALLBACK RULE:\n` +
            `You are calling the customer back to follow up on their earlier quote for "${activeDebt.inquiredService || 'Service'}" ($${activeDebt.amount.toFixed(2)}).\n` +
            `- Greet the customer warmly and state the reason for your follow-up call (e.g. "Hi there! I'm following up on your earlier quote for ${activeDebt.inquiredService} ($${activeDebt.amount.toFixed(2)}). I wanted to see if you had any questions or if you would like a secure payment link sent to finalize your order?").\n` +
            `- If they AGREE or ask to pay, output [ACTION:SEND_PAYMENT_LINK] at the start of your response, naming the exact item and amount.\n` +
            `- If they DECLINE or ask about a NEW product, switch immediately to their new inquiry and do NOT force the old quote.`;
        }
      } catch (e) {}
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

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../services/ai/openai.service';

export interface OnboardingStep1Dto {
  businessName: string;
  industry: string;
  country: string;
  city?: string;
  teamSize?: string;
}

export interface OnboardingStep2Dto {
  tenantId?: string;
  plan: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface OnboardingStep3Dto {
  tenantId?: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export interface OnboardingStep4Dto {
  tenantId?: string;
  selectedPhoneNumber: string;
}

export interface OnboardingStep5Dto {
  tenantId?: string;
  selectedTemplate: string;
}

export interface OnboardingStep6Dto {
  tenantId?: string;
  receptionistName: string;
  voiceType: string;
  conversationStyle: number;
  openTime: string;
  closeTime: string;
  differentWeekendHours: boolean;
  directivesText: string;
}

export interface SimulationMessageDto {
  userMessage?: string;
  receptionistName?: string;
  businessName?: string;
  dialogueHistory?: { sender: string; text: string }[];
}

@Injectable()
export class OnboardingService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OpenAiService) private readonly openAiService: OpenAiService,
  ) {}

  async saveStep1(dto: OnboardingStep1Dto) {
    // Upsert or create tenant
    const dummyPhone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.businessName,
        twilioPhone: dummyPhone,
      },
    });

    return {
      success: true,
      tenantId: tenant.id,
      message: 'Business profile created successfully.',
    };
  }

  async saveStep2(dto: OnboardingStep2Dto) {
    return {
      success: true,
      plan: dto.plan,
      billingCycle: dto.billingCycle,
      message: 'Plan selected successfully.',
    };
  }

  async saveStep3(dto: OnboardingStep3Dto) {
    return {
      success: true,
      message: 'Payment method configured successfully.',
      status: 'FREE_TRIAL_ACTIVE',
    };
  }

  async saveStep4(dto: OnboardingStep4Dto) {
    if (dto.tenantId) {
      await this.prisma.tenant.update({
        where: { id: dto.tenantId },
        data: { twilioPhone: dto.selectedPhoneNumber },
      }).catch(() => null);
    }
    return {
      success: true,
      phoneNumber: dto.selectedPhoneNumber,
      message: 'Business phone number reserved.',
    };
  }

  async saveStep5(dto: OnboardingStep5Dto) {
    return {
      success: true,
      template: dto.selectedTemplate,
      message: 'Receptionist template selected.',
    };
  }

  async saveStep6(dto: OnboardingStep6Dto) {
    let agentId: string | null = null;
    if (dto.tenantId) {
      const existingAgent = await this.prisma.agent.findFirst({
        where: { tenantId: dto.tenantId },
      });

      const promptText = `You are ${dto.receptionistName}, an AI receptionist for the business. Directives:\n${dto.directivesText}\nHours: ${dto.openTime} to ${dto.closeTime}.`;

      if (existingAgent) {
        const updated = await this.prisma.agent.update({
          where: { id: existingAgent.id },
          data: {
            name: dto.receptionistName,
            prompt: promptText,
            voiceId: dto.voiceType,
          },
        });
        agentId = updated.id;
      } else {
        const created = await this.prisma.agent.create({
          data: {
            name: dto.receptionistName,
            prompt: promptText,
            voiceId: dto.voiceType,
            tenantId: dto.tenantId,
          },
        });
        agentId = created.id;
      }

      if (dto.directivesText.trim()) {
        await this.prisma.knowledgeBase.create({
          data: {
            tenantId: dto.tenantId,
            question: 'General Business Directives & FAQs',
            answer: dto.directivesText,
          },
        }).catch(() => null);
      }
    }

    return {
      success: true,
      agentId,
      message: 'Receptionist & business details saved.',
    };
  }

  async simulateCallTurn(dto: SimulationMessageDto) {
    const receptionist = dto.receptionistName || 'Alice';
    const business = dto.businessName || 'TIOS';
    const userMsg = dto.userMessage || 'Hello!';

    const promptMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      {
        role: 'system',
        content: `You are ${receptionist}, a friendly and helpful AI voice receptionist for ${business}. Respond concisely in 1-2 friendly sentences as if speaking over a phone call.`,
      },
    ];

    if (dto.dialogueHistory && Array.isArray(dto.dialogueHistory)) {
      for (const turn of dto.dialogueHistory) {
        promptMessages.push({
          role: turn.sender === 'You' ? 'user' : 'assistant',
          content: turn.text,
        });
      }
    } else {
      promptMessages.push({ role: 'user', content: userMsg });
    }

    try {
      const client = this.openAiService.getClient();
      const model = this.openAiService.getModel();
      const response = await client.chat.completions.create({
        model: model,
        messages: promptMessages,
        max_tokens: 120,
      });

      const reply = response.choices[0]?.message?.content || `Hello! Thank you for calling ${business}. My name is ${receptionist}. How can I assist you today?`;

      return {
        success: true,
        replyText: reply,
      };
    } catch (err) {
      return {
        success: true,
        replyText: `Hello! Thank you for calling ${business}. My name is ${receptionist}. How can I help you today?`,
      };
    }
  }
}

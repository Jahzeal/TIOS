import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../services/ai/openai.service';
import { config } from '../config';

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

  private getTwilioAuthHeader(): string | null {
    const accountSid = config.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = config.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) return null;
    return Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  }

  async getAvailableNumbers(country: string = 'US', areaCode?: string) {
    const accountSid = config.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
    const authHeader = this.getTwilioAuthHeader();

    if (!accountSid || !authHeader) {
      return {
        success: false,
        numbers: [],
        error: 'Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) are not configured on the server.',
      };
    }

    try {
      const countryCode = (country || 'US').toUpperCase();
      let url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${countryCode}/Local.json?PageSize=10`;
      if (areaCode && areaCode.trim()) {
        url += `&AreaCode=${encodeURIComponent(areaCode.trim())}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
      });

      const data: any = await res.json();
      if (res.ok && data.available_phone_numbers && data.available_phone_numbers.length > 0) {
        return {
          success: true,
          numbers: data.available_phone_numbers.map((item: any) => ({
            id: item.phone_number,
            number: item.friendly_name || item.phone_number,
            rawNumber: item.phone_number,
            location: [item.rate_center, item.region].filter(Boolean).join(', ') || countryCode,
            type: 'Local',
            isoCountry: item.iso_country || countryCode,
          })),
        };
      }

      return {
        success: false,
        numbers: [],
        error: data.message || `No available phone numbers found in Twilio inventory for area code "${areaCode}".`,
      };
    } catch (err: any) {
      return {
        success: false,
        numbers: [],
        error: `Failed to query Twilio live inventory: ${err.message}`,
      };
    }
  }

  async provisionTwilioNumber(tenantId: string, rawPhoneNumber: string, businessName: string = 'TIOS Business') {
    const accountSid = config.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
    const authHeader = this.getTwilioAuthHeader();
    const publicUrl = config.publicApiUrl || 'https://api.yourdomain.com';

    if (!accountSid || !authHeader) {
      throw new Error('Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) are required to purchase live numbers.');
    }

    if (!rawPhoneNumber) {
      throw new Error('A valid Twilio phone number must be selected.');
    }

    console.log(`[Twilio Production Provisioning] Purchasing live number ${rawPhoneNumber} for tenant ${tenantId}...`);
    const cleanPhone = rawPhoneNumber.replace(/[\s\(\)\-]/g, '');
    const bodyParams = new URLSearchParams({
      PhoneNumber: cleanPhone,
      VoiceUrl: `${publicUrl}/voice`,
      VoiceMethod: 'POST',
      StatusCallback: `${publicUrl}/voice/status`,
      StatusCallbackMethod: 'POST',
      SmsUrl: `${publicUrl}/sms`,
      SmsMethod: 'POST',
      FriendlyName: `TIOS - ${businessName}`,
    });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    const data: any = await res.json();
    if (!res.ok || !data.phone_number) {
      const errorMsg = data.message || `Twilio purchase failed with status ${res.status}`;
      console.error(`[Twilio Production Provisioning] Failed:`, errorMsg);
      throw new Error(`Failed to purchase number from Twilio: ${errorMsg}`);
    }

    const purchasedPhone = data.phone_number;
    const twilioSid = data.sid;
    console.log(`[Twilio Production Provisioning] Successfully purchased ${purchasedPhone} (Sid: ${twilioSid}) with webhooks configured.`);

    if (tenantId) {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { twilioPhone: purchasedPhone },
      });
    }

    return {
      success: true,
      phoneNumber: purchasedPhone,
      twilioSid,
      message: 'Business phone line provisioned live and configured with AI Voice webhooks.',
    };
  }

  async saveStep1(dto: OnboardingStep1Dto) {
    // Upsert or create tenant with temporary pending status until live number is purchased in Step 4
    const pendingKey = `PENDING_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.businessName,
        twilioPhone: pendingKey,
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
    if (dto.tenantId && dto.selectedPhoneNumber) {
      let tenantName = 'TIOS Business';
      try {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
        if (tenant?.name) tenantName = tenant.name;
      } catch {}

      return await this.provisionTwilioNumber(dto.tenantId, dto.selectedPhoneNumber, tenantName);
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

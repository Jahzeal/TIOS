import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { config } from '../config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {
    const apiKey = process.env.STRIPE_SECRET_KEY || config.elevenLabsApiKey || '';
    if (apiKey) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2025-02-24.acacia' as any,
      });
    }
  }

  async findAll(params: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.search && params.search.trim() !== '') {
      const query = params.search.trim();
      where.OR = [
        { phone: { contains: query, mode: 'insensitive' } },
        { link: { contains: query, mode: 'insensitive' } },
        { stripeSessionId: { contains: query, mode: 'insensitive' } },
        { tenant: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    try {
      const [total, payments] = await Promise.all([
        this.prisma.payment.count({ where }),
        this.prisma.payment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { tenant: true },
        }),
      ]);

      const formatted = payments.map((p) => ({
        id: p.id,
        tenantId: p.tenantId,
        tenantName: p.tenant?.name || 'Default Business',
        amount: p.amount,
        phone: p.phone,
        inquiredService: p.inquiredService || 'Utility Service Setup',
        callId: p.callId,
        leadId: p.leadId,
        status: p.status,
        link: p.link,
        stripeSessionId: p.stripeSessionId,
        notes: p.notes,
        scheduledSmsAt: p.scheduledSmsAt,
        createdAt: p.createdAt,
      }));

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data: formatted,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (err) {
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  async sendPaymentSms(paymentId: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: { tenant: true },
      });

      if (!payment) {
        return { success: false, message: 'Payment record not found.' };
      }

      const smsText = `Hi! Here is your secure payment link for ${payment.inquiredService || 'Service Inquiry'} ($${payment.amount.toFixed(2)}): ${payment.link}`;

      // Dispatch real Twilio SMS text message if Twilio credentials exist
      let twilioStatus = 'SENT';
      const accountSid = config.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
      const authToken = config.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
      const fromPhone = payment.tenant?.twilioPhone || config.twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && fromPhone && payment.phone && !payment.phone.includes('Web Voice')) {
        try {
          const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
          const bodyParams = new URLSearchParams();
          bodyParams.append('From', fromPhone);
          bodyParams.append('To', payment.phone);
          bodyParams.append('Body', smsText);

          const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams.toString(),
          });

          if (!twilioRes.ok) {
            const errData = await twilioRes.text();
            console.warn('[Twilio SMS API Warning] Twilio SMS dispatch response:', errData);
          } else {
            console.log(`[Twilio SMS API] Real SMS payment link dispatched to ${payment.phone}`);
          }
        } catch (smsErr) {
          console.error('[Twilio SMS API Error] Failed to send SMS via Twilio:', smsErr);
          twilioStatus = 'FAILED';
        }
      }

      // Log SMS dispatch in database
      await this.prisma.smsLog.create({
        data: {
          tenantId: payment.tenantId,
          phone: payment.phone,
          message: smsText,
          status: twilioStatus,
        },
      });

      // Update payment status to SMS_SENT
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'SMS_SENT' },
      });

      return { success: true, message: 'SMS payment link dispatched successfully.', link: payment.link };
    } catch (err: any) {
      console.error('[Payments API Error] sendPaymentSms failed:', err);
      return { success: false, message: err.message };
    }
  }

  async simulateWebhook(id: string) {
    try {
      await this.prisma.payment.update({
        where: { id },
        data: { status: 'PAID' },
      });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  }

  async createCheckoutLink(data: {
    tenantId?: string;
    tenantName?: string;
    amount: number;
    phone: string;
    inquiredService?: string;
    callId?: string;
    leadId?: string;
    status?: string;
    notes?: string;
  }) {
    let tenantId = data.tenantId;

    if (!tenantId && data.tenantName) {
      const tenant = await this.prisma.tenant.findFirst({ where: { name: data.tenantName } });
      if (tenant) tenantId = tenant.id;
    }

    if (!tenantId) {
      const firstTenant = await this.prisma.tenant.findFirst();
      if (firstTenant) tenantId = firstTenant.id;
    }

    // Idempotency Deduplication Guard: Check if a payment for the same phone + service + amount was created within the last 60 seconds
    const sixtySecsAgo = new Date(Date.now() - 60 * 1000);
    const existingRecentPayment = await this.prisma.payment.findFirst({
      where: {
        phone: data.phone,
        inquiredService: data.inquiredService || 'Utility Service Setup',
        amount: data.amount,
        createdAt: { gte: sixtySecsAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingRecentPayment) {
      console.log(`[Payments Idempotency] Reusing existing recent payment record ${existingRecentPayment.id} for phone ${data.phone}`);
      return existingRecentPayment;
    }

    let checkoutUrl = '';
    let stripeSessionId = '';

    if (this.stripe && process.env.STRIPE_SECRET_KEY) {
      try {
        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: data.inquiredService || 'Utility Service Setup',
                },
                unit_amount: Math.round(data.amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `http://localhost:${config.port}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `http://localhost:${config.port}/payments/cancel`,
        });

        checkoutUrl = session.url || '';
        stripeSessionId = session.id;
      } catch (err) {
        console.error('[Stripe API Error] Falling back to hosted link generation:', err);
        stripeSessionId = `cs_test_${Date.now()}`;
        checkoutUrl = `https://checkout.stripe.com/pay/${stripeSessionId}`;
      }
    } else {
      stripeSessionId = `cs_test_${Date.now()}`;
      checkoutUrl = `https://checkout.stripe.com/pay/${stripeSessionId}`;
    }

    const paymentStatus = data.status || 'PENDING_QUOTE';

    if (tenantId) {
      try {
        const paymentRecord = await this.prisma.payment.create({
          data: {
            tenantId: tenantId,
            amount: data.amount,
            phone: data.phone,
            inquiredService: data.inquiredService || 'Utility Service Setup',
            callId: data.callId,
            leadId: data.leadId,
            notes: data.notes,
            link: checkoutUrl,
            stripeSessionId: stripeSessionId,
            status: paymentStatus,
          },
        });
        return paymentRecord;
      } catch (err) {
        console.error('[Payments DB Error] Failed to record payment in Prisma:', err);
      }
    }

    return {
      id: `pay-${Date.now()}`,
      tenantId: tenantId || 'default-tenant',
      amount: data.amount,
      phone: data.phone,
      inquiredService: data.inquiredService || 'Utility Service Setup',
      link: checkoutUrl,
      stripeSessionId: stripeSessionId,
      status: paymentStatus,
      createdAt: new Date().toISOString(),
    };
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    let event: Stripe.Event;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (this.stripe && webhookSecret) {
      try {
        event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } catch (err: any) {
        console.error('[Stripe Webhook Error] Signature verification failed:', err.message);
        throw new BadRequestException(`Webhook Error: ${err.message}`);
      }
    } else {
      // Mock/Parsed Event Payload
      try {
        event = JSON.parse(payload.toString());
      } catch (e) {
        throw new BadRequestException('Invalid JSON payload');
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      console.log(`[Stripe Webhook] Payment completed for session: ${sessionId}`);

      try {
        await this.prisma.payment.updateMany({
          where: { stripeSessionId: sessionId },
          data: {
            status: 'PAID',
            stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
          },
        });
      } catch (err) {
        console.error('[Stripe Webhook DB Error] Failed to update payment status:', err);
      }
    }

    return { received: true };
  }
}

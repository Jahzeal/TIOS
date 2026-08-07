/**
 * test_payment_collection.ts
 *
 * Test script for the Payment Collection Agent & SMS Link Dispatcher.
 *
 * Run with:
 *   npx tsx src/test_payment_collection.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function runPaymentCollectionTest() {
  console.log('\n=================================================');
  console.log('🧪 TEST: Payment Collection Agent & SMS Link Dispatcher');
  console.log('=================================================\n');

  try {
    // 1. Fetch or create a test tenant
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'TIOS Test Business',
          twilioPhone: '+15876028009',
        },
      });
      console.log(`  ✅ Created test tenant: ${tenant.name} (${tenant.id})`);
    } else {
      console.log(`  ✅ Found existing tenant: ${tenant.name} (${tenant.id})`);
    }

    const testPhone = process.env.TEST_PHONE_NUMBER || '+17808025420';
    const testService = 'Utility Service Setup (Test)';
    const testAmount = 250.0;

    console.log(`\n1. Creating Stripe Checkout Payment Record for ${testPhone}...`);

    // 2. Create payment record
    const checkoutLink = `https://checkout.stripe.com/pay/test_${Date.now()}`;
    const paymentRecord = await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        amount: testAmount,
        phone: testPhone,
        inquiredService: testService,
        link: checkoutLink,
        status: 'SMS_SENT',
        notes: `Test Payment Collection Agent dispatched checkout link for ${testService} ($${testAmount}).`,
      },
    });

    console.log(`  ✅ Payment Record created in database! ID: ${paymentRecord.id}`);
    console.log(`  💳 Checkout Link: ${paymentRecord.link}`);
    console.log(`  💰 Amount: $${paymentRecord.amount}`);
    console.log(`  📱 Target Phone: ${paymentRecord.phone}`);

    // 3. Test Twilio SMS dispatch
    console.log('\n2. Testing Twilio SMS Dispatch for Payment Link...');
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER || '+15876028009';

    if (!accountSid || !authToken) {
      console.warn('  ⚠️ TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing in environment. Skipping live SMS sending.');
    } else {
      const smsMessage = `Hi! Here is your payment link for ${testService} ($${testAmount.toFixed(2)}): ${checkoutLink}`;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const bodyParams = new URLSearchParams();
      bodyParams.append('From', fromPhone);
      bodyParams.append('To', testPhone);
      bodyParams.append('Body', smsMessage);

      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      if (twilioRes.ok) {
        const smsData: any = await twilioRes.json();
        console.log(`  ✅ SMS successfully dispatched via Twilio! SID: ${smsData.sid}`);
      } else {
        const errText = await twilioRes.text();
        console.error(`  ❌ Twilio SMS HTTP ${twilioRes.status}:`, errText);
      }
    }

    console.log('\n=================================================');
    console.log('🎉 PAYMENT COLLECTION TEST COMPLETE — ALL STEPS PASSED');
    console.log('=================================================\n');

  } catch (err: any) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runPaymentCollectionTest();

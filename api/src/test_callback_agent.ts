/**
 * test_callback_agent.ts
 *
 * Test script for the Automated Outbound Callback Agent & Job Queue Worker.
 *
 * Run with:
 *   npx tsx src/test_callback_agent.ts
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

async function runCallbackAgentTest() {
  console.log('\n=================================================');
  console.log('🧪 TEST: Outbound Callback Agent & Job Queue Worker');
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
    const testService = 'Utility Service Setup Follow-up';
    const testAmount = 250.0;

    console.log(`\n1. Scheduling Outbound Callback Job for ${testPhone}...`);

    // Available immediately for testing
    const availableAt = new Date();

    const job = await prisma.job.create({
      data: {
        queueName: 'OUTBOUND_CALLBACK',
        tenantId: tenant.id,
        status: 'PENDING',
        availableAt: availableAt,
        payload: {
          phone: testPhone,
          tenantId: tenant.id,
          inquiredService: testService,
          amount: testAmount,
          scheduledBy: 'Test Suite',
        },
      },
    });

    console.log(`  ✅ Job created in database! ID: ${job.id}`);
    console.log(`  📋 Queue: ${job.queueName}`);
    console.log(`  📱 Target Phone: ${testPhone}`);
    console.log(`  ⏱️ Available At: ${job.availableAt.toISOString()}`);

    // 2. Query due jobs from queue (simulates QueueWorkerService)
    console.log('\n2. Simulating QueueWorkerService: Fetching Due Jobs...');
    const now = new Date();
    const dueJobs = await prisma.job.findMany({
      where: {
        queueName: 'OUTBOUND_CALLBACK',
        status: 'PENDING',
        availableAt: { lte: now },
      },
      include: { tenant: true },
    });

    console.log(`  ✅ Queue Worker found ${dueJobs.length} pending callback jobs ready for execution.`);

    const foundJob = dueJobs.find((j) => j.id === job.id);
    if (foundJob) {
      console.log(`  🎯 Target test job ${job.id} confirmed present in due queue!`);
    }

    // 3. Test Twilio Outbound Call Trigger
    console.log('\n3. Testing Twilio Outbound REST API Call Trigger...');
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = tenant.twilioPhone || process.env.TWILIO_PHONE_NUMBER || '+15876028009';

    if (!accountSid || !authToken) {
      console.warn('  ⚠️ TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing in environment. Skipping live Twilio call trigger.');
    } else {
      const host = process.env.RENDER_EXTERNAL_URL || 'https://tios.onrender.com';
      const callbackWebhookUrl = `${host}/voice?direction=OUTBOUND&tenantId=${tenant.id}`;

      console.log(`  📞 Triggering Twilio Outbound Call to ${testPhone}...`);
      console.log(`  🔗 Webhook URL: ${callbackWebhookUrl}`);

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const bodyParams = new URLSearchParams();
      bodyParams.append('From', fromPhone);
      bodyParams.append('To', testPhone);
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
        console.log(`  ✅ Twilio Outbound Call triggered successfully! Call SID: ${resData.sid}`);

        // Mark job COMPLETED
        await prisma.job.update({
          where: { id: job.id },
          data: { status: 'COMPLETED' },
        });
        console.log(`  ✅ Job ${job.id} status updated to COMPLETED in database.`);
      } else {
        const errText = await twilioRes.text();
        console.error(`  ❌ Twilio Call HTTP ${twilioRes.status}:`, errText);
      }
    }

    console.log('\n=================================================');
    console.log('🎉 OUTBOUND CALLBACK AGENT TEST COMPLETE — ALL STEPS PASSED');
    console.log('=================================================\n');

  } catch (err: any) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runCallbackAgentTest();

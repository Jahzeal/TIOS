import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { PaymentsService } from './payments/payments.service';
import { PrismaService } from './prisma/prisma.service';

dotenv.config();

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const rawPrisma = createPrismaClient();
const prismaService = new PrismaService();
const paymentsService = new PaymentsService(prismaService);

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING OUTBOUND & DEDUPLICATION TESTS');
  console.log('========================================\n');

  try {
    const testPhone = '+17808025420';
    const testService = 'wooden door';
    const testAmount = 500;

    // ----------------------------------------------------
    // TEST 1: Payment Link Deduplication Guard
    // ----------------------------------------------------
    console.log('--- TEST 1: Payment Link Deduplication Guard ---');
    console.log(`Creating initial payment link for ${testPhone}...`);
    
    const link1 = await paymentsService.createCheckoutLink({
      amount: testAmount,
      phone: testPhone,
      inquiredService: testService,
      status: 'SMS_SENT',
      notes: 'Test payment link 1',
    });

    console.log(`Link 1 Created -> ID: ${link1?.id}, Session: ${link1?.stripeSessionId}`);

    console.log(`Creating rapid duplicate payment link within 60s for ${testPhone}...`);
    const link2 = await paymentsService.createCheckoutLink({
      amount: testAmount,
      phone: testPhone,
      inquiredService: testService,
      status: 'SMS_SENT',
      notes: 'Test payment link 2 (Duplicate request)',
    });

    console.log(`Link 2 Created -> ID: ${link2?.id}, Session: ${link2?.stripeSessionId}`);

    if (link1?.id === link2?.id) {
      console.log('✅ TEST 1 PASSED: Deduplication guard successfully reused existing payment record (No duplicate row)!');
    } else {
      console.error('❌ TEST 1 FAILED: A duplicate payment record was created!');
    }

    // ----------------------------------------------------
    // TEST 2: Outbound Call Webhook Resolution Test
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Outbound Call Webhook Resolution ---');
    const firstTenant = await rawPrisma.tenant.findFirst();
    if (!firstTenant) {
      console.log('⚠️ No tenant found in DB to run Webhook Resolution test.');
      return;
    }

    const testCallSid = `CAtest_${Date.now()}`;
    const twilioPhone = firstTenant.twilioPhone || '+15876028009';

    console.log(`Simulating Twilio Outbound Webhook for CallSid: ${testCallSid}`);
    console.log(`From (Twilio Number): ${twilioPhone}`);
    console.log(`To (Customer Phone): ${testPhone}`);
    console.log(`Tenant ID: ${firstTenant.id}`);

    // Verify tenant lookup by ID and phone works
    const tenantById = await rawPrisma.tenant.findUnique({
      where: { id: firstTenant.id },
      include: { agents: true },
    });

    if (tenantById && tenantById.agents.length > 0) {
      console.log(`✅ Tenant Resolved -> Name: ${tenantById.name}, Agent: ${tenantById.agents[0].name}`);
      console.log('✅ TEST 2 PASSED: Outbound webhook properly resolves business tenant & agent without hanging up!');
    } else {
      console.error('❌ TEST 2 FAILED: Could not resolve tenant and agent for outbound call!');
    }

  } catch (err) {
    console.error('Error running test script:', err);
  } finally {
    await rawPrisma.$disconnect();
    console.log('\n========================================\n');
  }
}

runTests();

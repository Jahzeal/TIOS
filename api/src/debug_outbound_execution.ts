import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function debugOutboundExecution() {
  console.log('\n--- Debugging Outbound AI Callback Execution ---\n');

  try {
    const targetPhone = '17808025420';
    const now = new Date();

    // 1. All Jobs for +17808025420
    const jobs = await prisma.job.findMany({
      where: { queueName: 'OUTBOUND_CALLBACK' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`[ALL OUTBOUND JOBS]: ${jobs.length}`);
    jobs.forEach((j) => {
      const payloadStr = JSON.stringify(j.payload || {});
      if (payloadStr.includes(targetPhone)) {
        console.log(`- Job ID:       ${j.id}`);
        console.log(`  Step:         ${(j.payload as any)?.step || 1}`);
        console.log(`  Status:       ${j.status}`);
        console.log(`  Created At:   ${j.createdAt.toISOString()}`);
        console.log(`  Available At: ${(j.availableAt || new Date()).toISOString()} (Now: ${now.toISOString()})`);
        console.log(`  Attempts:     ${j.attempts} / ${j.maxAttempts}`);
        console.log(`  Error:        ${j.error || 'None'}`);
        console.log('---');
      }
    });

    // 2. All Calls to or from +17808025420
    const calls = await prisma.call.findMany({
      where: { callerPhone: { contains: targetPhone } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`\n[ALL CALLS LOGGED FOR +17808025420]: ${calls.length}`);
    calls.forEach((c) => {
      console.log(`- Call ID:   ${c.id}`);
      console.log(`  SID:       ${c.sid}`);
      console.log(`  Direction: ${c.direction}`);
      console.log(`  Status:    ${c.status}`);
      console.log(`  Duration:  ${c.duration}s`);
      console.log(`  Time:      ${c.createdAt.toISOString()}`);
      console.log('---');
    });

  } catch (err) {
    console.error('Error debugging outbound execution:', err);
  } finally {
    await prisma.$disconnect();
  }
}

debugOutboundExecution();

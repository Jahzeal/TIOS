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

async function checkNextCallSchedule() {
  console.log('\n--- Checking Next Outbound Call Schedule in Database ---\n');

  try {
    const targetPhone = '17808025420';
    const now = new Date();

    const jobs = await prisma.job.findMany({
      where: { queueName: 'OUTBOUND_CALLBACK' },
      orderBy: { availableAt: 'asc' },
    });

    console.log(`[TOTAL OUTBOUND CALLBACK JOBS IN DB]: ${jobs.length}`);

    const targetJobs = jobs.filter((j) => JSON.stringify(j.payload || {}).includes(targetPhone));

    if (targetJobs.length === 0) {
      console.log(`⚠️ No upcoming callback jobs found for +17808025420.`);
    } else {
      console.log(`\nFound ${targetJobs.length} jobs for +17808025420:`);
      targetJobs.forEach((j, idx) => {
        const avail = new Date(j.availableAt || new Date());
        const diffMs = avail.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const isDueNow = diffMs <= 0;

        console.log(`\nJob #${idx + 1}:`);
        console.log(`  Job ID:       ${j.id}`);
        console.log(`  Step Number:  ${(j.payload as any)?.step || 1}`);
        console.log(`  Status:       ${j.status}`);
        console.log(`  Scheduled At: ${avail.toLocaleString()}`);
        console.log(`  Current Time: ${now.toLocaleString()}`);
        console.log(`  Status:       ${isDueNow ? '🚨 DUE NOW / IN-PROGRESS' : `⏳ Scheduled in ${diffMins} minutes`}`);
        console.log(`  Attempts:     ${j.attempts} / ${j.maxAttempts}`);
      });
    }

  } catch (err) {
    console.error('Error checking next call schedule:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkNextCallSchedule();

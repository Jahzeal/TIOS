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

async function rescheduleJob() {
  console.log('\n--- Rescheduling Pending Callback Job for 15-Minute Delay ---\n');

  try {
    const job = await prisma.job.findUnique({
      where: { id: '1c9bc054-eb9d-4d68-b856-a4c961c72235' },
    });

    if (job) {
      // 13:33 + 15 mins = 13:48:42
      const newAvailableAt = new Date(job.createdAt.getTime() + 15 * 60 * 1000);
      const updated = await prisma.job.update({
        where: { id: job.id },
        data: { availableAt: newAvailableAt },
      });

      console.log(`[RESCHEDULED JOB]: ${updated.id}`);
      console.log(`  Created At: ${updated.createdAt.toISOString()}`);
      console.log(`  New Available At: ${updated.availableAt.toISOString()}`);
      console.log(`  Is Due Now: ${new Date() >= updated.availableAt ? 'YES (DUE NOW!)' : 'NO'}`);
    } else {
      console.log('No pending job found with ID 1c9bc054-eb9d-4d68-b856-a4c961c72235.');
    }
  } catch (err) {
    console.error('Error rescheduling job:', err);
  } finally {
    await prisma.$disconnect();
  }
}

rescheduleJob();

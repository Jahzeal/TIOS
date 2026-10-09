import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';

// Attempt to load from multiple standard locations
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../frontend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../frontend/.env') });

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set in environment.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const adminEmail = (
    process.env.ADMIN_EMAIL || 'jahzealibeh16@gmail.com'
  ).toLowerCase().trim();

  const adminPassword = process.env.ADMIN_PASSWORD || 'password';
  const adminUsername = process.env.ADMIN_USERNAME || 'Jahzeal Ibeh';

  console.log(`🔍 Checking database for admin account: ${adminEmail}...`);

  try {
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existing) {
      console.log(`ℹ️ Account already exists (ID: ${existing.id}). Updating to ADMIN role and refreshing password...`);
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          username: adminUsername,
          password: hashPassword(adminPassword),
          accountType: 'ADMIN',
        },
      });
      console.log(`✅ Admin account updated successfully: ${updated.email} [${updated.accountType}]`);
    } else {
      console.log(`➕ Creating new admin account...`);
      const created = await prisma.user.create({
        data: {
          email: adminEmail,
          username: adminUsername,
          password: hashPassword(adminPassword),
          accountType: 'ADMIN',
        },
      });
      console.log(`✅ Admin account seeded successfully: ${created.email} [${created.accountType}]`);
    }
  } catch (error: any) {
    console.error(`❌ Failed to seed admin user:`, error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

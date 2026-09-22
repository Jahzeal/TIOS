import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './services/ai/ai.module';
import { VoiceModule } from './voice/voice.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CallsModule } from './calls/calls.module';
import { LeadsModule } from './leads/leads.module';
import { SettingsModule } from './settings/settings.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { QueueModule } from './queue/queue.module';
import { PaymentsModule } from './payments/payments.module';
import { MessagingModule } from './messaging/messaging.module';
import { TenantsModule } from './tenants/tenants.module';
import { OnboardingModule } from './onboarding/onboarding.module';

// Sales Engine (AIOS) Modules
import { FirecrawlModule } from './firecrawl/firecrawl.module';
import { EmailModule } from './email/email.module';
import { JobsModule } from './jobs/jobs.module';
import { HunterModule } from './hunter/hunter.module';
import { ApolloModule } from './apollo/apollo.module';
import { MeetingsModule } from './meetings/meetings.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AiModule,
    VoiceModule,
    DashboardModule,
    CallsModule,
    LeadsModule,
    SettingsModule,
    KnowledgeModule,
    QueueModule,
    PaymentsModule,
    MessagingModule,
    TenantsModule,
    OnboardingModule,
    // Sales Engine Modules
    FirecrawlModule,
    EmailModule,
    JobsModule,
    HunterModule,
    ApolloModule,
    MeetingsModule,
    AuthModule,
  ],
})
export class AppModule {}


import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
  ],
})
export class AppModule {}

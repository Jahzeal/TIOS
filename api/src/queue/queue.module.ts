import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { QueueWorkerService } from './queue-worker.service';

@Module({
  controllers: [QueueController],
  providers: [QueueService, QueueWorkerService],
  exports: [QueueService, QueueWorkerService],
})
export class QueueModule {}

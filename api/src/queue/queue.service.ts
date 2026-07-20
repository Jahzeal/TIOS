import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueueService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getJobs(params: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.search && params.search.trim() !== '') {
      const query = params.search.trim();
      where.OR = [
        { queueName: { contains: query, mode: 'insensitive' } },
        { error: { contains: query, mode: 'insensitive' } },
        { tenant: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    try {
      const [total, jobs] = await Promise.all([
        this.prisma.job.count({ where }),
        this.prisma.job.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { tenant: true },
        }),
      ]);

      const formatted = jobs.map((j) => ({
        id: j.id,
        queueName: j.queueName,
        tenantName: j.tenant?.name || 'Default Tenant',
        status: j.status,
        attempts: j.attempts,
        maxAttempts: j.maxAttempts,
        availableAt: j.availableAt,
        error: j.error,
        createdAt: j.createdAt,
      }));

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data: formatted,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (err) {
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  async retryJob(id: string) {
    try {
      await this.prisma.job.update({
        where: { id },
        data: {
          status: 'PENDING',
          attempts: 0,
          error: null,
        },
      });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CallsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    direction?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.direction && params.direction !== 'ALL') {
      where.direction = params.direction;
    }

    if (params.search && params.search.trim() !== '') {
      const query = params.search.trim();
      where.OR = [
        { callerName: { contains: query, mode: 'insensitive' } },
        { callerPhone: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { sid: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.call.count({ where }),
      this.prisma.call.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { tenant: true, agent: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.call.findUnique({
      where: { id },
      include: { tenant: true, agent: true },
    });
  }
}

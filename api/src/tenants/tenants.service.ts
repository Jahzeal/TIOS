import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search && params.search.trim() !== '') {
      const query = params.search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { twilioPhone: { contains: query, mode: 'insensitive' } },
        { forwardPhone: { contains: query, mode: 'insensitive' } },
      ];
    }

    try {
      const [total, tenants] = await Promise.all([
        this.prisma.tenant.count({ where }),
        this.prisma.tenant.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { agents: true },
        }),
      ]);

      const formatted = tenants.map((t) => ({
        id: t.id,
        name: t.name,
        twilioPhone: t.twilioPhone,
        forwardPhone: t.forwardPhone || 'Not Configured',
        stripeSecret: t.stripeSecret ? `${t.stripeSecret.slice(0, 8)}...` : 'Not Configured',
        agentsCount: t.agents.length,
        createdAt: t.createdAt,
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

  async create(data: { name: string; twilioPhone?: string; forwardPhone?: string; stripeSecret?: string }) {
    const uniqueTwilio = data.twilioPhone || `+1888${Math.floor(1000000 + Math.random() * 9000000)}`;

    return this.prisma.tenant.create({
      data: {
        name: data.name,
        twilioPhone: uniqueTwilio,
        forwardPhone: data.forwardPhone || '',
        stripeSecret: data.stripeSecret || '',
        agents: {
          create: {
            name: `${data.name} AI Agent`,
            prompt: `You are a friendly AI receptionist for ${data.name}. Greet callers warmly and assist them with services and appointments.`,
            voiceId: '21m00Tcm4TlvDq8ikWAM',
          },
        },
      },
      include: { agents: true },
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.tenant.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  }
}

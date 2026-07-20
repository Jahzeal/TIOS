import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
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
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ];
    }

    try {
      const totalCount = await this.prisma.lead.count({ where });

      // If lead table has records, use Lead table
      if (totalCount > 0) {
        const leads = await this.prisma.lead.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { appointments: true, calls: true },
        });

        const totalPages = Math.ceil(totalCount / limit) || 1;

        return {
          data: leads,
          meta: {
            total: totalCount,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        };
      }

      // If Lead table is empty, derive leads dynamically from Call records
      const callWhere: any = {};
      if (params.search && params.search.trim() !== '') {
        const query = params.search.trim();
        callWhere.OR = [
          { callerName: { contains: query, mode: 'insensitive' } },
          { callerPhone: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
        ];
      }

      const totalCalls = await this.prisma.call.count({ where: callWhere });
      const callsWithLeads = await this.prisma.call.findMany({
        where: callWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const derivedLeads = callsWithLeads.map((c, idx) => ({
        id: `lead-${c.id}`,
        name: c.callerName || (c.callerPhone ? `Prospect ${c.callerPhone.slice(-4)}` : `Prospect ${idx + 1}`),
        phone: c.callerPhone,
        email: null,
        status: c.status === 'COMPLETED' ? 'QUALIFIED' : 'NEW',
        interest: c.sentiment === 'POSITIVE' ? 'HIGH' : 'MEDIUM',
        notes: c.summary || 'Inbound AI receptionist lead.',
        createdAt: c.createdAt,
      }));

      const totalPages = Math.ceil(totalCalls / limit) || 1;

      return {
        data: derivedLeads,
        meta: {
          total: totalCalls,
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
}

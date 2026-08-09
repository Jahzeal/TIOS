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
    try {
      const page = Math.max(1, Number(params.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
      const skip = (page - 1) * limit;

      const andConditions: any[] = [];

      if (params.status && params.status !== 'ALL') {
        if (params.status === 'FORWARD_REQUESTED') {
          andConditions.push({
            OR: [
              { status: 'FORWARD_REQUESTED' },
              { summary: { contains: 'callback', mode: 'insensitive' } },
              { summary: { contains: 'call back', mode: 'insensitive' } },
              { summary: { contains: 'human agent', mode: 'insensitive' } },
              { summary: { contains: 'representative', mode: 'insensitive' } },
              { summary: { contains: 'speak to human', mode: 'insensitive' } },
              { summary: { contains: 'transfer call', mode: 'insensitive' } },
              { summary: { contains: 'transfer to agent', mode: 'insensitive' } },
            ],
          });
        } else {
          andConditions.push({ status: params.status });
        }
      }

      if (params.direction && params.direction !== 'ALL') {
        andConditions.push({ direction: params.direction });
      }

      if (params.search && params.search.trim() !== '') {
        const query = params.search.trim();
        andConditions.push({
          OR: [
            { callerName: { contains: query, mode: 'insensitive' } },
            { callerPhone: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } },
            { sid: { contains: query, mode: 'insensitive' } },
          ],
        });
      }

      const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

      const [total, data] = await Promise.all([
        this.prisma.call.count({ where }).catch(() => 0),
        this.prisma.call.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { tenant: true, agent: true },
        }).catch(() => []),
      ]);

      const callIds = data.map((c) => c.id).filter(Boolean);
      const phones = data.map((c) => c.callerPhone).filter(Boolean);

      let payments: any[] = [];
      if (callIds.length > 0 || phones.length > 0) {
        const paymentOR: any[] = [];
        if (callIds.length > 0) paymentOR.push({ callId: { in: callIds } });
        if (phones.length > 0) paymentOR.push({ phone: { in: phones } });

        payments = await this.prisma.payment.findMany({
          where: { OR: paymentOR },
          orderBy: { createdAt: 'desc' },
        }).catch(() => []);
      }

      const enriched = data.map((call) => {
        const matchedPayment = payments.find(
          (p) => p.callId === call.id || (p.phone && p.phone === call.callerPhone),
        );

        return {
          ...call,
          paymentStatus: matchedPayment ? matchedPayment.status : 'NO_QUOTE',
          paymentAmount: matchedPayment ? matchedPayment.amount : null,
          paymentService: matchedPayment ? matchedPayment.inquiredService : null,
          paymentLink: matchedPayment ? matchedPayment.link : null,
        };
      });

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data: enriched,
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
      console.error('[CallsService] findAll error:', err);
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  async findOne(id: string) {
    try {
      const call = await this.prisma.call.findUnique({
        where: { id },
        include: { tenant: true, agent: true },
      });
      if (!call) return null;

      const payment = await this.prisma.payment.findFirst({
        where: {
          OR: [
            { callId: call.id },
            { phone: call.callerPhone },
          ],
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => null);

      return {
        ...call,
        paymentStatus: payment ? payment.status : 'NO_QUOTE',
        paymentAmount: payment ? payment.amount : null,
        paymentService: payment ? payment.inquiredService : null,
        paymentLink: payment ? payment.link : null,
      };
    } catch (err) {
      console.error('[CallsService] findOne error:', err);
      return null;
    }
  }
}

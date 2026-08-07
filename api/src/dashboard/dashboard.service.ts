import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getStats() {
    try {
      const [
        totalCalls,
        inboundCalls,
        outboundCalls,
        totalLeads,
        completedCalls,
        avgAggregate,
        deposits,
      ] = await Promise.all([
        this.prisma.call.count().catch(() => 0),
        this.prisma.call.count({ where: { direction: 'INBOUND' } }).catch(() => 0),
        this.prisma.call.count({ where: { direction: 'OUTBOUND' } }).catch(() => 0),
        this.prisma.lead.count().catch(() => 0),
        this.prisma.call.count({ where: { status: 'COMPLETED' } }).catch(() => 0),
        this.prisma.call.aggregate({ _avg: { duration: true } }).catch(() => ({ _avg: { duration: 0 } })),
        this.prisma.payment.aggregate({ _sum: { amount: true }, _count: true }).catch(() => ({ _sum: { amount: 0 }, _count: 0 })),
      ]);

      const totalDepositsAmount = deposits._sum?.amount || 0;
      const totalDepositsCount = deposits._count || 0;
      const avgDurationSeconds = Math.round(avgAggregate._avg?.duration || 0);
      const conversionRatePercent = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

      return {
        totalCalls,
        inboundCalls,
        outboundCalls,
        avgDurationSeconds,
        conversionRatePercent,
        leadsGenerated: totalLeads,
        appointmentsBooked: completedCalls,
        totalDepositsAmount,
        totalDepositsCount,
      };
    } catch (err) {
      return {
        totalCalls: 0,
        inboundCalls: 0,
        outboundCalls: 0,
        avgDurationSeconds: 0,
        conversionRatePercent: 0,
        leadsGenerated: 0,
        appointmentsBooked: 0,
        totalDepositsAmount: 0,
        totalDepositsCount: 0,
      };
    }
  }

  async getRecentCalls(limit = 5) {
    try {
      const take = Math.max(1, Math.min(50, Number(limit) || 5));
      const calls = await this.prisma.call.findMany({
        take,
        orderBy: { createdAt: 'desc' },
        include: { tenant: true, agent: true },
      });

      // Match payment status for each call by callId or callerPhone
      const callIds = calls.map((c) => c.id).filter(Boolean);
      const phones = calls.map((c) => c.callerPhone).filter(Boolean);

      const payments = await this.prisma.payment.findMany({
        where: {
          OR: [
            { callId: { in: callIds } },
            { phone: { in: phones } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      return calls.map((call) => {
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
    } catch (err) {
      return [];
    }
  }
}

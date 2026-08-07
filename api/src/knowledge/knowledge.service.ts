import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INDUSTRY_KB_TEMPLATES, KbTemplatePack } from './kb-templates.data';

@Injectable()
export class KnowledgeService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  getTemplates(): KbTemplatePack[] {
    return INDUSTRY_KB_TEMPLATES;
  }

  async importTemplate(data: { templateId: string; tenantId?: string; tenantName?: string }) {
    const template = INDUSTRY_KB_TEMPLATES.find((t) => t.id === data.templateId);
    if (!template) {
      throw new NotFoundException(`Template '${data.templateId}' not found.`);
    }

    let tenantId = data.tenantId;

    if (!tenantId && data.tenantName) {
      const tenant = await this.prisma.tenant.findFirst({ where: { name: data.tenantName } });
      if (tenant) tenantId = tenant.id;
    }

    if (!tenantId) {
      let firstTenant = await this.prisma.tenant.findFirst();
      if (!firstTenant) {
        firstTenant = await this.prisma.tenant.create({
          data: {
            name: data.tenantName || 'Default Tenant',
            twilioPhone: '+15550000000',
          },
        });
      }
      tenantId = firstTenant.id;
    }

    const createdEntries = await Promise.all(
      template.entries.map((item) =>
        this.prisma.knowledgeBase.create({
          data: {
            tenantId,
            question: item.question,
            answer: item.answer,
          },
          include: { tenant: true },
        }),
      ),
    );

    const formatted = createdEntries.map((e) => ({
      id: e.id,
      tenantId: e.tenantId,
      tenantName: e.tenant?.name || 'Default Business',
      question: e.question,
      answer: e.answer,
      createdAt: e.createdAt,
    }));

    return {
      success: true,
      templateId: template.id,
      templateName: template.name,
      importedCount: formatted.length,
      entries: formatted,
    };
  }

  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search && params.search.trim() !== '') {
      const query = params.search.trim();
      where.OR = [
        { question: { contains: query, mode: 'insensitive' } },
        { answer: { contains: query, mode: 'insensitive' } },
        { tenant: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    try {
      const [total, entries] = await Promise.all([
        this.prisma.knowledgeBase.count({ where }),
        this.prisma.knowledgeBase.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { tenant: true },
        }),
      ]);

      const formatted = entries.map((e) => ({
        id: e.id,
        tenantId: e.tenantId,
        tenantName: e.tenant?.name || 'Default Business',
        question: e.question,
        answer: e.answer,
        createdAt: e.createdAt,
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

  async create(data: { tenantId?: string; tenantName?: string; question: string; answer: string }) {
    let tenantId = data.tenantId;

    if (!tenantId && data.tenantName) {
      const tenant = await this.prisma.tenant.findFirst({ where: { name: data.tenantName } });
      if (tenant) tenantId = tenant.id;
    }

    if (!tenantId) {
      let firstTenant = await this.prisma.tenant.findFirst();
      if (!firstTenant) {
        firstTenant = await this.prisma.tenant.create({
          data: {
            name: data.tenantName || 'Default Tenant',
            twilioPhone: '+15550000000',
          },
        });
      }
      tenantId = firstTenant.id;
    }

    const created = await this.prisma.knowledgeBase.create({
      data: {
        tenantId,
        question: data.question,
        answer: data.answer,
      },
      include: { tenant: true },
    });

    return {
      id: created.id,
      tenantId: created.tenantId,
      tenantName: created.tenant?.name || 'Default Business',
      question: created.question,
      answer: created.answer,
      createdAt: created.createdAt,
    };
  }

  async remove(id: string) {
    try {
      await this.prisma.knowledgeBase.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  }
}

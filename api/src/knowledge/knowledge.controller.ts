import { Controller, Get, Post, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge-base')
export class KnowledgeController {
  constructor(@Inject(KnowledgeService) private readonly knowledgeService: KnowledgeService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.knowledgeService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
    });
  }

  @Post()
  create(@Body() body: { tenantId?: string; tenantName?: string; question: string; answer: string }) {
    return this.knowledgeService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.knowledgeService.remove(id);
  }
}

import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { CallsService } from './calls.service';

@Controller('calls')
export class CallsController {
  constructor(@Inject(CallsService) private readonly callsService: CallsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('direction') direction?: string,
  ) {
    return this.callsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
      direction,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.callsService.findOne(id);
  }
}

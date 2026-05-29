import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { SupportService } from './support.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { TicketStatus } from '../common/enums';
import { Role } from '../user/schemas/user.schema';

@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.support.createTicket(user.id, body);
  }

  @Get()
  list(@CurrentUser() user: any, @Query() query: any): Promise<any> {
    return this.support.listTickets(user.id, user.role, query);
  }

  @Get('stats') @Roles(Role.ADMIN)
  stats() { return this.support.getStats(); }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: any): Promise<any> {
    return this.support.getTicket(id, user.id, user.role);
  }

  @Post(':id/reply')
  reply(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.support.replyToTicket(id, user.id, user.role, body.message, body.attachments);
  }

  @Patch(':id/status') @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus) {
    return this.support.updateTicketStatus(id, status);
  }
}

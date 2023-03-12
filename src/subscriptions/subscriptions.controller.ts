import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';

import { SubscriptionsService } from './subscriptions.service';
import { AddSubscriptionDto } from './dto';
import { JwtAuthGuard } from 'src/authentication/guards';
import { DecodedUser } from 'src/authentication/strategies/jwt.strategy';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: Request, @Body() addSubscriptionDto: AddSubscriptionDto) {
    return this.subscriptionsService.add(
      req.user as DecodedUser,
      addSubscriptionDto
    );
  }
}

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { SubscriptionsService } from './subscriptions.service';
import { AddSubscriptionDto } from './dto';
import { JwtAuthGuard } from 'src/authentication/guards';
import { DecodedUser } from 'src/authentication/strategies/jwt.strategy';

// lo pongo para todo el controller xq todo lo de subscripciones es privado
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  add(@Req() req: Request, @Body() addSubscriptionDto: AddSubscriptionDto) {
    return this.subscriptionsService.add(
      req.user as DecodedUser,
      addSubscriptionDto
    );
  }

  @Delete('/:movieId')
  remove(
    // el ParseUUIDPipe sirve para validar que los ids que me pasen sean UUID y no cualquier string
    @Param('movieId', ParseUUIDPipe) movieId: string,
    @Req() req: Request
  ) {
    return this.subscriptionsService.remove(req.user as DecodedUser, movieId);
  }
}

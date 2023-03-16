import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './entities/subscription.entity';
import { UsersModule } from 'src/users/users.module';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
  imports: [
    // the following line of code is what creates the repository for us:
    TypeOrmModule.forFeature([Subscription]),
    UsersModule,
    MoviesModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}

import { Module } from '@nestjs/common';

import { CronjobsService } from './cronjobs.service';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
  imports: [SubscriptionsModule, MoviesModule],
  providers: [CronjobsService],
})
export class CronjobsModule {}

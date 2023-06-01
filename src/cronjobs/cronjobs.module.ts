import { Module } from '@nestjs/common';

import { CronjobsService } from './cronjobs.service';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { MoviesModule } from 'src/movies/movies.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [SubscriptionsModule, MoviesModule, NotificationsModule],
  providers: [CronjobsService],
})
export class CronjobsModule {}

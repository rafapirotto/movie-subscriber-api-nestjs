import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MoviesService } from 'src/movies/movies.service';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';

export type AvailableSubscription = Subscription & {
  isMovieAvailable: boolean;
};

@Injectable()
export class CronjobsService {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private moviesService: MoviesService
  ) {}
  private readonly logger = new Logger(CronjobsService.name);

  private checkTicketsAvailability = (activeSubscriptions: Subscription[]) => {
    return Promise.allSettled(
      activeSubscriptions.map(async (activeSubscription) => {
        const isMovieAvailable =
          await this.moviesService.checkForMovieAvailability(
            activeSubscription.movieId
          );
        return { ...activeSubscription, isMovieAvailable };
      })
    );
  };

  notifyUsers(availableSubscriptions: AvailableSubscription[]) {
    availableSubscriptions.forEach((resolvedSubscription) => {
      const { user, movie } = resolvedSubscription;
      this.logger.log(`Notify user ${user.username} of: ${movie.name}`);
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async notifyUsersOfAvailableMovies() {
    const activeSubscriptions =
      await this.subscriptionsService.getAllActiveSubscriptions();
    const resolvedSubscriptions = await this.checkTicketsAvailability(
      activeSubscriptions
    );
    const availableMovies = resolvedSubscriptions
      .filter((sub) => sub.status === 'fulfilled' && sub.value.isMovieAvailable)
      // @ts-expect-error: typescript bug with fullfilled promises
      .map(({ value }: { value: AvailableSubscription }) => value);
    this.notifyUsers(availableMovies);

    await this.subscriptionsService.purgeAvailableSubscriptions(
      availableMovies
    );

    this.logger.log(`Checked for movies at ${new Date()}`);
  }
}

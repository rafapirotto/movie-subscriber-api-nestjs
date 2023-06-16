import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { parse } from 'node-html-parser';
import axios from 'axios';

import { MoviesService } from 'src/movies/movies.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PushoverDevice } from 'src/notifications/types';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { Priority } from 'src/subscriptions/types';

export type AvailableSubscription = Subscription & {
  isMovieAvailable: boolean;
};

@Injectable()
export class CronjobsService {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private moviesService: MoviesService,
    private notificationsService: NotificationsService
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

  async notifyUsers(availableSubscriptions: AvailableSubscription[]) {
    try {
      await Promise.allSettled(
        availableSubscriptions.map(async (availableSubscription) => {
          const { user, movie, priority } = availableSubscription;
          const title = 'Available tickets';
          const message = `Hey ${user.username}, the tickets for ${movie.name} are available`;
          return this.notificationsService.send(
            title,
            message,
            priority,
            PushoverDevice.IPHONE_RAFA
          );
        })
      );
    } catch (error) {
      this.logger.error(
        'There was an error trying to notify the users',
        availableSubscriptions
      );
    }
  }
  @Cron(CronExpression.EVERY_5_MINUTES)
  async oppenheimerTicketsAreAvailable() {
    const { data: webpage } = await axios.get(
      'https://www.voyalcine.net/showcase/'
    );
    const parsedWebpage = parse(JSON.stringify(webpage));
    const result = parsedWebpage.querySelectorAll(
      '.content-section , .name , img'
    );
    const filteredResult = result.filter((r) => r.rawTagName !== 'img');
    const filteredResultLength = filteredResult.length;
    const finalResult = filteredResult.slice(
      filteredResultLength / 2,
      filteredResultLength
    );
    const finalRes = finalResult.map((r) =>
      r.childNodes[0].rawText.toLowerCase()
    );
    const ticketsAreAvailable = !!finalRes.find((movie) =>
      movie.includes('oppenheimer')
    );
    const now = new Date().toLocaleString('en-GB', {
      timeZone: 'America/Montevideo',
    });
    this.logger.log(
      `Checked for oppenheimer tickets in Buenos Aires at ${now}`
    );
    if (ticketsAreAvailable) {
      this.logger.log(`Movie array is ${finalRes}`);
      await this.notificationsService.send(
        'Tickets for Oppenheimer are ready in Buenos Aires',
        'Tickets for Oppenheimer are ready in Buenos Aires',
        Priority.EMERGENCY,
        PushoverDevice.IPHONE_RAFA
      );
    }
  }

  // to add dynamic cron expressions:
  // https://medium.com/@sangimed/nestjs-externalize-cron-expressions-in-a-env-file-ca09d3cb2bec
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
    await this.notifyUsers(availableMovies);

    await this.subscriptionsService.purgeAvailableSubscriptions(
      availableMovies
    );
    const now = new Date().toLocaleString('en-GB', {
      timeZone: 'America/Montevideo',
    });
    this.logger.log(`Checked for movies at ${now}`);
  }
}

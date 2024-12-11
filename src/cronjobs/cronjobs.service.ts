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

async function checkWebsite(url: string, keywords: string[]): Promise<boolean> {
  try {
    const { data: webpage } = await axios.get(url);
    const parsedWebpage = parse(webpage);
    const textContent = parsedWebpage.text;

    const lowerCaseContent = textContent.toLowerCase();
    return keywords.some((keyword) =>
      lowerCaseContent.includes(keyword.toLowerCase())
    );
  } catch (error) {
    console.log(`Error fetching the website: ${error.message}`);
    return false;
  }
}

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
            activeSubscription
          );
        return { ...activeSubscription, isMovieAvailable };
      })
    );
  };

  async notifyUsers(availableSubscriptions: AvailableSubscription[]) {
    try {
      await Promise.allSettled(
        availableSubscriptions.map(async (availableSubscription) => {
          const { user, movie, priority, cinema } = availableSubscription;
          const title = 'Available tickets';
          const message = `Hey ${user.username}, the tickets for ${movie.name} are available at ${cinema.name}`;
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

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkForInterstellar() {
    const url = 'https://www.voyalcine.net/showcase/';
    const keywords = [
      'Interstellar',
      'Interstelar',
      'Interestelar',
      'Interestellar',
    ];

    try {
      const containsKeyword = await checkWebsite(url, keywords);
      if (!containsKeyword) {
        this.logger.log(
          'The website contains some of the keywords, sending notification...'
        );
        await this.notificationsService.send(
          'Tickets for Interstellar are ready in Buenos Aires',
          'Tickets for Interstellar are ready in Buenos Aires',
          Priority.EMERGENCY,
          PushoverDevice.IPHONE_RAFA
        );
      } else {
        this.logger.log('The website does not contain any of the keywords.');
      }
    } catch (error) {
      this.logger.log(`Error: ${error.message}`);
    }
  }
}

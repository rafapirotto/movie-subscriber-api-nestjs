import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import puppeteer from 'puppeteer';

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
  @Cron(CronExpression.EVERY_MINUTE)
  async oppenheimerTicketsAreAvailable() {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const [page] = await browser.pages();
      await page.goto('https://www.voyalcine.net/showcase/');
      const movieNameSelector = 'h3.name';
      await page.waitForSelector(movieNameSelector, { timeout: 5000 });
      const h3Elements = await page.$$(movieNameSelector);
      const movieTitles = [];
      const filmIds = [];

      for (const h3Element of h3Elements) {
        const textContent = await page.evaluate(
          (element) => element.textContent,
          h3Element
        );
        movieTitles.push(textContent);
      }

      const playBtnSelector = 'div.play-btn';
      await page.waitForSelector(playBtnSelector, { timeout: 5000 });
      const playBtnDivs = await page.$$(playBtnSelector);

      for (const playBtnDiv of playBtnDivs) {
        const anchorElement = await playBtnDiv.$('a');
        const hrefValue = await page.evaluate(
          (element) => element.getAttribute('href'),
          anchorElement
        );
        filmIds.push(hrefValue);
      }

      const oppenheimerIndex = movieTitles.findIndex((movieTitle) =>
        movieTitle.toLowerCase().includes('flash')
      );
      if (oppenheimerIndex !== -1) {
        this.logger.log('Hay entradas para Oppenheimer');
        this.logger.log('Chequeando si hay para la fecha que yo quiero...');
        const filmId = filmIds[oppenheimerIndex].split('=')[1];
        await page.goto(
          `https://www.voyalcine.net/showcase/boleteria_plus.aspx?filmid=${filmId}`
        );
        await page.waitForSelector('#ctl00_Contenido_lstCinema', {
          timeout: 5000,
        });
        await page.select(
          '#ctl00_Contenido_lstCinema',
          await page.evaluate(
            (selector, name) => {
              const dropdown = document.querySelector(
                selector
              ) as HTMLSelectElement;
              const options = Array.from(dropdown.options);

              for (const option of options) {
                if (option.textContent === name) {
                  return option.value;
                }
              }
              this.logger.log({ selector, name, dropdown, options });

              return '';
            },
            '#ctl00_Contenido_lstCinema',
            'IMAX Theatre (Norcenter)'
          )
        );

        await page.waitForSelector('#ctl00_Contenido_lstFormat', {
          timeout: 5000,
        });
        await page.select(
          '#ctl00_Contenido_lstFormat',
          await page.evaluate(
            (selector, name) => {
              const dropdown = document.querySelector(
                selector
              ) as HTMLSelectElement;
              const options = Array.from(dropdown.options);

              for (const option of options) {
                if (option.textContent === name) {
                  return option.value;
                }
              }
              this.logger.log({ selector, name, dropdown, options });

              return '';
            },
            '#ctl00_Contenido_lstFormat',
            'IMAX-Subtitulado'
          )
        );
        const dropdownSelector = 'select#ctl00_Contenido_lstDays';
        await page.waitForSelector(dropdownSelector);
        const dropdown = await page.$(dropdownSelector);

        const values = await page.evaluate((dropdown) => {
          const options = Array.from(dropdown.options);
          return options.map((option) => option.value);
        }, dropdown);

        const exists = values.find((value) =>
          value.toLowerCase().includes('28 de junio')
        );
        if (exists) {
          this.logger.log('Hay entradas para el 29 de julio');
          await this.notificationsService.send(
            'Tickets for Oppenheimer are ready in Buenos Aires para la fecha que queria',
            'Tickets for Oppenheimer are ready in Buenos Aires para la fecha que queria',
            Priority.EMERGENCY,
            PushoverDevice.IPHONE_RAFA
          );
        } else {
          this.logger.log('Todavia NO hay entradas para el 29 de julio');
          await this.notificationsService.send(
            'Tickets for Oppenheimer are ready in Buenos Aires pero NO para la fecha que queria',
            'Tickets for Oppenheimer are ready in Buenos Aires pero NO para la fecha que queria',
            Priority.EMERGENCY,
            PushoverDevice.IPHONE_RAFA
          );
        }
      } else {
        this.logger.log('Todavia NO hay entradas para Oppenheimer');
      }
    } catch (error) {
      this.logger.log('Hubo un error', error);
    } finally {
      await browser.close();
    }
    const now = new Date().toLocaleString('en-GB', {
      timeZone: 'America/Montevideo',
    });
    this.logger.log(
      `Checked for oppenheimer tickets in Buenos Aires at ${now}`
    );
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

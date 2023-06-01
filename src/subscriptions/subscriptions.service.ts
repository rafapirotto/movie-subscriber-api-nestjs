import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AddSubscriptionDto } from './dto';
import { Subscription } from './entities/subscription.entity';
import {
  ACTIVE_SUBSCRIPTION,
  INACTIVE_SUBSCRIPTION,
  buildUrl,
  DEFAULT_PUSHOVER_PRIORITY,
  NO_SUBSCRIPTION_FOUND,
} from './constants';
import { DecodedUser } from 'src/authentication/strategies/jwt.strategy';
import { MoviesService } from 'src/movies/movies.service';
import { callWithRetry } from '../common';
import { AvailableSubscription } from 'src/cronjobs/cronjobs.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private repository: Repository<Subscription>,
    private moviesService: MoviesService
  ) {}

  async find(
    userId: string,
    movieId: string,
    withDeleted = false
  ): Promise<Subscription> {
    return this.repository.findOne({
      where: { movieId, userId },
      withDeleted,
    });
  }

  async add(
    { id: userId }: DecodedUser,
    { movieId, priority = DEFAULT_PUSHOVER_PRIORITY }: AddSubscriptionDto
  ): Promise<Subscription> {
    const movieExists = await this.moviesService.find(movieId);

    if (!movieExists) {
      const movieURL = buildUrl(movieId);
      const fetchedMovie = await callWithRetry(() => fetch(movieURL));
      const { title, posterUrl } = await fetchedMovie.json();
      await this.moviesService.addMovie({
        id: movieId,
        name: title,
        posterUrl,
      });
    }
    // si no le pongo el true en el tercer parametro, no me trae los que fueron borrados
    // y los preciso para hacer la distincion
    // tres casos:
    // nunca fue agregado (aca lo agrego)
    // fue agregado y lo borraron (aca le cambio el availableAt a null)
    // fue agregado y no lo borraron (aca hago un throw exception)
    const dbSubscription = await this.find(userId, movieId, true);
    if (!dbSubscription) {
      // si el userId que le paso al create() no existe en la tabla 'users', me va a tirar un error
      // ya que userId es una foreign key, entonces sql va a chequear que ese userId exista en la tabla 'users'
      const subscription = this.repository.create({
        movieId,
        userId,
        priority,
      });
      await this.repository.save(subscription);
      return this.repository.findOne({
        where: { userId },
        relations: ['movie'],
      });
    }
    if (!!dbSubscription.availableAt) {
      throw new UnprocessableEntityException(INACTIVE_SUBSCRIPTION);
    } else {
      throw new ConflictException(ACTIVE_SUBSCRIPTION);
    }
  }

  async remove(
    { id: userId }: DecodedUser,
    movieId: string
  ): Promise<Subscription> {
    const dbSubscription = await this.find(userId, movieId, true);
    if (!dbSubscription || !!dbSubscription.availableAt) {
      throw new NotFoundException(NO_SUBSCRIPTION_FOUND);
    }
    if (!dbSubscription.availableAt) {
      // si no le paso una entity al softRemove no funciona bien
      // es por esto que hago el find arriba
      return this.repository.softRemove(dbSubscription);
    }
  }

  async getAllActiveSubscriptionsByUserId({
    id: userId,
  }: DecodedUser): Promise<Array<Subscription>> {
    return this.repository.find({ where: { userId }, relations: ['movie'] });
  }

  async getAllActiveSubscriptions(): Promise<Array<Subscription>> {
    return this.repository.find({
      withDeleted: false,
      relations: ['user', 'movie'],
    });
  }

  async purgeAvailableSubscriptions(
    availableSubscriptions: AvailableSubscription[]
  ): Promise<void> {
    const subscriptionIds = availableSubscriptions.map(({ id }) => id);
    try {
      await this.repository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .update(Subscription)
            .set({
              availableAt: new Date(),
            })
            .whereInIds(subscriptionIds)
            .execute();
        }
      );
    } catch (error) {
      console.log(
        'Available subscriptions update failed, ids:',
        subscriptionIds
      );
    }
  }
}

// querybuilder vs repository:
// https://stackoverflow.com/questions/58722202/what-are-the-different-use-cases-for-using-querybuilder-vs-repository-in-typeor

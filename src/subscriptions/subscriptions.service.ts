import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AddSubscriptionDto } from './dto';
import { Subscription } from './entities/subscription.entity';
import {
  ACTIVE_SUBSCRIPTION,
  buildUrl,
  NO_ACTIVE_SUBSCRIPTION,
} from './constants';
import { DecodedUser } from 'src/authentication/strategies/jwt.strategy';
import { MoviesService } from 'src/movies/movies.service';

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
    { movieId }: AddSubscriptionDto
  ): Promise<Subscription> {
    const movieExists = await this.moviesService.find(movieId);

    if (!movieExists) {
      const movieURL = buildUrl(movieId);
      const fetchedMovie = await fetch(movieURL);
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
    // fue agregado y lo borraron (aca le cambio el deletedAt a null)
    // fue agregado y no lo borraron (aca hago un throw exception)
    const dbSubscription = await this.find(userId, movieId, true);
    if (!dbSubscription) {
      // si el userId que le paso al create() no existe en la tabla 'users', me va a tirar un error
      // ya que userId es una foreign key, entonces sql va a chequear que ese userId exista en la tabla 'users'
      const subscription = this.repository.create({ movieId, userId });
      return this.repository.save(subscription);
    }
    if (!!dbSubscription.deletedAt) {
      // hacemos esto del recover (le pone en null el deletedAt)
      // para evitar que se cree otra columna
      // tengo que pasarle una entity instance
      return this.repository.recover(dbSubscription);
    } else {
      throw new ConflictException(ACTIVE_SUBSCRIPTION);
    }
  }

  async remove(
    { id: userId }: DecodedUser,
    movieId: string
  ): Promise<Subscription> {
    const dbSubscription = await this.find(userId, movieId, true);
    if (!dbSubscription || !!dbSubscription.deletedAt) {
      throw new NotFoundException(NO_ACTIVE_SUBSCRIPTION);
    }
    if (!dbSubscription.deletedAt) {
      // si no le paso una entity al softRemove no funciona bien
      // es por esto que hago el find arriba
      return this.repository.softRemove(dbSubscription);
    }
  }

  async getAll({ id: userId }: DecodedUser): Promise<Array<Subscription>> {
    return this.repository.find({ where: { userId } });
  }
}

// querybuilder vs repository:
// https://stackoverflow.com/questions/58722202/what-are-the-different-use-cases-for-using-querybuilder-vs-repository-in-typeor

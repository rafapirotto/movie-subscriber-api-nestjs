import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AddSubscriptionDto } from './dto';
import { Subscription } from './entities/subscription.entity';
import { SUBSCRIPTION_ALREADY_EXISTS } from './constants';
import { DecodedUser } from 'src/authentication/strategies/jwt.strategy';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private repository: Repository<Subscription>
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
    const dbSubscription = await this.find(userId, movieId);
    if (dbSubscription) {
      throw new ConflictException(SUBSCRIPTION_ALREADY_EXISTS);
    }
    // a tener en cuenta:
    // si el userId que le paso al create() no existe en la tabla 'users', me va a tirar un error
    // ya que userId es una foreign key, entonces sql va a chequear que ese userId exista en la tabla 'users'
    const subscription = this.repository.create({ movieId, userId });
    return this.repository.save(subscription);
  }
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'movie_id' })
  movieId: string;

  @Column('uuid', { name: 'user_id' })
  public userId: string;

  @ManyToOne(() => User, (user) => user.subscriptions)
  // esto del @JoinColumn() se lo pongo para que no llame a la columna "userId", xq quiero los nombres snake_case
  @JoinColumn({ name: 'user_id' })
  user: User;

  @DeleteDateColumn({ name: 'deactivated_at' })
  // lo ponemos como opcional xq al principio es null
  deactivatedAt?: Date;
}

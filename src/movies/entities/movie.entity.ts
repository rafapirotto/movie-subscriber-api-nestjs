import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

import { Subscription } from 'src/subscriptions/entities/subscription.entity';

@Entity('movies')
export class Movie {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  posterUrl: string;

  @OneToMany(() => Subscription, (subscription) => subscription.movie)
  subscriptions?: Subscription[];
}

import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

@Entity('cinemas')
export class Cinema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @OneToMany(() => Subscription, (subscription) => subscription.cinema)
  subscriptions?: Subscription[];
}

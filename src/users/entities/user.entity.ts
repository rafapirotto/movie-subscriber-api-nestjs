import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

import { Subscription } from 'src/subscriptions/entities/subscription.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  // this way we make sure that we never send the password in the response
  @Exclude()
  @Column()
  password: string;
  // si tengo problemas con la password:
  // https://stackoverflow.com/questions/64635617/how-to-set-a-nullable-database-field-to-null-with-typeorm

  @CreateDateColumn({ name: 'created_at' })
  // this value is saved in UTC-0 (aka UTC a secas) time
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAT: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];
}

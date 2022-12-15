import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  create(email: string, username: string, password: string): Promise<User> {
    const user = this.repository.create({ email, username, password });
    return this.repository.save(user);
  }

  findByEmail(email: string): Promise<User> {
    return this.repository.findOne({ where: { email } });
  }

  findByUsername(username: string): Promise<User> {
    return this.repository.findOne({ where: { username } });
  }
}

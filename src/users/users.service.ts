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

  // nota: el this.repository.findOne toma en cuenta si los users fueron borrados (se fija en la columna deletedAt)
  // osea que si llamo al findOne de un user que fue borrado, me devuelve null
  // otra cosa, para borrar un user, lo hago con el this.repository.softRemove()
  findByEmail(email: string): Promise<User> {
    // para incluir los que fueron borrados con el soft remove:
    // const result = await this.repo.find({ where: { id }, withDeleted: true })
    // para recuperar algo que borre con el softRemove:
    // await this.repository.recover({
    //   id: 'someId',
    // });
    return this.repository.findOne({ where: { email } });
  }

  findByUsername(username: string): Promise<User> {
    return this.repository.findOne({ where: { username } });
  }
}

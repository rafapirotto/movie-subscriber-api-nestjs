import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  create(email: string, username: string, password: string): Promise<User> {
    // el create crea una instancia de una entidad, pero no la guarda (x eso usamos el save mas abajo)
    const user = this.repository.create({ email, username, password });
    // El save: saves a given entity or array of entities. If the entity already exist in the database, it is updated.
    // If the entity does not exist in the database, it is inserted.
    // Returns the saved entity/entities
    return this.repository.save(user);
    // mas info aca: https://typeorm.io/repository-api
  }

  findById(id: string, withDeleted = false): Promise<User> {
    return this.repository.findOne({
      where: { id },
      // relations: ['subscriptions'],
      withDeleted,
    });
  }

  // nota: el this.repository.findOne toma en cuenta si los users fueron borrados (se fija en la columna deletedAt)
  // osea que si llamo al findOne de un user que fue borrado, me devuelve null
  // otra cosa, para borrar un user, lo hago con el this.repository.softRemove()
  findByEmail(email: string, withDeleted = false): Promise<User> {
    // para incluir los que fueron borrados con el soft remove:
    // const result = await this.repo.find({ where: { id }, withDeleted: true })
    // para recuperar algo que borre con el softRemove:
    // await this.repository.recover({
    //   id: 'someId',
    // });
    return this.repository.findOne({ where: { email }, withDeleted });
  }

  findByUsername(username: string, withDeleted = false): Promise<User> {
    return this.repository.findOne({
      where: { username },
      withDeleted,
    });
  }
}

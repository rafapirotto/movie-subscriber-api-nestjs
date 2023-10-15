import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private repository: Repository<Location>
  ) { }

  async find(id: string): Promise<Location> {
    return this.repository.findOne({
      where: { id }
    });
  }
}

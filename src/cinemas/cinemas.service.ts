import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cinema } from './entities/cinema.entity';

@Injectable()
export class CinemasService {
  constructor(
    @InjectRepository(Cinema)
    private repository: Repository<Cinema>
  ) {}

  async find(id: string): Promise<Cinema> {
    return this.repository.findOne({
      where: { id },
    });
  }
}

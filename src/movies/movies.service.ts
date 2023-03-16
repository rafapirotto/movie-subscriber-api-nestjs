import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Movie } from './entities/movie.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private repository: Repository<Movie>
  ) {}

  async find(id: string, withDeleted = false): Promise<Movie> {
    return this.repository.findOne({
      where: { id },
      withDeleted,
    });
  }

  async addMovie(movie: Movie): Promise<void> {
    const movieInstance = this.repository.create(movie);
    await this.repository.save(movieInstance);
  }
}

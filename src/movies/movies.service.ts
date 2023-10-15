import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Movie } from './entities/movie.entity';
import { callWithRetry } from '../common';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';

const buildMovieUrl = (id: string): string => {
  return `https://api.movie.com.uy/api/content/shows/all?contentId=${id}`;
};

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

  async addMovie(movie: Partial<Movie>): Promise<void> {
    const movieInstance = this.repository.create(movie);
    await this.repository.save(movieInstance);
  }

  async checkForMovieAvailability(
    subscription: Subscription
  ): Promise<boolean> {
    try {
      const response = await callWithRetry(() =>
        fetch(buildMovieUrl(subscription.movieId))
      );
      const parsedResponse = await response.json();
      return parsedResponse?.filters?.cinemas.some(
        (cinema) => cinema.id === subscription.cinemaId
      );
    } catch (error) {
      return false;
    }
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Movie } from './entities/movie.entity';
import { MoviesService } from './movies.service';

@Module({
  providers: [MoviesService],
  exports: [MoviesService],
  imports: [TypeOrmModule.forFeature([Movie])],
})
export class MoviesModule {}

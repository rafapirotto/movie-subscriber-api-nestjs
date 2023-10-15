import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CinemasService } from './cinemas.service';
import { Cinema } from './entities/cinema.entity';

@Module({
  providers: [CinemasService],
  exports: [CinemasService],
  imports: [TypeOrmModule.forFeature([Cinema])],
})
export class CinemasModule {}

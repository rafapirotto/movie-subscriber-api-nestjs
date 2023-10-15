import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationsService } from './locations.service';
import { Location } from './entities/location.entity';

@Module({
  providers: [LocationsService],
  exports: [LocationsService],
  imports: [TypeOrmModule.forFeature([Location])],
})
export class LocationsModule { }

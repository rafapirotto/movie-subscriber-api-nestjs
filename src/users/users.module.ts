import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  // the following line of code is what creates the repository for us:
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  // since AuthenticationService uses the UsersService, we need to export it
  // so that we make it available for the AuthenticationService
  exports: [UsersService],
})
export class UsersModule {}

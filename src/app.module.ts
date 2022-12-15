import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationModule } from './authentication/authentication.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // here we import all of our modules
    AuthenticationModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'movie-subscriber.sqlite',
      entities: [User],
      synchronize: true,
    }),
  ],
  // controllers are empty because we don't have an AppController
  // controllers are always Controllers
  controllers: [],
  // providers are empty because we don't have an AppService
  // providers are always Services
  providers: [],
  // we only put controllers and providers that are related to the module itself
})
export class AppModule {}

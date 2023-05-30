import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthenticationModule } from './authentication/authentication.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { User } from './users/entities/user.entity';
import { Subscription } from './subscriptions/entities/subscription.entity';
import { Movie } from './movies/entities/movie.entity';

@Module({
  imports: [
    // here we import all of our modules
    AuthenticationModule,
    UsersModule,
    // We could use TypeOrmModule.forRoot({…}) and enter the configuration options
    // but because we are loading environment variable from the .env file we need to import ConfigModule
    // and inject ConfigService first.
    TypeOrmModule.forRootAsync({
      // source: https://blog.devgenius.io/setting-up-nestjs-with-postgresql-ac2cce9045fe
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Subscription, Movie],
        synchronize:
          configService.get<string>('ENV').toLowerCase() !== 'production',
      }),
      inject: [ConfigService],
    }),
    // The setting isGlobal: true will automatically import ConfigModule to all other modules,
    // which means you do not need to import it in Users.module.ts file
    ConfigModule.forRoot({ isGlobal: true }),
    SubscriptionsModule,
    MoviesModule,
  ],
  // controllers are empty because we don't have an AppController
  // controllers are always Controllers
  controllers: [],
  // providers are empty because we don't have an AppService
  // providers are always Services
  providers: [
    {
      // this is the way to apply the ClassSerializerInterceptor interceptor globally
      // source: https://stackoverflow.com/questions/55720448/nestjs-how-to-setup-classserializerinterceptor-as-global-interceptor
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  // we only put controllers and providers that are related to the module itself
})
export class AppModule {}

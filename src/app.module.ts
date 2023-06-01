import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthenticationModule } from './authentication/authentication.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { User } from './users/entities/user.entity';
import { Subscription } from './subscriptions/entities/subscription.entity';
import { Movie } from './movies/entities/movie.entity';
import { EnvVariables, Environments } from './common';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // The setting isGlobal: true will automatically import ConfigModule to all other modules,
    // which means you do not need to import it in Users.module.ts file
    // sin embargo, para usarlo tengo que pasarlo como parametro al constructor
    // hay un ejemplo aca: src/authentication/strategies/jwt.strategy.ts
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // here we import all of our modules
    AuthenticationModule,
    UsersModule,
    // We could use TypeOrmModule.forRoot({…}) and enter the configuration options
    // but because we are loading environment variable from the .env file we need to import ConfigModule
    // and inject ConfigService first.
    TypeOrmModule.forRootAsync({
      // source: https://blog.devgenius.io/setting-up-nestjs-with-postgresql-ac2cce9045fe
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvVariables>) => ({
        type: 'postgres',
        // With the infer property set to true, the ConfigService#get method
        // will automatically infer the property type based on the interface
        host: configService.get('DB_HOST', { infer: true }),
        // tenemos type safety gracias al generic que le pasamos al ConfigService: ConfigService<EnvVariables>
        // es decir, si queremos poner configService.get('algo-que-no-existe'), TS nos va a dar un error
        port: configService.get('DB_PORT', { infer: true }),
        // el infer: true de arriba hace que 'port' sea de type 'number' y no de type 'any'
        username: configService.get('DB_USERNAME', {
          infer: true,
        }),
        password: configService.get('DB_PASSWORD', {
          infer: true,
        }),
        database: configService.get('DB_NAME', { infer: true }),
        entities: [User, Subscription, Movie],
        synchronize:
          configService.get('ENV', { infer: true }) === Environments.DEV,
      }),
      inject: [ConfigService],
    }),
    SubscriptionsModule,
    MoviesModule,
    CronjobsModule,
    NotificationsModule,
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

import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationModule } from './authentication/authentication.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { Subscription } from './subscriptions/entities/subscription.entity';

@Module({
  imports: [
    // here we import all of our modules
    AuthenticationModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'movie-subscriber.sqlite',
      entities: [User, Subscription],
      // TODO: cambiar esto en production:
      synchronize: true,
    }),
    SubscriptionsModule,
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

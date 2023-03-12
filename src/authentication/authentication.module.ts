import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy, JwtStrategy } from './strategies';
import { jwtConstants } from './constants';

@Module({
  // here we put the service associated with our module
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  // here we put dependencies (in the form of modules) of our module
  // for instance, our AuthenticationService (which is inside our AuthenticationModule) uses the UsersService
  // hence, it depends on it, so we should add it in the imports array
  // also, for the UsersModule to be available for import here, we need to export it
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  // here we put the controller associated with our module
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}

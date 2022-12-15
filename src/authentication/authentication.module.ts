import { Module } from '@nestjs/common';

import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  // here we put the service associated with our module
  providers: [AuthenticationService],
  // here we put dependencies (in the form of modules) of our module
  // for instance, our AuthenticationService (which is inside our AuthenticationModule) uses the UsersService
  // hence, it depends on it, so we should add it in the imports array
  // also, for the UsersModule to be available for import here, we need to export it
  imports: [UsersModule],
  // here we put the controller associated with our module
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}

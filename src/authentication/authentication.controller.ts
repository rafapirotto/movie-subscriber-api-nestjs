import { Controller, Post, Body } from '@nestjs/common';

import { User } from 'src/users/entities/user.entity';
import { AuthenticationService } from './authentication.service';
import { SignUpUserDto } from './dto/sign-up-user.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('/signup')
  create(@Body() signUpUserDto: SignUpUserDto): Promise<User> {
    return this.authenticationService.signUp(signUpUserDto);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { SignUpUserDto } from './dto/sign-up-user.dto';

@Injectable()
export class AuthenticationService {
  constructor(private usersService: UsersService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  async validateEmailUniqueness(email: string): Promise<void> {
    const emailExists = await this.usersService.findByEmail(email);
    if (emailExists) throw new BadRequestException('Email already taken');
  }

  async validateUsernameUniqueness(username: string): Promise<void> {
    const usernameExists = await this.usersService.findByUsername(username);
    if (usernameExists) throw new BadRequestException('Username already taken');
  }

  async signUp({ email, username, password }: SignUpUserDto): Promise<User> {
    // if awaits are omitted, the error it may throw won't be catched
    // source: https://stackoverflow.com/questions/73139335/nestjs-crash-when-i-throw-error-in-my-service
    await this.validateEmailUniqueness(email);
    await this.validateUsernameUniqueness(username);
    const hashedPassword = await this.hashPassword(password);
    return this.usersService.create(email, username, hashedPassword);
  }
}

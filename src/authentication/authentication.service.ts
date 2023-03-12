import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { SignUpUserDto } from './dto';

export type Token = {
  access_token: string;
};

@Injectable()
export class AuthenticationService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  async validateEmailUniqueness(email: string): Promise<void> {
    const emailExists = await this.usersService.findByEmail(email);
    if (emailExists) throw new ConflictException('Email already taken');
  }

  async validateUsernameUniqueness(username: string): Promise<void> {
    const usernameExists = await this.usersService.findByUsername(username);
    if (usernameExists) throw new ConflictException('Username already taken');
  }

  buildToken(user: any): Token {
    return {
      access_token: this.jwtService.sign({
        username: user.username,
        sub: user.id,
      }),
    };
  }

  async signUp({ email, username, password }: SignUpUserDto): Promise<Token> {
    // if awaits are omitted, the error it may throw won't be catched
    // source: https://stackoverflow.com/questions/73139335/nestjs-crash-when-i-throw-error-in-my-service
    await this.validateEmailUniqueness(email);
    await this.validateUsernameUniqueness(username);
    const hashedPassword = await this.hashPassword(password);
    const user = await this.usersService.create(
      email,
      username,
      hashedPassword
    );
    return this.buildToken(user);
  }

  login(user: any): Token {
    // este metodo no hace ninguna validacion xq lo llamamos en el controller donde tenemos la LocalAuthGuard
    // que si el metodo validate() retorna null, entonces tiramos una exception.
    // pero si no tira null, llama a este metodo
    return this.buildToken(user);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);
    // this if check is done because otherwise, user.password would be undefined
    // and it throws an exception in the bcrypt.compare method
    if (!user) return null;
    const credentialsAreValid = await bcrypt.compare(password, user.password);
    if (credentialsAreValid) return user;
    return null;
  }
}

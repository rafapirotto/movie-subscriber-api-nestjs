import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthenticationService } from '../authentication.service';
import { INVALID_CREDENTIALS } from '../constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthenticationService) {
    // We can pass an options object in the call to super() to customize the behavior of the passport strategy.
    // In this example, the passport-local strategy by default expects properties called username and password in the request body.
    // Pass an options object to specify different property names, for example: super({ usernameField: 'email' }).
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    // If a user is found and the credentials are valid, the user is returned so Passport can complete its tasks:
    // (e.g., creating the user property on the Request object), and the request handling pipeline can continue.
    // If it's not found, we throw an exception and let our exceptions layer handle it.
    const user = await this.authenticationService.validateUser(
      username,
      password
    );
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return user;
  }
}

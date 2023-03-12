import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';

import { AuthenticationService, Token } from './authentication.service';
import { SignUpUserDto } from './dto';
import { LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signup')
  signUp(@Body() signUpUserDto: SignUpUserDto): Promise<Token> {
    return this.authenticationService.signUp(signUpUserDto);
  }

  // esta auth guard es la que crea el req.user.
  // esto se hace solo si el metodo validate() devuelve algo que no sea null.
  // si devuelve null, entonces no se llama al metodo de abajo (this.authenticationService.login(req.user))
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request) {
    /* Passport automatically creates a user object, based on the value we return from the validate() method,
       and assigns it to the Request object as req.user
       if we were to do this: return req.user;
       we would be returned this:
          {
            "id": "21072572-f545-44f6-800f-c0df614fef11",
            "email": "pirotto@outlook.com",
            "username": "rafa130397",
            "createdAt": "2023-03-12T16:31:59.000Z",
            "updatedAT": "2023-03-12T16:31:59.000Z",
            "deletedAt": null
          }
    */
    return this.authenticationService.login(req.user);
  }
}

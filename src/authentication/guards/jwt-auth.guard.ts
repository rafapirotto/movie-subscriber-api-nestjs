import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// we do this to avoid magic strings
// not doing this would mean to call AuthGuard('jwt') every time, which is error prone since 'jwt' is a string
// para que esto funcione, tengo que agregar el 'JwtStrategy' a la lista de providers del authentication module
// la guard esta actua como middleware para evitar que me pasen un jwt que no es valido (expiró, o lo cambiaron, etc)
// This Guard is referenced by its default name, jwt.
// When our protected route is hit, the Guard will automatically invoke our passport-jwt custom configured logic,
// validating the JWT, and assigning the user property to the Request object
export class JwtAuthGuard extends AuthGuard('jwt') {}

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { INVALID_CREDENTIALS, jwtConstants } from '../constants';
import { UsersService } from 'src/users/users.service';

export type DecodedUser = {
  id: string;
  username: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // este secret tiene que ser el mismo que el que está en src/authentication/authentication.module.ts
      /*
        By importing the same secret used when we signed the JWT,
        we ensure that the verify phase performed by Passport,
        and the sign phase performed in our AuthService, use a common secre
      */
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<DecodedUser> {
    // antes de llegar aca, se valida el jwt en temas de: si ya expiró, si tiene el formato correcto, etc
    // si todo eso está bien, llega a este metodo "validate"
    // sin embargo, puede que el token sea valido pero el user ya no existe
    // es por esto que hago esta otra validacion
    // Escenario: tengo un token que expira en una semana de un user "Rafa"
    // Borro el user Rafa (antes de que pase esa semana)
    // Sin embargo, como el token vence una semana, sigue siendo valido
    // pero este user ya no existe, entonces si no pongo el codigo de abajo
    // voy a permitir hacer cosas en nombre de este user
    const userExists = await this.usersService.findById(payload.sub);
    // tengo que usar findById y no findByUsername o findByEmail por un simple motivo:
    if (!userExists) throw new UnauthorizedException(INVALID_CREDENTIALS);
    return { id: payload.sub, username: payload.username };
  }
}

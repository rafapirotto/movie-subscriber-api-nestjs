import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from './constants';

export class SignUpUserDto {
  @IsEmail()
  email: string;

  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  @IsString()
  password: string;

  @MinLength(MIN_USERNAME_LENGTH)
  @IsString()
  username: string;
}

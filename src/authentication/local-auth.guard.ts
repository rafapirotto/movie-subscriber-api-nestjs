import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// we do this to avoid magic strings
// not doing this would mean to call AuthGuard('local') every time, which is error prone since 'local' is a string
export class LocalAuthGuard extends AuthGuard('local') {}

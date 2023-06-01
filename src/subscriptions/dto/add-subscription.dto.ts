import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { Priority } from '../types';

export class AddSubscriptionDto {
  @IsUUID()
  movieId: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: number;
}

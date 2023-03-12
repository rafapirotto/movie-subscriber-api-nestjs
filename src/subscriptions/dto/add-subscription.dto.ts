import { IsUUID } from 'class-validator';

export class AddSubscriptionDto {
  @IsUUID()
  movieId: string;
}

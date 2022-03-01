import { IsNotEmpty } from 'class-validator';

export class TokenUser {
  @IsNotEmpty()
  readonly sub!: number;
}

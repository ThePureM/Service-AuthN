import { IsEmail, IsNotEmpty } from 'class-validator';

export class FindUser {
  @IsNotEmpty()
  readonly username?: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email?: string;
}

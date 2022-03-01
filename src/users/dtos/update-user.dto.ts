import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUser {
  @IsOptional()
  readonly firstName?: string;

  @IsOptional()
  readonly lastName?: string;

  @IsNotEmpty()
  readonly username?: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email?: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  readonly password?: string;
}

import { IsNotEmpty } from 'class-validator';
import { CreateUser } from 'src/users/dtos';

export class RegisterUser extends CreateUser {
  @IsNotEmpty()
  readonly confirmationPassword?: string;
}

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { Auth } from './entities/auth.entity';
import { AuthRepository } from './repositories/auth.repository';
import { UsersService } from 'src/users/users.service';
import { LoginUser, RegisterUser } from './dtos';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private usersService: UsersService,
  ) {}

  async findById(id: number): Promise<Auth> {
    return this.authRepository.findOne(id);
  }

  async findByUserId(id: number): Promise<Auth> {
    return this.authRepository.findOne({ user: id });
  }

  async validate(user: LoginUser): Promise<User> {
    const foundUser = await this.usersService.find({
      username: user.username,
      email: user.username,
    });

    if (!user || !(await argon2.verify(foundUser.password, user.password))) {
      throw new UnauthorizedException('Incorrect username or password');
    }

    return foundUser;
  }

  async register(user: RegisterUser): Promise<User> {
    await this.usersService
      .exist({
        username: user.username,
        email: user.email,
      })
      .then((exist) => {
        if (exist) throw new BadRequestException('User already registered');
      });

    if (
      user.confirmationPassword &&
      user.password !== user.confirmationPassword
    ) {
      throw new BadRequestException(
        'Password and Confirmation Password must match',
      );
    }

    return this.usersService.create(user);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';
import { TokenUser } from '../dtos';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AccessToken {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async create(user: TokenUser): Promise<string> {
    return this.jwtService.signAsync(user);
  }

  async validate(payload: TokenUser): Promise<User> {
    const foundUser = await this.usersService.findById(payload.sub);

    if (!payload || !foundUser) {
      throw new UnauthorizedException('Access Token invalid');
    }

    return foundUser;
  }
}

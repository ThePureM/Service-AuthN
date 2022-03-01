import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtFromRequestFunction } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { TokenUser } from '../dtos';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RefreshToken {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async crate(user: TokenUser): Promise<string> {
    return this.jwtService.signAsync(user);
  }

  async save(userId: number, token: string): Promise<void> {
    return this.authService.findByUserId(userId).then((auth) => {
      auth.refreshToken.push(token);
    });
  }

  async delete(userId: number, token: string): Promise<void> {
    return this.authService.findByUserId(userId).then((auth) => {
      const tokenIndex = auth.refreshToken.indexOf(token);

      if (tokenIndex !== -1) auth.refreshToken.splice(tokenIndex, 1);
    });
  }

  async allowed(userId: number, token: string): Promise<boolean> {
    return this.authService.findByUserId(userId).then((auth) => {
      return auth.refreshToken.includes(token);
    });
  }

  async clear(userId: number): Promise<void> {
    return this.authService.findByUserId(userId).then((auth) => {
      auth.refreshToken = [];
    });
  }

  async validate(payload: TokenUser, request: Request): Promise<User> {
    const foundUser = await this.usersService.findById(payload.sub);

    const { refreshToken } = request.signedCookies;
    const foundToken = await this.allowed(payload.sub, refreshToken);

    if (!payload || !foundUser || !foundToken) {
      throw new UnauthorizedException('Refresh Token invalid');
    }

    return foundUser;
  }

  extractor: JwtFromRequestFunction = function (req: Request): string {
    const { refreshToken } = req.signedCookies;

    return refreshToken ? refreshToken : null;
  };
}

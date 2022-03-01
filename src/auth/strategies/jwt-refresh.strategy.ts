import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { RefreshToken } from '../tokens';
import { GUARDTYPE_JWTREFRESH } from '../constants/guard.constant';
import { TokenUser } from '../dtos';
import { User } from 'src/users/entities/user.entity';
import { AuthJWTConfig } from 'src/common';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  GUARDTYPE_JWTREFRESH,
) {
  constructor(
    readonly configService: ConfigService,
    readonly refreshToken: RefreshToken,
  ) {
    super({
      secretOrKey: configService.get<AuthJWTConfig>('auth.jwt').refresh.secret,
      jwtFromRequest: ExtractJwt.fromExtractors([refreshToken.extractor]),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenUser): Promise<User> {
    return this.refreshToken.validate(payload, request);
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenUser } from '../dtos';
import { User } from 'src/users/entities/user.entity';
import { AccessToken } from '../tokens';
import { AuthJWTConfig } from 'src/common';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private accessToken: AccessToken,
  ) {
    super({
      secretOrKey: configService.get<AuthJWTConfig>('auth.jwt').auth.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenUser): Promise<User> {
    return this.accessToken.validate(payload);
  }
}

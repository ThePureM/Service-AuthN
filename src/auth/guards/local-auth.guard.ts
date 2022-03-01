import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { ReqSession, SessionConfig } from 'src/common';
import { LoginUser } from '../dtos';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  private sessionConfig = this.configService.get<SessionConfig>('session');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;

    const request = context.switchToHttp().getRequest() as Request;
    await super.logIn(request).then(() => {
      const user = request.user as LoginUser;

      if (user.remember) {
        const session = request.session as ReqSession;

        session.cookie.maxAge = this.sessionConfig.cookie.maxAgeRemember;
      }
    });

    return result;
  }
}

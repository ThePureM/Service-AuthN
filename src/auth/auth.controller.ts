import {
  Body,
  Controller,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import {
  AuthJWTConfig,
  Cookies,
  COOKIE_REDIRECT,
  ReqUser,
  SgdCookies,
  UnauthenticatedGuard,
  Usr,
} from 'src/common';
import { AuthService } from './auth.service';
import { AccessToken, RefreshToken } from './tokens';
import { JwtAuthGuard, JwtRefreshGuard, LocalAuthGuard } from './guards';
import { RegisterUser } from './dtos';
import {
  COOKIE_REFRESHTOKEN,
  REQQUERY_TOKENTYPE,
  REQQUERY_USEREFRESHTOKEN,
  URLPATH_AUTH_LOGIN,
  URLPATH_AUTH_LOGOUT,
  URLPATH_AUTH_REGISTER,
  URLPATH_AUTH_TOKENCHECK,
  URLPATH_AUTH_TOKENREFRESH,
  URLPREFIX_AUTH,
} from './constants';

@Controller(URLPREFIX_AUTH)
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private authService: AuthService,
    private accessToken: AccessToken,
    private refreshToken: RefreshToken,
  ) {}

  private authJWTConfig = this.configService.get<AuthJWTConfig>('auth.jwt');

  @UseGuards(LocalAuthGuard)
  @Post(URLPATH_AUTH_LOGIN)
  async loginUser(
    @Query(REQQUERY_USEREFRESHTOKEN, ParseBoolPipe) useRefreshToken: boolean,
    @Query(REQQUERY_TOKENTYPE) tokenType: string,
    @Cookies(COOKIE_REDIRECT) redirect: string,
    @Usr() usr: ReqUser,
    @Res() res: Response,
  ) {
    if (redirect) {
      res.cookie(COOKIE_REDIRECT, '', { maxAge: 0 });

      return res.redirect(redirect);
    } else {
      const { id, username } = usr;
      const accessToken = await this.accessToken.create({ sub: id });

      if (useRefreshToken) {
        const refreshToken = await this.refreshToken
          .crate({ sub: id })
          .then((token) => {
            this.refreshToken.save(id, token);

            return token;
          });

        switch (tokenType) {
          case 'direct':
            return { success: true, username, accessToken, refreshToken };

          case 'cookie':
          default:
            const cookieOptions = this.authJWTConfig.refresh.cookie;
            res.cookie(COOKIE_REFRESHTOKEN, refreshToken, {
              ...cookieOptions,
              signed: true,
              path: `/${URLPREFIX_AUTH}/${URLPATH_AUTH_TOKENCHECK}`,
            });
        }
      }

      return { success: true, username, accessToken };
    }
  }

  @UseGuards(UnauthenticatedGuard)
  @Post(URLPATH_AUTH_REGISTER)
  async registerUser(
    @Body() user: RegisterUser,
    @Cookies(COOKIE_REDIRECT) redirect: string,
    @Res() res: Response,
  ) {
    return this.authService.register(user).then((created) => {
      const { username } = created;

      if (redirect) {
        res.cookie(COOKIE_REDIRECT, '', { maxAge: 0 });

        return res.redirect(redirect);
      } else {
        return { success: true, username };
      }
    });
  }

  @Post(URLPATH_AUTH_LOGOUT)
  async logoutUser(
    @Req() req: Request,
    @Cookies(COOKIE_REDIRECT) redirect: string,
    @SgdCookies(COOKIE_REFRESHTOKEN) refreshToken: string,
    @Usr() usr: ReqUser,
    @Res() res: Response,
  ) {
    if (refreshToken) {
      this.refreshToken.delete(usr.id, refreshToken);

      res.cookie(COOKIE_REFRESHTOKEN, '', { maxAge: 0 });
    }

    if (req.isAuthenticated()) req.logOut();

    if (redirect) {
      res.cookie(COOKIE_REDIRECT, '', { maxAge: 0 });

      return res.redirect(redirect);
    } else {
      return { success: true };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(URLPATH_AUTH_TOKENCHECK)
  async check() {
    return { success: true };
  }

  @UseGuards(JwtRefreshGuard)
  @Get(URLPATH_AUTH_TOKENREFRESH)
  async refresh(
    @Query(REQQUERY_TOKENTYPE) tokenType: string,
    @Usr() usr: ReqUser,
    @Res() res: Response,
  ) {
    const { id } = usr;
    const accessToken = await this.accessToken.create({ sub: id });
    const refreshToken = await this.refreshToken
      .crate({ sub: id })
      .then((token) => {
        this.refreshToken.save(id, token);

        return token;
      });

    switch (tokenType) {
      case 'direct':
        return { success: true, accessToken, refreshToken };

      case 'cookie':
      default:
        const cookieOptions = this.authJWTConfig.refresh.cookie;
        res.cookie(COOKIE_REFRESHTOKEN, refreshToken, {
          ...cookieOptions,
          signed: true,
          path: `/${URLPREFIX_AUTH}/${URLPATH_AUTH_TOKENCHECK}`,
        });

        return { success: true, accessToken };
    }
  }
}

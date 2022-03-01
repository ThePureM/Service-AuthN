import {
  BadRequestException,
  Controller,
  Get,
  ParseBoolPipe,
  Query,
  Redirect,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as gravatar from 'gravatar';

import {
  AppConfig,
  AuthenticatedGuard,
  Cookies,
  COOKIE_LOGINURL,
  COOKIE_REDIRECT,
  COOKIE_REDIRECTCB,
  REQQUERY_CALLBACK,
  REQQUERY_CONTINUE,
  REQQUERY_LOGINURL,
  RenderView,
  ReqUser,
  URLPATH_SIGNIN,
  URLPATH_SIGNUP,
  URLPATH_SIGNOUT,
  URLPATH_CALLBACK,
  Usr,
  ViewPage,
} from './common';
import {
  REQQUERY_TOKENTYPE,
  REQQUERY_USEREFRESHTOKEN,
  URLPREFIX_AUTH,
  URLPATH_AUTH_LOGIN,
  URLPATH_AUTH_LOGOUT,
} from './auth/constants';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  private readonly appConfig = this.configService.get<AppConfig>('app');

  @Get()
  root(@Req() req: Request, @Usr() usr: ReqUser, @Res() res: Response) {
    if (req.isAuthenticated()) {
      return res.render(RenderView.INDEX, {
        brand: this.appConfig.brand,
        title: this.appConfig.title,
        username: usr.username,
        fullName: usr.fullName,
        userImage: gravatar.url(usr.email, { size: '192' }),
      });
    } else {
      return res.redirect(this.appConfig.home);
    }
  }

  @Get(URLPATH_SIGNIN)
  renderSignIn(
    @Req() req: Request,
    @Query(REQQUERY_CONTINUE) redirect: string,
    @Query(REQQUERY_CALLBACK, ParseBoolPipe) callback: boolean,
    @Query(REQQUERY_LOGINURL) loginURL: string,
    @Res() res: Response,
  ) {
    if (callback) {
      if (!loginURL || !redirect) throw new BadRequestException();

      res.cookie(COOKIE_LOGINURL, loginURL, { path: `/${URLPATH_CALLBACK}` });
      res.cookie(COOKIE_REDIRECTCB, redirect, { path: `/${URLPATH_CALLBACK}` });
    }

    if (req.isUnauthenticated()) {
      res.cookie(
        COOKIE_REDIRECT,
        callback ? `/${URLPATH_CALLBACK}` : redirect ? redirect : '/',
      );

      return res.render(RenderView.INDEX, {
        brand: this.appConfig.brand,
        title: this.appConfig.title + ` - ${ViewPage.SIGNIN}`,
        auth: ViewPage.SIGNIN,
      });
    } else {
      return res.redirect(
        callback ? `/${URLPATH_CALLBACK}` : redirect ? redirect : '/',
      );
    }
  }

  @Get(URLPATH_SIGNUP)
  renderSignUp(
    @Req() req: Request,
    @Query(REQQUERY_CONTINUE) redirect: string,
    @Res() res: Response,
  ) {
    if (req.isAuthenticated()) {
      res.cookie(COOKIE_REDIRECT, redirect ? redirect : `/${URLPATH_SIGNIN}`);

      return res.render(RenderView.INDEX, {
        brand: this.appConfig.brand,
        title: this.appConfig.title + ` - ${ViewPage.SIGNUP}`,
        auth: ViewPage.SIGNUP,
      });
    } else {
      return res.redirect(redirect ? redirect : `/${URLPATH_SIGNIN}`);
    }
  }

  @UseGuards(AuthenticatedGuard)
  @Get(URLPATH_SIGNOUT)
  @Redirect()
  signOut(@Query(REQQUERY_CONTINUE) redirect: string, @Res() res: Response) {
    res.cookie(COOKIE_REDIRECT, redirect ? redirect : `/${URLPATH_SIGNIN}`);

    return { url: `/${URLPREFIX_AUTH}/${URLPATH_AUTH_LOGOUT}` };
  }

  @UseGuards(AuthenticatedGuard)
  @Get(URLPATH_CALLBACK)
  @Render(RenderView.INDEX)
  callback(
    @Cookies(COOKIE_LOGINURL) loginURL: string,
    @Cookies(COOKIE_REDIRECTCB) redirectCB: string,
    @Res() res: Response,
  ) {
    if (!loginURL || !redirectCB) throw new BadRequestException();

    res.cookie(COOKIE_LOGINURL, '', { maxAge: 0 });
    res.cookie(COOKIE_REDIRECTCB, '', { maxAge: 0 });

    const loginAPI = `/${URLPREFIX_AUTH}/${URLPATH_AUTH_LOGIN}`;
    const loginQuery = `${loginAPI}?${REQQUERY_USEREFRESHTOKEN}=true&${REQQUERY_TOKENTYPE}=direct`;

    return {
      brand: this.appConfig.brand,
      title: this.appConfig.title + ` - ${ViewPage.CALLBACK}`,
      auth: ViewPage.CALLBACK,
      loginAPI: loginQuery,
      loginURL,
      redirect: redirectCB,
    };
  }
}

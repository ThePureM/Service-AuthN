import {
  Inject,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import RedisStore from 'connect-redis';
import * as passport from 'passport';

import {
  CookieConfig,
  Environment,
  REDIS,
  SessionConfig,
  TimeoutInterceptor,
} from './common';
import {
  configuration,
  appConfig,
  sessionConfig,
  cookieConfig,
} from './config';
import { AppController } from './app.controller';
import { OrmModule, RedisModule } from './providers';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {
  URLPREFIX_AUTH,
  URLPATH_AUTH_TOKENCHECK,
  URLPATH_AUTH_TOKENREFRESH,
} from './auth/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration, appConfig, cookieConfig, sessionConfig],
      isGlobal: true,
    }),
    OrmModule,
    UsersModule,
    AuthModule,
    RedisModule,
  ],
  providers: [
    Logger,
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const cookieConfig = this.configService.get<CookieConfig>('cookie');
    const sessionConfig = this.configService.get<SessionConfig>('session');

    this.redis.on('connect', () => {
      Logger.log('Connected to Redis successfully', 'Bootstrap');
    });

    const environment = this.configService.get<Environment>('environment');
    switch (environment) {
      case Environment.Production:
        consumer.apply(helmet(), compression()).forRoutes('*');

        break;
    }

    consumer
      .apply(
        cookieParser(cookieConfig.secret),

        session({
          store: new (RedisStore(session))({
            client: this.redis,
            logErrors: true,
          }),

          secret: sessionConfig.secret,
          resave: false,
          saveUninitialized: false,

          cookie: {
            sameSite: true,
            httpOnly: false,
            maxAge: sessionConfig.cookie.maxAge,
          },
        }),

        passport.initialize(),
      )
      .forRoutes('*');

    consumer
      .apply(passport.session())
      .exclude(
        `${URLPREFIX_AUTH}/${URLPATH_AUTH_TOKENCHECK}`,
        `${URLPREFIX_AUTH}/${URLPATH_AUTH_TOKENREFRESH}`,
      )
      .forRoutes('*');
  }
}

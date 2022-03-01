import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AuthJWTConfig } from 'src/common';
import { authConfig } from 'src/config';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { Auth } from './entities/auth.entity';
import {
  JwtAuthStrategy,
  JwtRefreshStrategy,
  LocalStrategy,
} from './strategies';
import { AuthSerializer } from './serializers/passport.serializer';
import { AccessToken, RefreshToken } from './tokens';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    UsersModule,
    MikroOrmModule.forFeature({ entities: [Auth] }),
    PassportModule.register({
      session: true,
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const jwtConfig = configService.get<AuthJWTConfig>('auth.jwt');
        const jwtSignOptions = jwtConfig.signOptions;

        return {
          secret: jwtConfig.secret,
          signOptions: { expiresIn: jwtSignOptions.expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AccessToken,
    RefreshToken,
    LocalStrategy,
    JwtAuthStrategy,
    JwtRefreshStrategy,
    AuthSerializer,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

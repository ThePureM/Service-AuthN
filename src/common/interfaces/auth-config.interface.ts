interface JWTCookie {
  readonly httpOnly: boolean;
  readonly secure: boolean;
  readonly maxAge: number;
  readonly sameSite: boolean | 'none' | 'lax' | 'strict';
}

interface JWTSignOptions {
  readonly expiresIn: string | number;
}

interface JWTAuth {
  readonly secret: string | string[];
}

interface JWTRefresh {
  readonly secret: string | string[];
  readonly cookie: JWTCookie;
}

export interface AuthJWTConfig {
  readonly secret: string;
  readonly signOptions: JWTSignOptions;

  readonly auth: JWTAuth;
  readonly refresh: JWTRefresh;
}

export interface AuthConfig {
  readonly jwt: AuthJWTConfig;
}

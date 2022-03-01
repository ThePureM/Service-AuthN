interface SessionCookie {
  readonly maxAge: number;
  readonly maxAgeRemember: number;
}

export interface SessionConfig {
  readonly secret: string | string[];
  readonly cookie: SessionCookie;
}

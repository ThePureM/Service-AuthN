class ReqCookie {
  maxAge?: number;
}

export class ReqSession {
  readonly cookie?: ReqCookie;
}

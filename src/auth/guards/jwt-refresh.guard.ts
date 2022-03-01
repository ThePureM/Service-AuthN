import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GUARDTYPE_JWTREFRESH } from '../constants';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(GUARDTYPE_JWTREFRESH) {}

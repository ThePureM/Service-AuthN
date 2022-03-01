import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UnauthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    return context.switchToHttp().getRequest().isUnauthenticated();
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserDocument } from 'src/user/user.model';

@Injectable()
export class OnlyModeratorGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: UserDocument }>();

    const user = request.user;
    if (user.role !== 'MODERATOR')
      throw new ForbiddenException("You don't have permission for this action");
    return user.role === 'MODERATOR' && true;
  }
}

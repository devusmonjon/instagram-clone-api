import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleUser } from 'src/user/user.interface';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { OnlyAdminGuard } from '../guards/admin.guard';
import { OnlyModeratorGuard } from '../guards/instructor.guard';

export const Auth = (role: RoleUser = 'USER') => {
  return applyDecorators(
    (role === 'ADMIN' && UseGuards(JwtAuthGuard, OnlyAdminGuard)) ||
      (role === 'USER' && UseGuards(JwtAuthGuard)) ||
      (role === 'MODERATOR' && UseGuards(JwtAuthGuard, OnlyModeratorGuard)),
  );
};

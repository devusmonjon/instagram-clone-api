import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from './decorators/user.decorator';
import { UserDocument } from './user.model';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Auth()
  async getProfile(@User('_id') _id: string) {
    return this.userService.byId(_id);
  }

  @Get('feed')
  @Auth()
  async getFeed(@User('_id') _id: string, @Query('limit') limit: number = 10) {
    return this.userService.getFeed(_id, limit);
  }

  @Get('search')
  async search(@Query('q') q: string) {
    return this.userService.search(q);
  }

  @Get('all')
  @Auth()
  async getAll(@Query('limit') limit: number = 10, @User('_id') _id: string) {
    return this.userService.getAll(limit, _id);
  }

  @Get('profile/:username')
  async getProfileByUsername(@Param('username') username: string) {
    return this.userService.getUser(username);
  }

  @Post('follow/:username')
  @Auth()
  async followUser(
    @User('username') follower: string,
    @User() user: UserDocument,
    @Param('username') username: string,
  ) {
    return this.userService.follow(follower, username, user);
  }

  @Post('unfollow/:username')
  @Auth()
  async unfollowUser(
    @User('username') follower: string,
    @User() user: UserDocument,
    @Param('username') username: string,
  ) {
    return this.userService.unfollow(follower, username, user);
  }
}

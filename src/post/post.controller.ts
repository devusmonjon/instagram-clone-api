import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';
import { UserDocument } from 'src/user/user.model';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @Post()
  @Auth()
  async create(@Body() dto: any, @User() user: UserDocument) {
    return this.postService.create(dto, user);
  }

  @Get(':username/:id')
  @Auth()
  async getPost(@Param('username') username: string, @Param('id') id: string) {
    return this.postService.getPost(username, id);
  }
}

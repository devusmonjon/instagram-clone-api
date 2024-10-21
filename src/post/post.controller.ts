import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

  @Get(':username')
  @Auth()
  async getPosts(@Param('username') username: string) {
    return this.postService.getAllUserPosts(username);
  }

  @Get()
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  @Post(':id/like')
  @Auth()
  async likePost(@Param('id') id: string, @User() user: UserDocument) {
    return this.postService.likePost(id, user);
  }

  @Delete(':id')
  @Auth()
  async deletePost(@Param('id') id: string, @User() user: UserDocument) {
    return this.postService.deletePost(id, user);
  }

  @Put(':id')
  @Auth()
  async updatePost(@Param('id') id: string, @Body() dto: any, @User() user: UserDocument) {
    
    return this.postService.updatePost(id, dto, user);
  }
}

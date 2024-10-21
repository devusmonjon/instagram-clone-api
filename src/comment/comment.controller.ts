import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';
import { UserDocument } from 'src/user/user.model';
import { CommentDocument } from './comment.model';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @Auth()
  async getAllComments() {
    return await this.commentService.getAllComments();
  }

  @Get('post/:id')
  @Auth()
  async getCommentsByPostId(@Param('id') id: string) {
    return await this.commentService.getCommentsByPostId(id);
  }

  @Get(':id')
  @Auth()
  async getCommentById(@Param('id') id: string) {
    return await this.commentService.getCommentById(id);
  }

  @Delete(':id')
  @Auth()
  async deleteComment(@Param('id') id: string, @User() user: UserDocument) {
    return await this.commentService.deleteComment(id, user);
  }

  @Post(':id')
  @Auth()
  async createComment(@Body() dto: CommentDocument, @User("id") userId: string, @Param('id') id: string) {
    return await this.commentService.createComment(dto, userId, id);
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/post/post.model';
import { User, UserSchema } from 'src/user/user.model';
import { UserModule } from 'src/user/user.module';
import { Comment, CommentSchema } from './comment.model';
import { PostModule } from 'src/post/post.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Post.name, schema: PostSchema },
            {name: Comment.name, schema: CommentSchema}
          ]),
          UserModule,
          PostModule
    ],
    controllers: [CommentController],
    providers: [CommentService, UserModule, PostModule],
})
export class CommentModule { }

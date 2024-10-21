import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Post } from 'src/post/post.model';
import { User } from 'src/user/user.model';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true, collection: 'comments' })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  which_post: Post;

  @Prop({ required: true })
  message: string;

  @Prop({ required: false, default: 0 })
  likes_count: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

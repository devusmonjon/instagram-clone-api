import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/user.model';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true, collection: 'posts' })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ required: true })
  content: { url: string; type: 'VIDEO' | 'AUDIO' | 'IMAGE' }[];

  @Prop({ required: true })
  content_alt: string;

  @Prop({ required: true })
  caption: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false, default: false })
  private: boolean;

  @Prop({ required: false, default: false })
  deleted: boolean;

  @Prop({ required: false, default: true })
  published: boolean;

  @Prop({ required: false, default: true })
  show_likes: boolean;

  @Prop({ required: false, default: true })
  comments_enabled: boolean;

  @Prop({ required: false, default: [] })
  likes: string[];

  @Prop({ required: false, default: 0 })
  likes_count: number;

  @Prop({ required: false, default: 0 })
  comments_count: number;

  @Prop({ required: false, default: 0 })
  shares_count: number;

  @Prop({ required: false, default: 0 })
  views_count: number;

  @Prop({ required: false, default: true })
  reels: boolean;

  @Prop({ required: false, default: [] })
  comments: [];

  @Prop({ required: false, default: '' })
  location: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

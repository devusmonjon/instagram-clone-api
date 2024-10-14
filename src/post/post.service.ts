import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.model';
import { Post } from './post.model';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(dto: any, user: UserDocument) {
    return this.postModel.create({ ...dto, owner: user._id });
  }

  async getPost(username: string, id: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new Error('User not found');
    const post = await this.postModel.findOne({ _id: id, owner: user._id });
    if (!post) throw new Error('Post not found');
    return post;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (!user) throw new NotFoundException('User not found');
    const post = await this.postModel.findOne({ _id: id, owner: user._id });
    if (!post) throw new NotFoundException('Post not found');
    const postOwner = await this.userModel
      .findOne({ _id: user._id })
      .select('username')
      .select('photo')
      .select('email')
      .select('fullName');
    if (!postOwner) throw new NotFoundException('Post owner not found');
    post.owner = postOwner;
    return post;
  }

  async getAllPosts() {
    const posts = await this.postModel.find();
    const postsWithOwner = await Promise.all(
      posts.map(async (post) => ({
        ...post.toObject(),
        owner: await this.userModel
          .findById(post.owner)
          .select('username')
          .select('photo')
          .select('email')
          .select('fullName'),
      })),
    );
    return postsWithOwner;
  }

  async getAllUserPosts(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new NotFoundException('User not found');
    return await this.postModel.find({ owner: user._id });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.model';
import { Post, PostDocument } from './post.model';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(dto: PostDocument, user: UserDocument) {
    console.log(user);
    if (!user) throw new NotFoundException('User not found');
    if (!dto.content_alt)
      throw new BadRequestException('content_alt is required');
    if (!dto.content && dto.content.length > 0)
      throw new BadRequestException('Content is not allowed');
    dto.content.forEach((content, idx: number) => {
      if (!content.url)
        throw new BadRequestException(`you need to provide url #${idx + 1}`);
      if (
        !(content.type === 'AUDIO') &&
        !(content.type === 'IMAGE') &&
        !(content.type === 'VIDEO')
      )
        throw new BadRequestException(
          `file type is only "VIDEO" or "AUDIO" or "IMAGE" #${idx + 1}`,
        );
    });
    const post = await this.postModel.create({
      owner: user._id,
      content: dto.content,
      content_alt: dto.content_alt,
      location: dto.location,
      caption: dto.caption,
      title: dto.title || dto.content_alt,
    });
    return post;
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

  async likePost(_id: string, user: UserDocument) {
    const post = await this.postModel.findOne({_id: String(_id)});
    if (!post) throw new NotFoundException('Post not found');
    if (post.likes.includes(String(user._id))) {
      console.log(post.likes.includes(String(user._id)));
      const lll  = post.likes.filter((like) => like != String(user._id));
      console.log(lll);
      post.likes = lll
      
    } else {
      console.log(post.likes.includes(String(user._id)), "asdasd");
      post.likes.push(String(user._id));
    }
    return await post.save();
  }

  async deletePost(_id: string, userId: string) {
    const post = await this.postModel.findOne({_id: String(_id)});
    if (!post) throw new NotFoundException('Post not found');
    console.log(post.owner, userId);
    if (String(post.owner) != String(userId)) throw new BadRequestException('Only owner can delete post');
    return await this.postModel.findByIdAndDelete(_id);
  }

  async updatePost(_id: string, dto: any, user: UserDocument) {
    const post = await this.postModel.findOne({_id: String(_id)});
    if (!post) throw new NotFoundException('Post not found');
    console.log(String(user._id), String(post.owner));
    if (String(post.owner) != String(user._id)) throw new BadRequestException('Only owner can update post');
    if (!dto.content_alt) dto.content_alt = post.content_alt;
    if (!dto.title) dto.title = post.title;
    if (!dto.location) dto.location = post.location;
    if (!dto.caption) dto.caption = post.caption;
    if (!dto.content_alt) dto.content_alt = post.content_alt;

    return await this.postModel.findByIdAndUpdate(_id, {content_alt: dto.content_alt, title: dto.title, location: dto.location, caption: dto.caption}, { new: false });
  }
}

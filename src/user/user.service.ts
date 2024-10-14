import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './user.model';
import { User } from './decorators/user.decorator';
import { Model } from 'mongoose';
import { Post } from 'src/post/post.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  async byId(_id: string) {
    const user = await this.userModel.findById(_id);

    if (!user) throw new NotFoundException('User not found');
    user.password = 'No access to preview password';

    const userPosts = await this.postModel.find({ owner: _id });

    if (userPosts) {
      user.posts = userPosts;
    }

    return user;
  }

  async getFeed(_id: string, limit: number) {
    const user = await this.userModel.findById(_id);
    if (!user) throw new NotFoundException('User not found');

    const followings = user.following.map((user: UserDocument) => user._id);

    const followingPosts = await this.postModel
      .find({
        owner: { $in: followings },
      })
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPosts = await this.postModel.countDocuments({
      owner: { $in: followings },
    });

    return {
      posts: followingPosts,
      limit,
      total: totalPosts,
    };
  }

  async search(q: string) {
    return this.userModel.find({ username: { $regex: q, $options: 'i' } });
  }

  async getAll(limit: number) {
    return this.userModel.find().limit(limit).sort({ createdAt: -1 });
  }

  async follow(follower: string, followTo: string, currentUser: UserDocument) {
    if (follower === followTo) throw new BadRequestException('Self follow');
    const user = await this.userModel.findOne({ username: followTo });

    if (!user) throw new NotFoundException('User not found');

    const index = currentUser.following.findIndex(
      (user) => user.username === followTo,
    );
    if (index !== -1) {
      throw new BadRequestException('Already followed');
    }

    user.followers.push({
      username: follower,
      // @ts-ignore
      _id: currentUser._id,
      fullName: currentUser.fullName,
      photo: currentUser.photo,
    } as UserDocument);
    currentUser.following.push({
      username: followTo,
      // @ts-ignore
      _id: user._id,
      fullName: user.fullName,
      photo: user.photo,
    });

    await this.userModel.updateOne({ username: followTo }, user);
    await this.userModel.updateOne({ username: follower }, currentUser);

    return {
      followed: index === -1,
      follower_username: follower,
      follow_to: followTo,
    };
  }

  async unfollow(
    follower: string,
    followTo: string,
    currentUser: UserDocument,
  ) {
    if (follower === followTo) throw new BadRequestException('Self unfollow');
    const user = await this.userModel.findOne({ username: followTo });

    if (!user) throw new NotFoundException('User not found');

    const index = currentUser.following.findIndex(
      (user) => user.username === followTo,
    );
    if (index === -1) {
      throw new BadRequestException('Already unfollowed');
    }

    user.followers = user.followers.filter(
      (user) => user.username !== follower,
    );
    currentUser.following = currentUser.following.filter(
      (user) => user.username !== followTo,
    );

    await this.userModel.updateOne({ username: followTo }, user);
    await this.userModel.updateOne({ username: follower }, currentUser);

    return {
      unfollowed: index !== -1,
      follower_username: follower,
      follow_to: followTo,
    };
  }

  async getUser(username: string) {
    const user = await this.userModel.findOne({ username });

    if (!user) throw new NotFoundException('User not found');
    const userPosts = await this.postModel.find({ owner: user._id });

    if (userPosts) {
      user.posts = userPosts;
    }
    return {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      followers: user.followers,
      following: user.following,
      photo: user.photo,
      posts: user.posts,
      emailActivated: user.emailActivated,
      reels: user.reels,
    };
  }
}

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
    const user = await this.userModel.findById(_id).select('-password');
    if (!user) throw new NotFoundException('User not found');

    const userPosts = await this.postModel.find({ owner: _id }).select('');
    user.posts = userPosts;
    return user;
  }

  async getFeed(_id: string, limit: number) {
    const user = await this.userModel.findById(_id);
    if (!user) throw new NotFoundException('User not found');

    const followings = user.following.map((u: UserDocument) => u._id);
    followings.push(user._id);
    followings.sort(() => Math.random() - 0.5);

    const followingPosts = await this.postModel
      .find({ owner: { $in: followings } })
      .limit(limit)
      .sort({ createdAt: -1 });

    const postsWithOwner = await Promise.all(
      followingPosts.map(async (post) => ({
        ...post.toObject(),
        owner: await this.userModel
          .findById(post.owner)
          .select('username')
          .select('photo')
          .select('email')
          .select('fullName'),
      })),
    );

    const totalPosts = await this.postModel.countDocuments({
      owner: { $in: followings },
    });

    return {
      posts: postsWithOwner,
      limit,
      total: totalPosts,
    };
  }

  async search(q: string) {
    return await this.userModel.find({
      username: { $regex: q, $options: 'i' },
    });
  }

  async getAll(limit: number, current_id?: string) {
    // without password

    if (current_id) {
      return await this.userModel
        .find({ _id: { $ne: current_id } })
        .limit(limit)
        .sort({ createdAt: -1 })
        .select('-password');
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async getUsernames() {
    const res = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .select('username');
    const mappedRes = res.map((user) => user.username);
    return mappedRes;
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
    } as UserDocument);
    currentUser.following.push({
      username: followTo,
      // @ts-ignore
      _id: user._id,
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
    const userPosts = await this.postModel
      .find({ owner: user._id })
      .select('_id');

    if (userPosts) {
      user.posts = userPosts.map((post) => post._id) as any;
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

  async updateUser(
    id: string,
    dto: UserDocument & {
      full_name: string;
    },
  ) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!dto.full_name) dto.full_name = user.fullName;
    if (!dto.username) dto.username = user.username;
    if (!dto.email) dto.email = user.email;
    if (!dto.photo) dto.photo = user.photo;
    if (!dto.bio) dto.bio = user.bio;

    const updatedUser = {
      fullName: dto.full_name,
      username: dto.username,
      email: dto.email,
      photo: dto.photo,
      bio: dto.bio,
    };
    return this.userModel.findByIdAndUpdate(id, updatedUser, { new: true });
  }
}

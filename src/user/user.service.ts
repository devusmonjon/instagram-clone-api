import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './user.model';
import { User } from './decorators/user.decorator';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async byId(_id: string) {
    const user = await this.userModel.findById(_id);

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async follow(follower, followTo) {
    if (follower === followTo) throw new BadRequestException('Self follow');
    const user = await this.userModel.findOne({ username: followTo });

    if (!user) throw new NotFoundException('User not found');

    if (user.followers.includes(follower)) {
      // user.followers = user.followers.filter((id) => id !== follower);
      throw new BadRequestException('Already followed');
    } else {
      user.followers.push(follower);
    }
    await this.userModel.updateOne({ username: followTo }, user);

    return {
      followed: !user.followers.includes(follower),
      follower_username: follower,
      follow_to: followTo,
    };
  }

  async unfollow(follower, followTo) {
    if (follower === followTo) throw new BadRequestException('Self follow');
    const user = await this.userModel.findOne({ username: followTo });

    if (!user) throw new NotFoundException('User not found');

    if (!user.followers.includes(follower)) {
      throw new BadRequestException('Not followed');
    } else {
      user.followers = user.followers.filter((id) => id !== follower);
    }
    await this.userModel.updateOne({ username: followTo }, user);
    return {
      followed: false,
      follower_username: follower,
      follow_to: followTo,
    };
  }

  async getUser(username: string) {
    const user = await this.userModel.findOne({ username });

    if (!user) throw new NotFoundException('User not found');
    return {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      followers: user.followers.length,
      following: user.following.length,
      photo: user.photo,
    };
  }
}

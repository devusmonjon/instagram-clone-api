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
    return {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      followers: user.followers,
      following: user.following,
      photo: user.photo,
    };
  }
}

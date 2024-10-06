import { Injectable, NotFoundException } from '@nestjs/common';
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
}

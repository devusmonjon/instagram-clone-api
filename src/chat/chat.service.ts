import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.model';
import { User } from 'src/user/user.model';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // Xabarni saqlash
  async saveMessage(
    senderUsername: string,
    receiverUsername: string,
    content: string,
  ): Promise<Message> {
    const sender = await this.userModel.findOne({ username: senderUsername });
    const receiver = await this.userModel.findOne({
      username: receiverUsername,
    });

    if (!sender || !receiver) {
      throw new BadRequestException('Foydalanuvchi topilmadi');
    }

    console.log(sender, receiver, content);

    if (!content) throw new BadRequestException('Xabar kiritish majburiy');

    const newMessage = new this.messageModel({
      sender: sender._id,
      receiver: receiver._id,
      content,
    });

    await newMessage.save();

    return this.messageModel
      .findById(newMessage._id)
      .populate('sender', 'username fullName')
      .populate('receiver', 'username fullName')
      .exec();
  }

  // Foydalanuvchi o'rtasidagi xabarlarni olish
  async getMessages(username: string): Promise<Message[]> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new BadRequestException('Foydalanuvchi topilmadi');
    }

    return this.messageModel
      .find({ $or: [{ sender: user._id }, { receiver: user._id }] })
      .populate('sender', 'username fullName')
      .populate('receiver', 'username fullName')
      .exec();
  }
}

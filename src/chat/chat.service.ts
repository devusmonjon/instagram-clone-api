import { Injectable } from '@nestjs/common';
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
  async saveMessage(token: string, content: string): Promise<Message> {
    console.log(token, content);
    const { _id }: { _id: string } = JSON.parse(atob(token.split('.')[1]));

    const user = await this.userModel.findOne({
      _id,
    });
    if (!user) {
      throw new Error('Foydalanuvchi topilmadi');
    }

    const newMessage = new this.messageModel({
      sender: user._id, // Senderni foydalanuvchiga bog'laymiz
      content,
    });

    await newMessage.save();

    return this.messageModel
      .findById(newMessage._id)
      .populate('sender', 'email fullName')
      .exec(); // Xabarni saqlagandan keyin foydalanuvchini to'liq ma'lumotlari bilan qaytaramiz
  }

  // Barcha xabarlarni olish
  async getMessages(): Promise<Message[]> {
    return this.messageModel
      .find()
      .populate('sender', 'email fullName') // Xabarlar bilan bog'liq foydalanuvchilarni olish
      .exec();
  }
}

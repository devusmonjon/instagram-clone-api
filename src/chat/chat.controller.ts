import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Foydalanuvchi xabar yuboradi
  @Post('message')
  @Auth()
  async sendMessage(
    @Body('senderUsername') senderUsername: string, // yuboruvchi username
    @Body('receiverUsername') receiverUsername: string, // qabul qiluvchi username
    @Body('message') content: string,
  ) {
    const newMessage = await this.chatService.saveMessage(
      senderUsername,
      receiverUsername,
      content,
    );
    return { success: true, message: newMessage };
  }

  // Barcha xabarlarni olish
  @Get('messages/:username')
  @Auth()
  async getAllMessages(@Param('username') username: string) {
    const messages = await this.chatService.getMessages(username);
    return { success: true, messages };
  }
}

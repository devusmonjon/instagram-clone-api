import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Foydalanuvchi xabar yuboradi
  @Post('message')
  async sendMessage(
    @Body('email') email: string,
    @Body('message') content: string,
  ) {
    const newMessage = await this.chatService.saveMessage(email, content);
    return { success: true, message: newMessage };
  }

  // Barcha xabarlarni olish
  @Get('messages')
  async getAllMessages() {
    const messages = await this.chatService.getMessages();
    return { success: true, messages };
  }
}

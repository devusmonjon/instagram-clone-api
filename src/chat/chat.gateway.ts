import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, username: string) {
    client.join(username); // Foydalanuvchini o‘z xonasiga qo‘shish
    console.log(`${username} xonasiga qo‘shildi.`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody('senderUsername') senderUsername: string,
    @MessageBody('receiverUsername') receiverUsername: string,
    @MessageBody('message') message: string,
  ) {
    const newMessage = await this.chatService.saveMessage(
      senderUsername,
      receiverUsername,
      message,
    );

    // Faqat maqsadli foydalanuvchiga xabar yuborish
    this.server.to(receiverUsername).emit('receiveMessage', newMessage);
    console.log(
      `Xabar yuborildi: ${message} - Yuboruvchi: ${senderUsername} - Qabul qiluvchi: ${receiverUsername}`,
    );
  }
}

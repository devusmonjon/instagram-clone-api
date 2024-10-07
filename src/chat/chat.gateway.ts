import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody('senderUsername') senderUsername: string, // yuboruvchi username
    @MessageBody('receiverUsername') receiverUsername: string, // qabul qiluvchi username
    @MessageBody('message') message: string,
  ) {
    const newMessage = await this.chatService.saveMessage(
      senderUsername,
      receiverUsername,
      message,
    );
    this.server.emit('receiveMessage', newMessage);
  }
}

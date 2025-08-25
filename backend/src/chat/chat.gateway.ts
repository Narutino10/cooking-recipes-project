import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  afterInit(/* server: Server */) {
    this.logger.log('Chat gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    client: Socket,
    payload: { user?: string; text: string; room?: string },
  ) {
    const out = {
      user: payload.user ?? 'anonymous',
      text: payload.text,
      at: new Date().toISOString(),
    };
    if (payload.room) {
      this.server.to(payload.room).emit('message', out);
    } else {
      this.server.emit('message', out);
    }
    return out;
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { room: string }) {
    void client.join(payload.room);
    client.emit('joined', { room: payload.room });
    this.server.to(payload.room).emit('system', {
      text: `${client.id} rejoint la salle ${payload.room}`,
    });
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, payload: { room: string }) {
    void client.leave(payload.room);
    client.emit('left', { room: payload.room });
    this.server.to(payload.room).emit('system', {
      text: `${client.id} a quitté la salle ${payload.room}`,
    });
  }
}

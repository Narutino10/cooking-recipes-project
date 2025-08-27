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
    payload: { user?: string; text: string; room?: string; to?: string },
  ) {
    const out = {
      user: payload.user ?? 'anonymous',
      text: payload.text,
      at: new Date().toISOString(),
      from: client.id,
    };

    if (payload.to) {
      // Private message: create a room name from sender and receiver IDs
      const roomName = [client.id, payload.to].sort().join('-');
      this.server.to(roomName).emit('message', out);
      // Also send to sender for their own view
      client.emit('message', out);
    } else if (payload.room) {
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

  @SubscribeMessage('join-private')
  handleJoinPrivate(client: Socket, payload: { with: string }) {
    const roomName = [client.id, payload.with].sort().join('-');
    void client.join(roomName);
    client.emit('joined-private', { room: roomName, with: payload.with });
  }

  @SubscribeMessage('seen')
  handleSeen(client: Socket, payload: { room: string }) {
    // broadcast seen to the room (so clients can mark messages as seen)
    if (payload?.room) {
      this.server
        .to(payload.room)
        .emit('seen', { by: client.id, at: new Date().toISOString() });
    } else {
      this.server.emit('seen', { by: client.id, at: new Date().toISOString() });
    }
  }
}

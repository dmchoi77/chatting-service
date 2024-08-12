import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('🚀 ~ ChatGateway ~ afterInit ~ server:', server);
  }

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket, ...args: any[]) {
    console.log('🚀 ~ ChatGateway ~ handleConnection ~ args:', args);
    try {
      const token = client.handshake.query.token;
      const payload = this.jwtService.verify(token as string);
      client.data.user = payload;
    } catch (e) {
      client.disconnect();
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): void {
    this.server.emit('message', {
      user: client.data.user.username,
      message: payload,
    });
  }
}

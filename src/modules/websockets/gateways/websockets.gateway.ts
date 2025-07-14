// src/websockets/websockets.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  email: string;
  name: string;
}

@Injectable()
@WebSocketGateway({ cors: true })
export class WebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private users = new Map<string, { email: string; name: string }>(); // socketId -> user info

  handleConnection(client: Socket) {
    const SECRET = process.env.TOKEN_SECRET;

    const token = client.handshake.auth?.token || client.handshake.query?.token;

    if (!token) {
      console.log('Token missing for client:', client.id);
      client.disconnect();
      throw new UnauthorizedException('Token missing');
    }
    console.log('token generated');

    try {
      const decoded = jwt.verify(token, SECRET) as JwtPayload;

      this.users.set(client.id, { email: decoded.email, name: decoded.name });
      this.broadcastUserList();
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.users.delete(client.id);
    this.broadcastUserList();
  }

  broadcastUserList() {
    const activeUsers = Array.from(this.users.values());
    console.log('Active users:', activeUsers.length);
    this.server.emit('users', activeUsers); // [{ email, name }]
  }

  @SubscribeMessage('message')
  handleMessage(
    client: Socket,
    payload: { to: string; from: string; message: string },
  ) {
    const timestamp = new Date().toISOString();

    // ✅ Sort emails for consistent file naming
    const [emailA, emailB] = [payload.from, payload.to].sort();
    const filename = `${emailA}_${emailB}.json`;

    const chatsDir = path.join(process.cwd(), 'src', 'chats');
    if (!fs.existsSync(chatsDir)) {
      fs.mkdirSync(chatsDir, { recursive: true });
    }

    const filePath = path.join(chatsDir, filename);
    const chatMessage = {
      from: payload.from,
      to: payload.to,
      message: payload.message,
      timestamp,
    };

    let history = [];
    if (fs.existsSync(filePath)) {
      history = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    history.push(chatMessage);
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));

    // Emit to recipient
    for (const [socketId, user] of this.users) {
      if (user.email === payload.to) {
        this.server.to(socketId).emit('message', chatMessage);
        break;
      }
    }

    // Emit to sender
    client.emit('message', chatMessage);
  }
}

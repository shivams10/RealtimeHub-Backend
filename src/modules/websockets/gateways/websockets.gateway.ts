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

const USERS_FILE = path.join(process.cwd(), 'src', 'chats', 'users.json');

@Injectable()
@WebSocketGateway({ cors: true })
export class WebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private users = new Map<string, { email: string; name: string }>(); // socketId -> user info

  // Load all persisted users
  private loadAllUsers(): JwtPayload[] {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
    return [];
  }

  // Save user if they haven't been seen before
  private saveUserIfNotExists(newUser: JwtPayload): void {
    const users = this.loadAllUsers();
    const exists = users.find((u) => u.email === newUser.email);
    if (!exists) {
      users.push(newUser);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }
  }

  handleConnection(client: Socket) {
    const SECRET = process.env.TOKEN_SECRET;

    const token = client.handshake.auth?.token || client.handshake.query?.token;

    if (!token) {
      console.log('Token missing for client:', client.id);
      client.disconnect();
      throw new UnauthorizedException('Token missing');
    }

    try {
      const decoded = jwt.verify(token, SECRET) as JwtPayload;

      this.users.set(client.id, { email: decoded.email, name: decoded.name });
      this.saveUserIfNotExists(decoded);
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
    const activeEmails = Array.from(this.users.values()).map((u) => u.email);
    const allUsers = this.loadAllUsers();

    const statusList = allUsers.map((user) => ({
      ...user,
      online: activeEmails.includes(user.email),
    }));

    this.server.emit('users', statusList); // emit to all connected clients
  }

  @SubscribeMessage('message')
  handleMessage(
    client: Socket,
    payload: { to: string; from: string; message: string },
  ) {
    const timestamp = new Date().toISOString();

    // Sort emails alphabetically to keep consistent filenames
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

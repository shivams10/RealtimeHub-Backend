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

// Path to store user and chat data
const USERS_FILE = path.join(process.cwd(), 'src', 'chats', 'users.json');

@Injectable()
@WebSocketGateway({
  cors: true,
  pingInterval: 30000,
  pingTimeout: 60000,
})
export class WebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  // In-memory store for active users keyed by socket ID
  private users = new Map<string, { email: string; name: string }>();

  /**
   * Load all persisted users from users.json file
   */
  private loadAllUsers(): JwtPayload[] {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
    return [];
  }

  /**
   * Save a new user to users.json if not already present
   */
  private saveUserIfNotExists(newUser: JwtPayload): void {
    const users = this.loadAllUsers();
    const exists = users.find((u) => u.email === newUser.email);
    if (!exists) {
      users.push(newUser);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }
  }

  /**
   * Called when a client connects
   */
  handleConnection(client: Socket) {
    const SECRET = process.env.TOKEN_SECRET;
    const token = client.handshake.auth?.token || client.handshake.query?.token;

    // Reject connection if token is missing
    if (!token) {
      console.log('[❌] No token provided. Disconnecting:', client.id);
      client.disconnect();
      return;
    }

    try {
      // Decode and verify JWT token
      const decoded = jwt.verify(token, SECRET) as JwtPayload;
      console.log('[✅] Authenticated user:', decoded.email);

      // Save active user in memory
      this.users.set(client.id, { email: decoded.email, name: decoded.name });

      // Save user to file if not already present
      this.saveUserIfNotExists(decoded);

      // Notify all clients about updated user list
      this.broadcastUserList();
    } catch (err) {
      console.log('[❌] Invalid token. Disconnecting:', client.id, err.message);
      client.disconnect();
    }
  }

  /**
   * Called when a client disconnects
   */
  handleDisconnect(client: Socket) {
    this.users.delete(client.id);
    this.broadcastUserList();
  }

  /**
   * Broadcast current user list with online status to all clients
   */
  broadcastUserList() {
    const activeEmails = Array.from(this.users.values()).map((u) => u.email);
    const allUsers = this.loadAllUsers();

    const statusList = allUsers.map((user) => ({
      ...user,
      online: activeEmails.includes(user.email),
    }));

    this.server.emit('users', statusList); // emit to all connected clients
  }

  /**
   * Handles incoming messages from a client
   */
  @SubscribeMessage('message')
  handleMessage(
    client: Socket,
    payload: { to: string; from: string; message: string },
  ) {
    const timestamp = new Date().toISOString();

    // Sort emails alphabetically for consistent filename
    const [emailA, emailB] = [payload.from, payload.to].sort();
    const filename = `${emailA}_${emailB}.json`;

    const chatsDir = path.join(process.cwd(), 'src', 'chats');
    if (!fs.existsSync(chatsDir)) {
      fs.mkdirSync(chatsDir, { recursive: true });
    }

    const filePath = path.join(chatsDir, filename);

    // Chat message structure
    const chatMessage = {
      from: payload.from,
      to: payload.to,
      message: payload.message,
      timestamp,
    };

    // Load previous chat history (if exists)
    let history = [];
    if (fs.existsSync(filePath)) {
      history = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // Add new message to history and persist to file
    history.push(chatMessage);
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));

    // Emit message to recipient if they are online
    for (const [socketId, user] of this.users) {
      if (user.email === payload.to) {
        this.server.to(socketId).emit('message', chatMessage);
        break;
      }
    }

    // Also emit message back to sender for confirmation
    client.emit('message', chatMessage);
  }
}

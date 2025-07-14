import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from './jwt.auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  @Get('history')
  getChatHistory(@Query('user1') user1: string, @Query('user2') user2: string) {
    const [emailA, emailB] = [user1, user2].sort(); // Normalize order
    const chatsDir = path.join(process.cwd(), 'src', 'chats');
    const filePath = path.join(chatsDir, `${emailA}_${emailB}.json`);
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } else {
        console.log('Not found:', filePath);
        return [];
      }
    } catch (error) {
      console.error('Failed to read chat history:', error);
      return [];
    }
  }
}

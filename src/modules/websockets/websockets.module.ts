import { Module } from '@nestjs/common';
import { WebsocketsController } from '@modules/websockets/controllers/websockets.controller';
import { WebsocketsService } from '@modules/websockets/services/websockets.service';
import { WebsocketsGateway } from '@modules/websockets/gateways/websockets.gateway';
import { ChatController } from './controllers/chat.controller';
import { AuthController } from './controllers/login.controller';

@Module({
  controllers: [WebsocketsController, ChatController, AuthController],
  providers: [WebsocketsService, WebsocketsGateway],
  exports: [WebsocketsService, WebsocketsGateway],
})
export class WebsocketsModule {}

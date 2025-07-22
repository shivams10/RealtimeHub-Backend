import { Module } from '@nestjs/common';
import { WebsocketsGateway } from '@modules/websockets/gateways/websockets.gateway';
import { ChatController } from './controllers/chat.controller';
import { AuthController } from './controllers/login.controller';

@Module({
  controllers: [ChatController, AuthController],
  providers: [WebsocketsGateway],
  exports: [WebsocketsGateway],
})
export class WebsocketsModule {}

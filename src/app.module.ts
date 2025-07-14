import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiPollingModule } from '@modules/api-polling/api-polling.module';
import { SseModule } from '@modules/sse/sse.module';
import { WebsocketsModule } from '@modules/websockets/websockets.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ApiPollingModule,
    SseModule,
    WebsocketsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

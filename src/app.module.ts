import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiPollingModule } from '@modules/api-polling/api-polling.module';
import { SseModule } from '@modules/sse/sse.module';
import { WebsocketsModule } from '@modules/websockets/websockets.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      //forRoot() is the configuration method that sets up the module with specific options.
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ApiPollingModule,
    SseModule,
    WebsocketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

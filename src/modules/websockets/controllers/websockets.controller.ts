import { Controller, Get } from '@nestjs/common';
import { WebsocketsService } from '@modules/websockets/services/websockets.service';

@Controller('websockets')
export class WebsocketsController {
  constructor(private readonly websocketsService: WebsocketsService) {}

  @Get('sample')
  sampleApi() {
    console.log('in sample');
    return { message: 'V1- This is a sample WebSockets API endpoint.' };
  }
}

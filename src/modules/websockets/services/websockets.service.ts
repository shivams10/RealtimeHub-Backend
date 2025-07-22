import { Injectable } from '@nestjs/common';
import { WebsocketsGateway } from '@modules/websockets/gateways/websockets.gateway';
@Injectable()
export class WebsocketsService {
  constructor(private readonly websocketsGateway: WebsocketsGateway) {}

  // TODO: Add your WebSocket logic here
}

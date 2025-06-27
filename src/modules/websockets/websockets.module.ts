import { Module } from '@nestjs/common';
import { WebsocketsController } from '@modules/websockets/controllers/websockets.controller';
import { WebsocketsService } from '@modules/websockets/services/websockets.service';
import { WebsocketsGateway } from '@modules/websockets/gateways/websockets.gateway';

/**
 * WebSocket Module
 *
 * This module handles WebSocket connections for real-time bidirectional
 * communication between server and clients.
 *
 * Features to implement:
 * - Establish WebSocket connections with clients
 * - Handle bidirectional message exchange
 * - Manage rooms and channels for group communication
 * - Implement authentication and authorization
 * - Handle connection lifecycle events
 * - Provide real-time status and monitoring
 *
 * Use cases:
 * - Real-time chat applications
 * - Live collaboration tools
 * - Gaming applications
 * - Live streaming with chat
 * - Real-time dashboards
 * - Multi-user applications
 */
@Module({
  controllers: [WebsocketsController],
  providers: [WebsocketsService, WebsocketsGateway],
  exports: [WebsocketsService, WebsocketsGateway],
})
export class WebsocketsModule {}

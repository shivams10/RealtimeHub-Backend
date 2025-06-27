import { Module } from '@nestjs/common';
import { SseController } from '@modules/sse/controllers/sse.controller';
import { SseService } from '@modules/sse/services/sse.service';

/**
 * Server-Sent Events (SSE) Module
 *
 * This module handles Server-Sent Events for real-time one-way communication
 * from server to clients.
 *
 * Features to implement:
 * - Establish SSE connections with clients
 * - Broadcast messages to all connected clients
 * - Send targeted messages to specific clients
 * - Handle client connection/disconnection
 * - Manage connection timeouts and reconnections
 * - Provide connection status and statistics
 *
 * Use cases:
 * - Real-time notifications
 * - Live data streaming
 * - Progress updates
 * - Event broadcasting
 * - Live dashboards
 * - Chat applications (one-way)
 */
@Module({
  controllers: [SseController],
  providers: [SseService],
  exports: [SseService],
})
export class SseModule {}

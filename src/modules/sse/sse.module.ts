import { Module } from '@nestjs/common';
import { SseController } from '@modules/sse/controllers/sse.controller';
import { SseService } from '@modules/sse/services/sse.service';

/**
 * Server-Sent Events (SSE) Module - POC Version
 *
 * This module handles Server-Sent Events for real-time one-way communication
 * from server to clients with a simplified implementation for POC purposes.
 *
 * Features implemented:
 * - Establish SSE connections with clients
 * - Subscribe/unsubscribe to specific stock symbols
 * - Handle client connection/disconnection
 * - Manage connection timeouts and reconnections
 * - Simple test data generation
 *
 * Use cases:
 * - Real-time data streaming POC
 * - Subscription management demonstration
 * - Connection handling demonstration
 */
@Module({
  controllers: [SseController],
  providers: [SseService],
  exports: [SseService],
})
export class SseModule {}

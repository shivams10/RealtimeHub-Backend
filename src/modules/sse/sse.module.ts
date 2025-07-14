import { Module } from '@nestjs/common';
import { SseController } from '@modules/sse/controllers/sse.controller';
import { SseService } from '@modules/sse/services/sse.service';
import { StockMarketService } from '@modules/sse/services/stock-market.service';

/**
 * Server-Sent Events (SSE) Module
 *
 * This module handles Server-Sent Events for real-time one-way communication
 * from server to clients with a stock market example implementation.
 *
 * Features implemented:
 * - Establish SSE connections with clients
 * - Broadcast real-time stock market updates
 * - Subscribe/unsubscribe to specific stock symbols
 * - Handle client connection/disconnection
 * - Manage connection timeouts and reconnections
 * - Provide connection status and statistics
 * - Simulate realistic stock price movements
 *
 * Use cases:
 * - Real-time stock price updates
 * - Live market data streaming
 * - Portfolio tracking
 * - Market event broadcasting
 * - Live trading dashboards
 * - Financial data visualization
 */
@Module({
  controllers: [SseController],
  providers: [SseService, StockMarketService],
  exports: [SseService, StockMarketService],
})
export class SseModule {}

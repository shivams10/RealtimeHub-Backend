import { Module } from '@nestjs/common';
import { ApiPollingController } from '@modules/api-polling/controllers/api-polling.controller';
import { ApiPollingService } from '@modules/api-polling/services/api-polling.service';

/**
 * API Polling Module
 *
 * This module handles HTTP polling functionality for real-time data updates.
 *
 * Features to implement:
 * - Start/stop polling to external APIs
 * - Configure polling intervals
 * - Handle polling errors and retries
 * - Store and retrieve polled data
 * - Manage multiple polling jobs
 * - Provide polling status and statistics
 *
 * Use cases:
 * - Monitoring external services
 * - Fetching periodic data updates
 * - Health checks and status monitoring
 * - Data synchronization with external APIs
 */
@Module({
  controllers: [ApiPollingController],
  providers: [ApiPollingService],
  exports: [ApiPollingService],
})
export class ApiPollingModule {}

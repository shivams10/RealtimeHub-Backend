import { Controller } from '@nestjs/common';
import { ApiPollingService } from '@modules/api-polling/services/api-polling.service';

/**
 * API Polling Controller
 *
 * Handles HTTP endpoints for managing API polling operations.
 *
 * Endpoints to implement:
 *
 * GET /api-polling/status
 * - Return current polling status
 * - List active polling jobs
 * - Show polling statistics
 *
 * POST /api-polling/start
 * - Start a new polling job
 * - Accept configuration (URL, interval, headers, etc.)
 * - Return job ID and status
 *
 * POST /api-polling/stop
 * - Stop a specific polling job by ID
 * - Stop all polling jobs
 * - Return confirmation
 *
 * GET /api-polling/data
 * - Get latest polled data
 * - Get historical data with pagination
 * - Filter data by date range
 *
 * PUT /api-polling/config
 * - Update polling configuration
 * - Modify intervals, retry logic, etc.
 *
 * DELETE /api-polling/jobs/:id
 * - Delete a specific polling job
 * - Clean up associated data
 */
@Controller('api-polling')
export class ApiPollingController {
  constructor(private readonly apiPollingService: ApiPollingService) {}
}

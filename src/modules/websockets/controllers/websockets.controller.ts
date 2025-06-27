import { Controller } from '@nestjs/common';
import { WebsocketsService } from '@modules/websockets/services/websockets.service';

/**
 * WebSocket Controller
 *
 * Handles HTTP endpoints for WebSocket operations and management.
 *
 * Endpoints to implement:
 *
 * GET /websockets/status
 * - Get WebSocket connection statistics
 * - Return connected clients count
 * - Show rooms and channels information
 *
 * POST /websockets/broadcast
 * - Broadcast message to all connected clients
 * - Accept message payload and optional filters
 * - Return broadcast confirmation
 *
 * POST /websockets/send-to-room
 * - Send message to specific room/channel
 * - Accept room name and message payload
 * - Return delivery confirmation
 *
 * POST /websockets/send/:clientId
 * - Send message to specific client
 * - Target individual client by ID
 * - Return delivery confirmation
 *
 * GET /websockets/rooms
 * - List all active rooms/channels
 * - Return room information and member count
 *
 * POST /websockets/rooms/:roomName/join
 * - Join a specific room (for server-side operations)
 * - Add server to room for broadcasting
 *
 * DELETE /websockets/rooms/:roomName/leave
 * - Leave a specific room
 * - Remove server from room
 *
 * GET /websockets/clients
 * - List all connected clients
 * - Return client information and room memberships
 */
@Controller('websockets')
export class WebsocketsController {
  constructor(private readonly websocketsService: WebsocketsService) {}
}

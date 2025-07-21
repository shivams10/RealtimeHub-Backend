import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { SseService } from '@modules/sse/services/sse.service';
import {
  SubscribeToStocksDto,
  UnsubscribeFromStocksDto,
} from '@modules/sse/dto/stock-market.dto';

// Marks the class as a decorator that handles HTTP requests and responses and sets base route as ssw
@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  /**
   * Establish SSE connection for stock market updates
   */
  @Get('stream/:clientId')
  async streamStockUpdates(
    // Param decorator is used to extract the clientId from the URL
    @Param('clientId') clientId: string,
    //injects the Express response object
    @Res() res: Response,
  ): Promise<void> {
    // Set SSE headers
    res.writeHead(HttpStatus.OK, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection message
    res.write(
      `data: ${JSON.stringify({
        type: 'connection_established',
        clientId,
        timestamp: new Date(),
      })}\n\n`,
    );

    // Get the SSE stream
    const stream = this.sseService.establishConnection(clientId);

    // Subscribe to the stream and send data to client
    const subscription = stream.subscribe({
      next: (data) => {
        res.write(data);
      },
      error: (error) => {
        console.log('🚀 ~ SseController ~ error:', error);
        this.sseService.disconnectClient(clientId);
        res.end();
      },
      complete: () => {
        this.sseService.disconnectClient(clientId);
        res.end();
      },
    });

    // Handle client disconnect
    res.on('close', () => {
      subscription.unsubscribe();
      this.sseService.disconnectClient(clientId);
    });
  }

  /**
   * Subscribe to specific stock symbols
   */
  @Post('subscribe/:clientId')
  @HttpCode(HttpStatus.OK)
  subscribeToStocks(
    @Param('clientId') clientId: string,
    @Body() subscribeDto: SubscribeToStocksDto,
  ): { success: boolean; message: string } {
    const success = this.sseService.subscribeToStocks(
      clientId,
      subscribeDto.symbols,
    );

    return {
      success,
      message: success
        ? `Successfully subscribed to ${subscribeDto.symbols.join(', ')}`
        : 'Client not found or connection inactive',
    };
  }

  /**
   * Unsubscribe from specific stock symbols
   */
  @Post('unsubscribe/:clientId')
  @HttpCode(HttpStatus.OK)
  unsubscribeFromStocks(
    @Param('clientId') clientId: string,
    @Body() unsubscribeDto: UnsubscribeFromStocksDto,
  ): { success: boolean; message: string } {
    const success = this.sseService.unsubscribeFromStocks(
      clientId,
      unsubscribeDto.symbols,
    );

    return {
      success,
      message: success
        ? `Successfully unsubscribed from ${unsubscribeDto.symbols.join(', ')}`
        : 'Client not found or connection inactive',
    };
  }
}

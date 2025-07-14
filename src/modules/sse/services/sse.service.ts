import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import {
  ClientConnection,
  ConnectionStats,
  StockPrice,
  StockUpdate,
} from '@modules/sse/interfaces/stock-market.interface';
import { StockMarketService } from './stock-market.service';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private readonly clients: Map<string, ClientConnection> = new Map();
  private readonly messageSubject = new Subject<StockUpdate>();
  private readonly startTime = Date.now();
  private totalMessagesSent = 0;

  constructor(private readonly stockMarketService: StockMarketService) {
    this.startStockUpdates();
  }

  /**
   * Establish SSE connection for a client
   */
  public establishConnection(clientId: string): Observable<string> {
    this.registerClient(clientId);

    return this.messageSubject.pipe(
      map((update) => this.formatSSEMessage(update)),
      takeWhile(
        () =>
          this.clients.has(clientId) && this.clients.get(clientId)!.isActive,
      ),
    );
  }

  /**
   * Register a new client connection
   */
  public registerClient(clientId: string): void {
    const client: ClientConnection = {
      id: clientId,
      connectedAt: new Date(),
      lastActivity: new Date(),
      subscriptions: [],
      isActive: true,
    };

    this.clients.set(clientId, client);
    this.logger.log(`Client ${clientId} connected`);
  }

  /**
   * Disconnect a client
   */
  public disconnectClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.isActive = false;
      this.clients.delete(clientId);
      this.logger.log(`Client ${clientId} disconnected`);
    }
  }

  /**
   * Subscribe client to specific stock symbols
   */
  public subscribeToStocks(clientId: string, symbols: string[]): boolean {
    const client = this.clients.get(clientId);
    if (!client) {
      return false;
    }

    // Add new subscriptions
    symbols.forEach((symbol) => {
      if (!client.subscriptions.includes(symbol)) {
        client.subscriptions.push(symbol);
      }
    });

    client.lastActivity = new Date();
    this.logger.log(`Client ${clientId} subscribed to: ${symbols.join(', ')}`);
    return true;
  }

  /**
   * Unsubscribe client from specific stock symbols
   */
  public unsubscribeFromStocks(clientId: string, symbols: string[]): boolean {
    const client = this.clients.get(clientId);
    if (!client) {
      return false;
    }

    symbols.forEach((symbol) => {
      const index = client.subscriptions.indexOf(symbol);
      if (index > -1) {
        client.subscriptions.splice(index, 1);
      }
    });

    client.lastActivity = new Date();
    this.logger.log(
      `Client ${clientId} unsubscribed from: ${symbols.join(', ')}`,
    );
    return true;
  }

  /**
   * Get all connected clients
   */
  public getConnectedClients(): ClientConnection[] {
    return Array.from(this.clients.values()).filter(
      (client) => client.isActive,
    );
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats(): ConnectionStats {
    const activeConnections = this.getConnectedClients().length;
    const uptime = Date.now() - this.startTime;

    return {
      totalConnections: this.clients.size,
      activeConnections,
      totalMessagesSent: this.totalMessagesSent,
      averageLatency: 0, // Could be calculated if needed
      uptime,
    };
  }

  /**
   * Get available stock symbols
   */
  public getAvailableStocks(): string[] {
    return this.stockMarketService.getStockSymbols();
  }

  /**
   * Get current stock data for specific symbols
   */
  public getCurrentStockData(symbols?: string[]): StockPrice[] {
    return this.stockMarketService.getCurrentStockData(symbols);
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcastMessage(update: StockUpdate): void {
    this.messageSubject.next(update);
    this.totalMessagesSent++;
  }

  /**
   * Format data as SSE message
   */
  private formatSSEMessage(update: StockUpdate): string {
    const data = JSON.stringify(update);
    return `data: ${data}\n\n`;
  }

  /**
   * Start periodic stock updates
   */
  private startStockUpdates(): void {
    // Send stock updates every 2 seconds
    interval(2000).subscribe(() => {
      const update = this.stockMarketService.generateStockUpdate();
      this.broadcastMessage(update);
    });

    // Send market open update every 30 seconds (simulating market events)
    interval(30000).subscribe(() => {
      const update = this.stockMarketService.generateMarketOpenUpdate();
      this.broadcastMessage(update);
    });

    this.logger.log('Stock market updates started');
  }

  /**
   * Clean up inactive clients
   */
  public cleanupInactiveClients(): void {
    const now = new Date();
    const inactiveTimeout = 5 * 60 * 1000; // 5 minutes

    for (const [clientId, client] of this.clients.entries()) {
      if (now.getTime() - client.lastActivity.getTime() > inactiveTimeout) {
        this.disconnectClient(clientId);
      }
    }
  }
}

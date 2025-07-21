// Handles SSE business logic
import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import {
  ClientConnection,
  StockPrice,
  StockUpdate,
} from '@modules/sse/interfaces/stock-market.interface';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private readonly clients: Map<string, ClientConnection> = new Map();
  private readonly clientSubjects: Map<string, Subject<StockUpdate>> =
    new Map();
  private readonly startTime = Date.now();
  private totalMessagesSent = 0;

  constructor() {
    this.startStockUpdates();
  }

  /**
   * Establish SSE connection for a client
   */
  public establishConnection(clientId: string): Observable<string> {
    this.registerClient(clientId);

    return this.clientSubjects.get(clientId)!.pipe(
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

    // Create individual subject for this client
    const clientSubject = new Subject<StockUpdate>();
    this.clientSubjects.set(clientId, clientSubject);

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

      // Clean up client subject
      const clientSubject = this.clientSubjects.get(clientId);
      if (clientSubject) {
        clientSubject.complete();
        this.clientSubjects.delete(clientId);
      }

      this.logger.log(`Client ${clientId} disconnected`);
    }
  }

  /**
   * Subscribe client to specific stock symbols
   */
  public subscribeToStocks(clientId: string, symbols: string[]): boolean {
    const client = this.clients.get(clientId);
    if (!client) {
      this.logger.debug(`Client ${clientId} not found for subscription`);
      return false;
    }

    this.logger.debug(
      `Client ${clientId}: Before subscription - [${client.subscriptions.join(
        ', ',
      )}]`,
    );

    // Add new subscriptions
    symbols.forEach((symbol) => {
      if (!client.subscriptions.includes(symbol)) {
        client.subscriptions.push(symbol);
      }
    });

    client.lastActivity = new Date();
    this.logger.log(`Client ${clientId} subscribed to: ${symbols.join(', ')}`);
    this.logger.debug(
      `Client ${clientId}: After subscription - [${client.subscriptions.join(
        ', ',
      )}]`,
    );
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
   * Broadcast message to all connected clients based on their subscriptions
   */
  private broadcastMessage(update: StockUpdate): void {
    this.clients.forEach((client, clientId) => {
      if (client.isActive && this.shouldSendToClient()) {
        const clientSubject = this.clientSubjects.get(clientId);
        if (clientSubject) {
          // Filter the update data for this specific client
          const filteredUpdate = this.filterUpdateForClient(client, update);
          clientSubject.next(filteredUpdate);
          this.totalMessagesSent++;
        }
      }
    });
  }

  /**
   * Filter update data for a specific client based on their subscriptions
   */
  private filterUpdateForClient(
    client: ClientConnection,
    update: StockUpdate,
  ): StockUpdate {
    // If client has no subscriptions, send all data
    if (client.subscriptions.length === 0) {
      return update;
    }

    // For price updates, filter the stock data
    if (update.type === 'price_update') {
      const stockData = Array.isArray(update.data)
        ? update.data
        : [update.data];
      const filteredStocks = stockData.filter((stock: StockPrice) =>
        client.subscriptions.includes(stock.symbol),
      );

      return {
        ...update,
        data: filteredStocks,
      };
    }

    // For market events, send all data
    return update;
  }

  /**
   * Check if update should be sent to specific client based on their subscriptions
   */
  private shouldSendToClient(): boolean {
    // Always send updates to active clients
    // The filtering is now handled in filterUpdateForClient method
    return true;
  }

  /**
   * Format data as SSE message
   */
  private formatSSEMessage(update: StockUpdate): string {
    const data = JSON.stringify(update);
    return `data: ${data}\n\n`;
  }

  /**
   * Start periodic stock updates (simplified for POC)
   */
  private startStockUpdates(): void {
    // Send simple test updates every 2 seconds
    interval(2000).subscribe(() => {
      const update: StockUpdate = {
        type: 'price_update',
        data: [
          {
            symbol: 'AAPL',
            price: 150 + Math.random() * 10,
            change: Math.random() * 2 - 1,
            changePercent: Math.random() * 2 - 1,
            volume: 1000000,
            high: 160,
            low: 140,
            open: 150,
            previousClose: 150,
            timestamp: new Date(),
          },
          {
            symbol: 'GOOGL',
            price: 2800 + Math.random() * 100,
            change: Math.random() * 20 - 10,
            changePercent: Math.random() * 2 - 1,
            volume: 500000,
            high: 2900,
            low: 2700,
            open: 2800,
            previousClose: 2800,
            timestamp: new Date(),
          },
          {
            symbol: 'MSFT',
            price: 350 + Math.random() * 15,
            change: Math.random() * 3 - 1.5,
            changePercent: Math.random() * 2 - 1,
            volume: 800000,
            high: 365,
            low: 335,
            open: 350,
            previousClose: 350,
            timestamp: new Date(),
          },
        ],
        timestamp: new Date(),
      };
      this.broadcastMessage(update);
    });

    this.logger.log('SSE updates started');
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

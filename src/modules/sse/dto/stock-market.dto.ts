export class SubscribeToStocksDto {
  symbols: string[];
}

export class UnsubscribeFromStocksDto {
  symbols: string[];
}

export class StockMarketStatsDto {
  totalConnections: number;
  activeConnections: number;
  totalMessagesSent: number;
  averageLatency: number;
  uptime: number;
  subscribedStocks: string[];
}

export enum StockUpdateType {
  PRICE_UPDATE = 'price_update',
  VOLUME_UPDATE = 'volume_update',
  MARKET_OPEN = 'market_open',
  MARKET_CLOSE = 'market_close',
} 
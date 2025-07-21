export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: Date;
}

export interface StockUpdate {
  type: 'price_update' | 'volume_update' | 'market_open' | 'market_close';
  data: StockPrice | StockPrice[];
  timestamp: Date;
}

export interface ClientConnection {
  id: string;
  connectedAt: Date;
  lastActivity: Date;
  subscriptions: string[]; // Stock symbols the client is subscribed to
  isActive: boolean;
}

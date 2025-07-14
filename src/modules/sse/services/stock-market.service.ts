import { Injectable, Logger } from '@nestjs/common';
import {
  StockPrice,
  StockUpdate,
} from '@modules/sse/interfaces/stock-market.interface';

@Injectable()
export class StockMarketService {
  private readonly logger = new Logger(StockMarketService.name);
  private readonly stockSymbols = [
    'AAPL',
    'GOOGL',
    'MSFT',
    'AMZN',
    'TSLA',
    'META',
    'NVDA',
    'NFLX',
    'AMD',
    'INTC',
    'CRM',
    'ORCL',
    'ADBE',
    'PYPL',
    'UBER',
    'LYFT',
  ];

  private stockData: Map<string, StockPrice> = new Map();

  constructor() {
    this.initializeStockData();
  }

  private initializeStockData(): void {
    this.stockSymbols.forEach((symbol) => {
      const basePrice = this.generateBasePrice(symbol);
      this.stockData.set(symbol, {
        symbol,
        price: basePrice,
        change: 0,
        changePercent: 0,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        high: basePrice * 1.05,
        low: basePrice * 0.95,
        open: basePrice,
        previousClose: basePrice,
        timestamp: new Date(),
      });
    });
  }

  private generateBasePrice(symbol: string): number {
    // Generate realistic base prices based on symbol
    const basePrices: { [key: string]: number } = {
      AAPL: 150,
      GOOGL: 2800,
      MSFT: 300,
      AMZN: 3300,
      TSLA: 800,
      META: 350,
      NVDA: 500,
      NFLX: 600,
      AMD: 100,
      INTC: 50,
      CRM: 200,
      ORCL: 80,
      ADBE: 500,
      PYPL: 250,
      UBER: 40,
      LYFT: 30,
    };
    return basePrices[symbol] || 100;
  }

  public getStockSymbols(): string[] {
    return [...this.stockSymbols];
  }

  public getCurrentStockData(symbols?: string[]): StockPrice[] {
    const targetSymbols = symbols || this.stockSymbols;
    return targetSymbols
      .filter((symbol) => this.stockData.has(symbol))
      .map((symbol) => this.stockData.get(symbol)!);
  }

  public generateStockUpdate(symbols?: string[]): StockUpdate {
    const targetSymbols = symbols || this.stockSymbols;
    const updatedStocks: StockPrice[] = [];

    targetSymbols.forEach((symbol) => {
      const currentStock = this.stockData.get(symbol);
      if (currentStock) {
        const updatedStock = this.simulatePriceMovement(currentStock);
        this.stockData.set(symbol, updatedStock);
        updatedStocks.push(updatedStock);
      }
    });

    return {
      type: 'price_update',
      data: updatedStocks,
      timestamp: new Date(),
    };
  }

  private simulatePriceMovement(stock: StockPrice): StockPrice {
    // Simulate realistic price movements
    const volatility = 0.02; // 2% volatility
    const randomChange = (Math.random() - 0.5) * volatility;
    const newPrice = stock.price * (1 + randomChange);

    const change = newPrice - stock.previousClose;
    const changePercent = (change / stock.previousClose) * 100;

    // Update volume with some randomness
    const volumeChange = Math.floor((Math.random() - 0.5) * 100000);
    const newVolume = Math.max(100000, stock.volume + volumeChange);

    return {
      ...stock,
      price: Math.round(newPrice * 100) / 100, // Round to 2 decimal places
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: newVolume,
      high: Math.max(stock.high, newPrice),
      low: Math.min(stock.low, newPrice),
      timestamp: new Date(),
    };
  }

  public generateMarketOpenUpdate(): StockUpdate {
    this.stockSymbols.forEach((symbol) => {
      const stock = this.stockData.get(symbol);
      if (stock) {
        const openPrice =
          stock.previousClose * (1 + (Math.random() - 0.5) * 0.01);
        this.stockData.set(symbol, {
          ...stock,
          price: Math.round(openPrice * 100) / 100,
          open: Math.round(openPrice * 100) / 100,
          change: Math.round((openPrice - stock.previousClose) * 100) / 100,
          changePercent:
            Math.round(
              ((openPrice - stock.previousClose) / stock.previousClose) * 10000,
            ) / 100,
          high: openPrice,
          low: openPrice,
          timestamp: new Date(),
        });
      }
    });

    return {
      type: 'market_open',
      data: this.getCurrentStockData(),
      timestamp: new Date(),
    };
  }

  public generateMarketCloseUpdate(): StockUpdate {
    return {
      type: 'market_close',
      data: this.getCurrentStockData(),
      timestamp: new Date(),
    };
  }
}

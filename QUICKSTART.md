# Quick Start Guide - Stock Market SSE Example

Get the stock market SSE example running in 5 minutes!

## 🚀 Quick Setup

### 1. Start the Server
```bash
npm run start:dev
```

### 2. Test the API (Optional)
```bash
node test-sse.js
```

### 3. Open the Client
Open your browser and go to:
```
http://localhost:3000/public/stock-market-client.html
```

## 🎯 What You'll See

1. **Beautiful Stock Market Dashboard** with real-time updates
2. **16 Popular Tech Stocks** with realistic price movements
3. **Live Connection Statistics** showing system health
4. **Event Logs** displaying all SSE events
5. **Interactive Controls** to connect, subscribe, and manage stocks

## 📊 Features to Try

### Basic Connection
1. Enter a client ID (e.g., "my-client-001")
2. Click "Connect"
3. Watch the status change to "Connected"

### Subscribe to Stocks
1. Select multiple stocks from the dropdown
2. Click "Subscribe"
3. Watch real-time price updates every 2 seconds

### Multiple Clients
1. Open multiple browser tabs
2. Connect with different client IDs
3. Subscribe to different stock combinations
4. Compare real-time data across clients

### API Testing
Test the REST endpoints:
```bash
# Get all available stocks
curl http://localhost:3000/sse/stocks

# Get current stock data
curl http://localhost:3000/sse/stocks/data

# Get connection statistics
curl http://localhost:3000/sse/stats
```

## 🔧 Customization

### Change Update Frequency
Edit `src/modules/sse/services/sse.service.ts`:
```typescript
// Change from 2000ms to 1000ms for faster updates
interval(1000).subscribe(() => {
  const update = this.stockMarketService.generateStockUpdate();
  this.broadcastMessage(update);
});
```

### Add More Stocks
Edit `src/modules/sse/services/stock-market.service.ts`:
```typescript
private readonly stockSymbols = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
  'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'UBER', 'LYFT',
  'NFLX', 'SPOT', 'SQ', 'ZM'  // Add your stocks here
];
```

### Adjust Price Volatility
Edit the volatility setting in the same file:
```typescript
const volatility = 0.05; // Change from 0.02 to 0.05 for more volatile prices
```

## 🐛 Troubleshooting

### Server Won't Start
- Check if port 3000 is available
- Ensure all dependencies are installed: `npm install`
- Check the console for error messages

### Client Can't Connect
- Verify server is running on `http://localhost:3000`
- Check browser console for CORS errors
- Try refreshing the page

### No Stock Updates
- Check if SSE connection is established
- Verify stock symbols are selected
- Check the event logs for errors

### Performance Issues
- Reduce update frequency for better performance
- Limit the number of concurrent connections
- Monitor memory usage with many clients

## 📱 Mobile Testing

The HTML client is fully responsive and works on mobile devices:
1. Open the client on your phone
2. Connect with a unique client ID
3. Subscribe to stocks
4. Watch real-time updates on the go

## 🔗 Next Steps

After trying the basic example:

1. **Add Authentication** - Implement user login
2. **Add Real Data** - Connect to real stock APIs
3. **Add Charts** - Integrate charting libraries
4. **Add Alerts** - Implement price alert notifications
5. **Add Portfolio** - Track user portfolios
6. **Add Trading** - Simulate buy/sell orders

## 📚 Learn More

- [SSE Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [NestJS SSE Guide](https://docs.nestjs.com/techniques/streaming-files)
- [Real-time Web Technologies](https://web.dev/real-time/)

---

**Happy Trading! 📈**

Need help? Check the full documentation in `README-StockMarket-SSE.md` 
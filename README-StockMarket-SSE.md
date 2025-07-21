# Stock Market SSE Example

A comprehensive Server-Sent Events (SSE) implementation for real-time stock market data streaming using NestJS.

## 🚀 Features

- **Real-time Stock Updates**: Live stock price updates every 2 seconds
- **Market Events**: Simulated market open/close events
- **Client Management**: Track connected clients and their subscriptions
- **Subscription System**: Subscribe/unsubscribe to specific stock symbols
- **Connection Statistics**: Monitor connection health and performance
- **Modern UI**: Beautiful HTML client for testing and demonstration
- **Realistic Data**: Simulated stock price movements with realistic volatility

## 📊 Supported Stocks

The system includes 16 popular tech stocks:
- **AAPL** - Apple Inc.
- **GOOGL** - Alphabet Inc. (Google)
- **MSFT** - Microsoft Corporation
- **AMZN** - Amazon.com Inc.
- **TSLA** - Tesla Inc.
- **META** - Meta Platforms Inc.
- **NVDA** - NVIDIA Corporation
- **NFLX** - Netflix Inc.
- **AMD** - Advanced Micro Devices
- **INTC** - Intel Corporation
- **CRM** - Salesforce Inc.
- **ORCL** - Oracle Corporation
- **ADBE** - Adobe Inc.
- **PYPL** - PayPal Holdings
- **UBER** - Uber Technologies
- **LYFT** - Lyft Inc.

## 🏗️ Architecture

```
┌─────────────────┐    SSE Stream    ┌─────────────────┐
│   HTML Client   │ ◄──────────────► │   NestJS Backend│
│                 │                  │                 │
│ - Connect/Discon│                  │ - SSE Controller│
│ - Subscribe     │                  │ - SSE Service   │
│ - Real-time UI  │                  │ - Stock Service │
└─────────────────┘                  └─────────────────┘
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RealtimeHub-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run start:dev
   ```

4. **Access the client**
   - Open `http://localhost:3000/public/stock-market-client.html` in your browser
   - Or serve the HTML file using a local server

## 📡 API Endpoints

### SSE Stream
```
GET /sse/stream/:clientId
```
Establishes an SSE connection for real-time stock updates.

**Parameters:**
- `clientId` (string): Unique identifier for the client

**Response:** Server-Sent Events stream with stock data

### Subscription Management
```
POST /sse/subscribe/:clientId
```
Subscribe to specific stock symbols.

**Body:**
```json
{
  "symbols": ["AAPL", "GOOGL", "MSFT"]
}
```

```
POST /sse/unsubscribe/:clientId
```
Unsubscribe from specific stock symbols.

**Body:**
```json
{
  "symbols": ["AAPL", "GOOGL"]
}
```

### Stock Data
```
GET /sse/stocks
```
Get all available stock symbols.

```
GET /sse/stocks/data
```
Get current data for all stocks.

```
GET /sse/stocks/data/:symbols
```
Get current data for specific symbols (comma-separated).

### Statistics & Monitoring
```
GET /sse/stats
```
Get connection statistics and system health.

```
GET /sse/clients
```
Get list of connected clients.

```
GET /sse/health
```
Health check endpoint.

## 🎯 Usage Examples

### 1. Basic SSE Connection

```javascript
// Connect to SSE stream
const eventSource = new EventSource('/sse/stream/client-001');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received stock update:', data);
};

eventSource.onerror = (error) => {
  console.error('SSE connection error:', error);
};
```

### 2. Subscribe to Specific Stocks

```javascript
// Subscribe to AAPL and GOOGL
const response = await fetch('/sse/subscribe/client-001', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    symbols: ['AAPL', 'GOOGL']
  })
});

const result = await response.json();
console.log(result.message);
```

### 3. Get Current Stock Data

```javascript
// Get all stock data
const response = await fetch('/sse/stocks/data');
const data = await response.json();
console.log('Current stocks:', data.stocks);

// Get specific stocks
const specificResponse = await fetch('/sse/stocks/data/AAPL,GOOGL,MSFT');
const specificData = await specificResponse.json();
console.log('Specific stocks:', specificData.stocks);
```

## 📊 Data Format

### Stock Price Object
```json
{
  "symbol": "AAPL",
  "price": 150.25,
  "change": 2.15,
  "changePercent": 1.45,
  "volume": 456789,
  "high": 152.00,
  "low": 148.50,
  "open": 149.10,
  "previousClose": 148.10,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Stock Update Event
```json
{
  "type": "price_update",
  "data": [
    {
      "symbol": "AAPL",
      "price": 150.25,
      "change": 2.15,
      "changePercent": 1.45,
      "volume": 456789,
      "high": 152.00,
      "low": 148.50,
      "open": 149.10,
      "previousClose": 148.10,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎨 HTML Client Features

The included HTML client provides:

- **Real-time Connection Management**: Connect/disconnect with unique client IDs
- **Stock Symbol Selection**: Multi-select dropdown for choosing stocks
- **Live Stock Cards**: Beautiful cards showing real-time price data
- **Connection Statistics**: Live stats about connections and messages
- **Event Logs**: Real-time logging of all SSE events
- **Responsive Design**: Works on desktop and mobile devices
- **Color-coded Changes**: Green for positive, red for negative changes

## 🔧 Configuration

### Update Intervals
Modify the update intervals in `src/modules/sse/services/sse.service.ts`:

```typescript
// Stock updates every 2 seconds
interval(2000).subscribe(() => {
  const update = this.stockMarketService.generateStockUpdate();
  this.broadcastMessage(update);
});

// Market events every 30 seconds
interval(30000).subscribe(() => {
  const update = this.stockMarketService.generateMarketOpenUpdate();
  this.broadcastMessage(update);
});
```

### Stock Volatility
Adjust stock price volatility in `src/modules/sse/services/stock-market.service.ts`:

```typescript
private simulatePriceMovement(stock: StockPrice): StockPrice {
  const volatility = 0.02; // 2% volatility - adjust this value
  // ... rest of the method
}
```

## 🧪 Testing

### Manual Testing
1. Start the server: `npm run start:dev`
2. Open the HTML client in multiple browser tabs
3. Connect with different client IDs
4. Subscribe to different stock combinations
5. Observe real-time updates

### API Testing
Use tools like Postman or curl to test the REST endpoints:

```bash
# Get available stocks
curl http://localhost:3000/sse/stocks

# Get current stock data
curl http://localhost:3000/sse/stocks/data

# Get connection stats
curl http://localhost:3000/sse/stats
```

## 📈 Performance Considerations

- **Connection Limits**: Monitor the number of concurrent connections
- **Memory Usage**: Large numbers of clients may impact memory
- **Network Bandwidth**: SSE connections consume bandwidth
- **Browser Limits**: Most browsers limit concurrent connections per domain

## 🔒 Security Considerations

- **Client Validation**: Implement authentication for production use
- **Rate Limiting**: Add rate limiting to prevent abuse
- **CORS Configuration**: Configure CORS properly for production
- **Input Validation**: Validate all client inputs

## 🚀 Production Deployment

For production deployment:

1. **Add Authentication**: Implement proper client authentication
2. **Configure CORS**: Set up proper CORS policies
3. **Add Rate Limiting**: Implement rate limiting middleware
4. **Use HTTPS**: Always use HTTPS in production
5. **Monitor Performance**: Add monitoring and logging
6. **Scale Horizontally**: Consider load balancing for multiple instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review the code examples
3. Open an issue on GitHub

---

**Happy Trading! 📈** 
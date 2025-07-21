# Subscription Flow Test Guide

## Expected Behavior When Subscribing After Connection

### Step-by-Step Flow

#### 1. **Initial Connection (All Stocks)**
```
Action: Connect to SSE stream
Result: Receive updates for ALL 16 stocks
Status: subscriptions = []
```

#### 2. **Subscribe to Specific Stock**
```
Action: Subscribe to ["AAPL"]
Result: Receive updates for ONLY AAPL
Status: subscriptions = ["AAPL"]
```

#### 3. **Subscribe to Additional Stock**
```
Action: Subscribe to ["GOOGL"] (while already subscribed to AAPL)
Result: Receive updates for AAPL + GOOGL
Status: subscriptions = ["AAPL", "GOOGL"]
```

#### 4. **Subscribe to Already Subscribed Stock**
```
Action: Subscribe to ["AAPL"] again
Result: No change - still receive AAPL + GOOGL
Status: subscriptions = ["AAPL", "GOOGL"] (no duplicates)
```

#### 5. **Unsubscribe from Specific Stock**
```
Action: Unsubscribe from ["AAPL"]
Result: Receive updates for ONLY GOOGL
Status: subscriptions = ["GOOGL"]
```

#### 6. **Unsubscribe from All Stocks**
```
Action: Unsubscribe from ["GOOGL"]
Result: Return to receiving ALL 16 stocks
Status: subscriptions = []
```

## How to Test This Flow

### Using the HTML Client

1. **Open**: `http://localhost:3000/public/stock-market-client.html`
2. **Connect**: Enter client ID and click "Connect"
3. **Observe**: You should see all 16 stocks updating
4. **Subscribe**: Select "AAPL" and click "Subscribe"
5. **Observe**: You should now only see AAPL updates
6. **Add More**: Select "GOOGL" and click "Subscribe"
7. **Observe**: You should see both AAPL and GOOGL updates
8. **Unsubscribe**: Select "AAPL" and click "Unsubscribe"
9. **Observe**: You should only see GOOGL updates
10. **Unsubscribe All**: Select "GOOGL" and click "Unsubscribe"
11. **Observe**: You should return to seeing all 16 stocks

### Using API Calls

```bash
# 1. Connect (this happens via SSE stream)
# GET /sse/stream/client-001

# 2. Subscribe to AAPL
curl -X POST http://localhost:3000/sse/subscribe/client-001 \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL"]}'

# 3. Subscribe to GOOGL (adds to existing subscription)
curl -X POST http://localhost:3000/sse/subscribe/client-001 \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["GOOGL"]}'

# 4. Unsubscribe from AAPL
curl -X POST http://localhost:3000/sse/unsubscribe/client-001 \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL"]}'

# 5. Unsubscribe from GOOGL (returns to all stocks)
curl -X POST http://localhost:3000/sse/unsubscribe/client-001 \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["GOOGL"]}'
```

## Key Points

### ✅ **Additive Subscriptions**
- Subscribing to new stocks **adds** to existing subscriptions
- No duplicates are created
- Example: `["AAPL"]` + `["GOOGL"]` = `["AAPL", "GOOGL"]`

### ✅ **Selective Unsubscription**
- Unsubscribing removes specific stocks
- Other subscriptions remain active
- Example: `["AAPL", "GOOGL"]` - `["AAPL"]` = `["GOOGL"]`

### ✅ **Return to Default**
- When all subscriptions are removed, client returns to receiving all stocks
- Example: `["GOOGL"]` - `["GOOGL"]` = `[]` (all stocks)

### ✅ **Real-time Switching**
- Changes take effect immediately
- No need to reconnect
- Smooth transition between filtered and unfiltered views

## Implementation Details

The logic works as follows:

```typescript
// Subscribe: Adds to existing subscriptions
symbols.forEach((symbol) => {
  if (!client.subscriptions.includes(symbol)) {
    client.subscriptions.push(symbol); // Add if not already present
  }
});

// Unsubscribe: Removes from subscriptions
symbols.forEach((symbol) => {
  const index = client.subscriptions.indexOf(symbol);
  if (index > -1) {
    client.subscriptions.splice(index, 1); // Remove if present
  }
});

// Filtering: Based on subscription count
if (client.subscriptions.length === 0) {
  return true; // Show all stocks
} else {
  return stockData.some(stock => 
    client.subscriptions.includes(stock.symbol)
  ); // Show only subscribed stocks
}
```

## Expected User Experience

1. **Connect** → See all stocks immediately
2. **Subscribe to favorites** → Focus on specific stocks
3. **Add more stocks** → Expand watchlist
4. **Remove stocks** → Narrow focus
5. **Remove all** → Return to overview

This provides a flexible, intuitive experience where users can dynamically adjust their view without losing their connection or data. 
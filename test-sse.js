const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const CLIENT_ID = 'test-client-001';
const TEST_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT'];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  log('\n🔍 Testing Health Check...', 'blue');
  try {
    const result = await makeRequest('/sse/health');
    if (result.status === 200) {
      log('✅ Health check passed', 'green');
      log(`   Status: ${result.data.status}`, 'green');
    } else {
      log('❌ Health check failed', 'red');
    }
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red');
  }
}

async function testGetStocks() {
  log('\n📊 Testing Get Available Stocks...', 'blue');
  try {
    const result = await makeRequest('/sse/stocks');
    if (result.status === 200 && result.data.symbols) {
      log('✅ Get stocks passed', 'green');
      log(`   Available stocks: ${result.data.symbols.length}`, 'green');
      log(
        `   Sample stocks: ${result.data.symbols.slice(0, 5).join(', ')}`,
        'green',
      );
    } else {
      log('❌ Get stocks failed', 'red');
    }
  } catch (error) {
    log(`❌ Get stocks error: ${error.message}`, 'red');
  }
}

async function testGetStockData() {
  log('\n📈 Testing Get Stock Data...', 'blue');
  try {
    const result = await makeRequest('/sse/stocks/data');
    if (result.status === 200 && result.data.stocks) {
      log('✅ Get stock data passed', 'green');
      log(`   Stock data count: ${result.data.stocks.length}`, 'green');
      if (result.data.stocks.length > 0) {
        const sampleStock = result.data.stocks[0];
        log(
          `   Sample stock: ${sampleStock.symbol} - $${sampleStock.price}`,
          'green',
        );
      }
    } else {
      log('❌ Get stock data failed', 'red');
    }
  } catch (error) {
    log(`❌ Get stock data error: ${error.message}`, 'red');
  }
}

async function testGetSpecificStockData() {
  log('\n🎯 Testing Get Specific Stock Data...', 'blue');
  try {
    const symbols = TEST_SYMBOLS.join(',');
    const result = await makeRequest(`/sse/stocks/data/${symbols}`);
    if (result.status === 200 && result.data.stocks) {
      log('✅ Get specific stock data passed', 'green');
      log(`   Requested symbols: ${TEST_SYMBOLS.join(', ')}`, 'green');
      log(`   Received data count: ${result.data.stocks.length}`, 'green');
    } else {
      log('❌ Get specific stock data failed', 'red');
    }
  } catch (error) {
    log(`❌ Get specific stock data error: ${error.message}`, 'red');
  }
}

async function testGetStats() {
  log('\n📊 Testing Get Connection Stats...', 'blue');
  try {
    const result = await makeRequest('/sse/stats');
    if (result.status === 200) {
      log('✅ Get stats passed', 'green');
      log(`   Total connections: ${result.data.totalConnections}`, 'green');
      log(`   Active connections: ${result.data.activeConnections}`, 'green');
      log(`   Total messages sent: ${result.data.totalMessagesSent}`, 'green');
      log(`   Uptime: ${Math.floor(result.data.uptime / 1000)}s`, 'green');
    } else {
      log('❌ Get stats failed', 'red');
    }
  } catch (error) {
    log(`❌ Get stats error: ${error.message}`, 'red');
  }
}

async function testSubscribe() {
  log('\n📝 Testing Subscribe to Stocks...', 'blue');
  try {
    const result = await makeRequest(`/sse/subscribe/${CLIENT_ID}`, 'POST', {
      symbols: TEST_SYMBOLS,
    });
    if (result.status === 200) {
      log('✅ Subscribe test completed', 'green');
      log(`   Message: ${result.data.message}`, 'green');
    } else {
      log('❌ Subscribe failed', 'red');
    }
  } catch (error) {
    log(`❌ Subscribe error: ${error.message}`, 'red');
  }
}

async function testUnsubscribe() {
  log('\n🚫 Testing Unsubscribe from Stocks...', 'blue');
  try {
    const result = await makeRequest(`/sse/unsubscribe/${CLIENT_ID}`, 'POST', {
      symbols: TEST_SYMBOLS,
    });
    if (result.status === 200) {
      log('✅ Unsubscribe test completed', 'green');
      log(`   Message: ${result.data.message}`, 'green');
    } else {
      log('❌ Unsubscribe failed', 'red');
    }
  } catch (error) {
    log(`❌ Unsubscribe error: ${error.message}`, 'red');
  }
}

async function testSSEConnection() {
  log('\n🔌 Testing SSE Connection...', 'blue');
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: `/sse/stream/${CLIENT_ID}`,
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      },
      (res) => {
        if (res.statusCode === 200) {
          log('✅ SSE connection established', 'green');

          let messageCount = 0;
          res.on('data', (chunk) => {
            const data = chunk.toString();
            if (data.includes('data: ')) {
              messageCount++;
              if (messageCount === 1) {
                log('✅ Received initial connection message', 'green');
              } else if (messageCount <= 3) {
                log(`✅ Received stock update #${messageCount}`, 'green');
              }

              if (messageCount >= 3) {
                req.destroy();
                resolve();
              }
            }
          });

          // Timeout after 10 seconds
          setTimeout(() => {
            req.destroy();
            log('⏰ SSE test timed out', 'yellow');
            resolve();
          }, 10000);
        } else {
          log(`❌ SSE connection failed with status: ${res.statusCode}`, 'red');
          resolve();
        }
      },
    );

    req.on('error', (error) => {
      log(`❌ SSE connection error: ${error.message}`, 'red');
      resolve();
    });

    req.end();
  });
}

// Main test runner
async function runTests() {
  log('🚀 Starting Stock Market SSE Tests...', 'blue');
  log('Make sure the server is running on http://localhost:3000', 'yellow');

  try {
    await testHealthCheck();
    await testGetStocks();
    await testGetStockData();
    await testGetSpecificStockData();
    await testGetStats();
    await testSubscribe();
    await testUnsubscribe();
    await testSSEConnection();

    log('\n🎉 All tests completed!', 'green');
    log(
      'You can now open the HTML client at: http://localhost:3000/public/stock-market-client.html',
      'blue',
    );
  } catch (error) {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testHealthCheck,
  testGetStocks,
  testGetStockData,
  testGetSpecificStockData,
  testGetStats,
  testSubscribe,
  testUnsubscribe,
  testSSEConnection,
};

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const CLIENT_ID = 'test-poc-client';
const TEST_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT'];

function log(message, color = 'reset') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      const bodyString = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

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
                log(`✅ Received data update #${messageCount}`, 'green');
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
async function runPocTests() {
  log('🚀 Starting SSE POC Tests...', 'blue');
  log('Make sure the server is running on http://localhost:3000', 'yellow');

  try {
    await testSubscribe();
    await testUnsubscribe();
    await testSSEConnection();

    log('\n🎉 All POC tests completed!', 'green');
    log(
      'You can now open the POC client at: http://localhost:3000/public/stock-market-client.html',
      'blue',
    );
  } catch (error) {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPocTests();
}

module.exports = {
  runPocTests,
  testSubscribe,
  testUnsubscribe,
  testSSEConnection,
}; 
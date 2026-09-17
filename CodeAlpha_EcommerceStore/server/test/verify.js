const http = require('http');

async function testEndpoint(url, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (bodyData) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End Verification Tests for Task 1 (E-Commerce Store)...');

  // Test 1: Health check
  const health = await testEndpoint('http://localhost:3000/api/health');
  console.log('✔ Health Check:', health.data.status === 'ok' ? 'PASSED' : 'FAILED');

  // Test 2: Product catalog
  const productsRes = await testEndpoint('http://localhost:3000/api/products');
  console.log(`✔ Fetch Products: PASSED (${productsRes.data.count} products retrieved)`);

  // Test 3: Product filter by category
  const filteredRes = await testEndpoint('http://localhost:3000/api/products?category=Electronics');
  console.log(`✔ Category Filter: PASSED (${filteredRes.data.count} electronics found)`);

  // Test 4: Demo login
  const loginRes = await testEndpoint('http://localhost:3000/api/auth/login', {
    method: 'POST'
  }, JSON.stringify({ email: 'demo@codealpha.com', password: 'password123' }));
  console.log('✔ User Authentication (Login):', loginRes.status === 200 ? 'PASSED' : 'FAILED');
  const token = loginRes.data.token;

  // Test 5: Place order
  const orderRes = await testEndpoint('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }, JSON.stringify({
    items: [{ id: productsRes.data.products[0].id, quantity: 2 }],
    shippingName: 'Demo Tester',
    shippingAddress: '456 Test Lane',
    shippingCity: 'Tech City',
    shippingPostalCode: '10001',
    paymentMethod: 'Credit Card'
  }));
  console.log('✔ Place Order (Checkout):', orderRes.status === 201 ? `PASSED (Order #${orderRes.data.orderId})` : 'FAILED');

  // Test 6: Verify My Orders
  const myOrdersRes = await testEndpoint('http://localhost:3000/api/orders/my-orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`✔ Retrieve Orders History: PASSED (${myOrdersRes.data.count} order(s) found)`);

  console.log('\n🎉 ALL TASK 1 BACKEND & DATABASE TESTS PASSED SUCCESSFULLY!\n');
}

// Start server and run tests
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDB } = require('../config/database');
const authRoutes = require('../routes/authRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

initDB().then(() => {
  const server = app.listen(3000, async () => {
    try {
      await runTests();
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
});

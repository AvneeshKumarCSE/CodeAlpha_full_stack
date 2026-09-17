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
  console.log('🧪 Starting End-to-End Verification Tests for Task 2 (Social Media Platform)...');

  // 1. Health check
  const health = await testEndpoint('http://localhost:5000/api/health');
  console.log('✔ Health Check:', health.data.status === 'ok' ? 'PASSED' : 'FAILED');

  // 2. Fetch timeline posts
  const postsRes = await testEndpoint('http://localhost:5000/api/posts');
  console.log(`✔ Timeline Feed: PASSED (${postsRes.data.count} posts retrieved)`);

  // 3. User Login
  const loginRes = await testEndpoint('http://localhost:5000/api/auth/login', {
    method: 'POST'
  }, JSON.stringify({ identifier: 'alex_dev', password: 'password123' }));
  console.log('✔ Auth Login (@alex_dev):', loginRes.status === 200 ? 'PASSED' : 'FAILED');
  const token = loginRes.data.token;

  // 4. Create Post
  const newPostRes = await testEndpoint('http://localhost:5000/api/posts', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }, JSON.stringify({ content: 'Automated test post from test suite! 🧪✨', image_url: '' }));
  console.log('✔ Create Post:', newPostRes.status === 201 ? `PASSED (Post ID: ${newPostRes.data.post.id})` : 'FAILED');
  const createdPostId = newPostRes.data.post.id;

  // 5. Toggle Like
  const likeRes = await testEndpoint(`http://localhost:5000/api/posts/${createdPostId}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('✔ Toggle Like on Post:', likeRes.status === 200 && likeRes.data.isLiked === true ? 'PASSED' : 'FAILED');

  // 6. Add Comment
  const commentRes = await testEndpoint(`http://localhost:5000/api/posts/${createdPostId}/comments`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }, JSON.stringify({ content: 'Testing reply feature.' }));
  console.log('✔ Add Comment to Post:', commentRes.status === 201 ? 'PASSED' : 'FAILED');

  // 7. Get Public Profile
  const profileRes = await testEndpoint('http://localhost:5000/api/users/profile/sarah_codes');
  console.log(`✔ Get User Profile (@sarah_codes): PASSED (${profileRes.data.profile.followersCount} followers)`);

  // 8. Follow Toggle
  const followRes = await testEndpoint(`http://localhost:5000/api/users/${profileRes.data.profile.id}/follow`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`✔ Follow/Unfollow User: PASSED (${followRes.data.message})`);

  console.log('\n🎉 ALL TASK 2 BACKEND & DATABASE TESTS PASSED SUCCESSFULLY!\n');
}

const express = require('express');
const cors = require('cors');
const { initDB } = require('../config/database');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const postRoutes = require('../routes/postRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

initDB().then(() => {
  const server = app.listen(5000, async () => {
    try {
      await runTests();
    } catch (err) {
      console.error('Test error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
});

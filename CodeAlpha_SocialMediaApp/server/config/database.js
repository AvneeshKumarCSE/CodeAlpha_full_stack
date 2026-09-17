const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data', 'social.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const initDB = async () => {
  try {
    await dbRun('PRAGMA foreign_keys = ON');

    // Users Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        bio TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Posts Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Comments Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Likes Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Follows Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Check if initial seed is needed
    const usersCount = await dbGet('SELECT COUNT(*) as count FROM users');
    if (usersCount.count === 0) {
      console.log('Seeding initial community users and posts...');
      const defaultPassword = await bcrypt.hash('password123', 10);

      // User 1 (Demo)
      const u1 = await dbRun(
        `INSERT INTO users (name, username, email, password, bio, avatar) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Alex Rivera',
          'alex_dev',
          'demo@codealpha.com',
          defaultPassword,
          'Full-stack developer passionate about Node.js, system architecture, and modern UX design.',
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
        ]
      );

      // User 2
      const u2 = await dbRun(
        `INSERT INTO users (name, username, email, password, bio, avatar) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Sarah Chen',
          'sarah_codes',
          'sarah@codealpha.com',
          defaultPassword,
          'Frontend engineer & design systems enthusiast. Coffee lover ☕',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
        ]
      );

      // User 3
      const u3 = await dbRun(
        `INSERT INTO users (name, username, email, password, bio, avatar) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Marcus Vance',
          'marcus_tech',
          'marcus@codealpha.com',
          defaultPassword,
          'Cloud enthusiast & DevOps explorer. Writing clean architectures.',
          'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80'
        ]
      );

      // Seed follows
      await dbRun('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [u2.id, u1.id]);
      await dbRun('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [u3.id, u1.id]);
      await dbRun('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [u1.id, u2.id]);

      // Seed Posts
      const p1 = await dbRun(
        `INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)`,
        [
          u2.id,
          'Excited to kick off the CodeAlpha Full Stack Internship! Building scalable applications with modern JavaScript and clean API design. 🚀💻',
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
        ]
      );

      const p2 = await dbRun(
        `INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)`,
        [
          u3.id,
          'Why I love SQLite for local development: zero external daemon overhead, instantaneous transactions, and ACID compliance out of the box! What database do you prefer for prototyping?',
          ''
        ]
      );

      const p3 = await dbRun(
        `INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)`,
        [
          u1.id,
          'Workspace setup for today! Ready to ship clean code and build responsive interfaces. ☕✨',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
        ]
      );

      // Seed Likes
      await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [p1.id, u1.id]);
      await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [p1.id, u3.id]);
      await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [p2.id, u1.id]);

      // Seed Comments
      await dbRun(
        'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
        [p1.id, u1.id, 'Great to connect Sarah! Looking forward to building great projects together.']
      );
      await dbRun(
        'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
        [p2.id, u2.id, 'Totally agree Marcus, SQLite is unbeatable for speed and zero-friction setups.']
      );

      console.log('Seed users, posts, likes, and comments populated.');
    }

    console.log('Social Media database initialized successfully.');
  } catch (err) {
    console.error('Social Media database init error:', err);
  }
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  initDB
};

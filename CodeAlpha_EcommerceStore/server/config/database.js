const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data', 'store.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper functions for promise-based query execution
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

const seedData = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation with two processors and 8 microphones for exceptional call quality and sound immersion.',
    price: 349.99,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stock: 15,
    rating: 4.8
  },
  {
    name: 'Apple MacBook Air 13" (M2)',
    description: 'Strikingly thin design with all-day battery life, brilliant Liquid Retina display, and 1080p FaceTime HD camera.',
    price: 999.00,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    stock: 8,
    rating: 4.9
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Ergonomic performance mouse with quiet clicks, 8K DPI track-on-glass sensor, and ultra-fast MagSpeed scrolling.',
    price: 99.99,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    rating: 4.7
  },
  {
    name: 'Minimalist Ceramic Coffee Mug',
    description: 'Handcrafted stoneware ceramic mug with a matte finish. 350ml capacity, microwave and dishwasher safe.',
    price: 24.50,
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    stock: 40,
    rating: 4.6
  },
  {
    name: 'Aroma Diffuser & Essential Oil Humidifier',
    description: 'Ultrasonic cool mist humidifier with 7 LED ambient colors and auto shut-off protection for quiet relaxation.',
    price: 39.99,
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
    stock: 20,
    rating: 4.5
  },
  {
    name: 'Classic Vintage Denim Jacket',
    description: 'Premium heavyweight cotton denim jacket with button flap chest pockets and adjustable waist tabs.',
    price: 89.00,
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
    stock: 18,
    rating: 4.6
  },
  {
    name: 'Organic Cotton Crewneck T-Shirt',
    description: 'Ultra-soft 100% certified organic combed ring-spun cotton. Breathable, durable, and ethically manufactured.',
    price: 28.00,
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    stock: 50,
    rating: 4.4
  },
  {
    name: 'Genuine Leather Minimalist Wallet',
    description: 'Slim bifold front-pocket wallet crafted from full-grain leather with RFID-blocking security lining.',
    price: 45.00,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    stock: 30,
    rating: 4.7
  },
  {
    name: 'Matte Black Polarized Sunglasses',
    description: 'Classic unisex square frame with UV400 polarized anti-glare lenses and lightweight durable composite temple arms.',
    price: 55.00,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    stock: 22,
    rating: 4.5
  }
];

const initDB = async () => {
  try {
    // Enable Foreign Keys
    await dbRun('PRAGMA foreign_keys = ON');

    // Create Users Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Products Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        stock INTEGER DEFAULT 10,
        rating REAL DEFAULT 4.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Orders Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        shipping_name TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_city TEXT NOT NULL,
        shipping_postal_code TEXT NOT NULL,
        payment_method TEXT DEFAULT 'Credit Card',
        status TEXT DEFAULT 'Processing',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Order Items Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // Seed Demo User if not present
    const existingDemoUser = await dbGet('SELECT * FROM users WHERE email = ?', ['demo@codealpha.com']);
    if (!existingDemoUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await dbRun(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Demo Customer', 'demo@codealpha.com', hashedPassword, 'customer']
      );
      console.log('Default demo user created: demo@codealpha.com / password123');
    }

    // Seed Products if table is empty
    const productCountRow = await dbGet('SELECT COUNT(*) as count FROM products');
    if (productCountRow.count === 0) {
      for (const item of seedData) {
        await dbRun(
          `INSERT INTO products (name, description, price, category, image_url, stock, rating)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [item.name, item.description, item.price, item.category, item.image_url, item.stock, item.rating]
        );
      }
      console.log(`Seeded ${seedData.length} initial products.`);
    }

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  initDB
};

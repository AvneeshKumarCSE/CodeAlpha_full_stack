const { dbRun, dbGet, dbAll } = require('../config/database');

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingName, shippingAddress, shippingCity, shippingPostalCode, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
    }

    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostalCode) {
      return res.status(400).json({ success: false, message: 'Please provide all required shipping details.' });
    }

    // Verify stock and compute total amount
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await dbGet('SELECT * FROM products WHERE id = ?', [item.id]);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product with ID ${item.id} not found.` });
      }

      const qty = parseInt(item.quantity, 10) || 1;
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${qty}`
        });
      }

      totalAmount += product.price * qty;
      validatedItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: qty
      });
    }

    // Insert order
    const orderResult = await dbRun(
      `INSERT INTO orders (user_id, total_amount, shipping_name, shipping_address, shipping_city, shipping_postal_code, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        parseFloat(totalAmount.toFixed(2)),
        shippingName.trim(),
        shippingAddress.trim(),
        shippingCity.trim(),
        shippingPostalCode.trim(),
        paymentMethod || 'Credit Card',
        'Confirmed'
      ]
    );

    const orderId = orderResult.id;

    // Insert order items and deduct stock
    for (const item of validatedItems) {
      await dbRun(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.productName, item.quantity, item.unitPrice]
      );

      await dbRun(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.productId]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      totalAmount: parseFloat(totalAmount.toFixed(2))
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to process order.' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await dbAll('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);

    // Attach items for each order
    for (const order of orders) {
      order.items = await dbAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Fetch my orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve order history.' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await dbGet('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.items = await dbAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Fetch order by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};

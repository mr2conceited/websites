const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc Create new order from cart
// @route POST /api/orders
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Verify stock & decrement
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    const variant = product.variants.id(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.name} (${item.size})`);
    }
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    const variant = product.variants.id(item.variantId);
    variant.stock -= item.quantity;
    await product.save();
  }

  const itemsPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 9.99;
  const taxPrice = Number((itemsPrice * 0.07).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    items: cart.items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order });
});

// @desc Get logged-in user's orders
// @route GET /api/orders/mine
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc Get order by id
// @route GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json({ success: true, order });
});

// @desc Mark order as paid
// @route PUT /api/orders/:id/pay
// @access Private
const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = req.body.paymentResult || {};
  order.status = 'processing';
  const updated = await order.save();
  res.json({ success: true, order: updated });
});

// --- Admin ---

// @desc Get all orders
// @route GET /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc Update order status
// @route PUT /api/orders/:id/status
// @access Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.status = req.body.status || order.status;
  if (req.body.status === 'delivered') order.deliveredAt = Date.now();
  const updated = await order.save();
  res.json({ success: true, order: updated });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  markOrderPaid,
  getOrders,
  updateOrderStatus,
};

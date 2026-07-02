const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc Get current user's cart
// @route GET /api/cart
// @access Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ success: true, cart });
});

// @desc Add item to cart
// @route POST /api/cart/items
// @access Private
const addItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const variant = product.variants.id(variantId);
  if (!variant) {
    res.status(404);
    throw new Error('Variant not found');
  }
  if (variant.stock < quantity) {
    res.status(400);
    throw new Error('Not enough stock available');
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.variantId.toString() === variantId);

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: product._id,
      variantId,
      name: product.name,
      image: product.images[0] || '',
      size: variant.size,
      color: variant.color,
      price,
      quantity,
    });
  }

  await cart.save();
  res.status(201).json({ success: true, cart });
});

// @desc Update item quantity
// @route PUT /api/cart/items/:variantId
// @access Private
const updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.variantId.toString() === req.params.variantId);

  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.variantId.toString() !== req.params.variantId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  res.json({ success: true, cart });
});

// @desc Remove item from cart
// @route DELETE /api/cart/items/:variantId
// @access Private
const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.variantId.toString() !== req.params.variantId);
  await cart.save();
  res.json({ success: true, cart });
});

// @desc Clear cart
// @route DELETE /api/cart
// @access Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, cart });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };

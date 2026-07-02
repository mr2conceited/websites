const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  markOrderPaid,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, admin, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, markOrderPaid);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;

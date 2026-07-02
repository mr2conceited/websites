const express = require('express');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:variantId', updateItem);
router.delete('/items/:variantId', removeItem);
router.delete('/', clearCart);

module.exports = router;

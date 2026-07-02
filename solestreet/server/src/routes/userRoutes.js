const express = require('express');
const {
  updateMe,
  addAddress,
  deleteAddress,
  toggleWishlist,
  getUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/me', protect, updateMe);
router.post('/me/addresses', protect, addAddress);
router.delete('/me/addresses/:addressId', protect, deleteAddress);
router.post('/me/wishlist/:productId', protect, toggleWishlist);

router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;

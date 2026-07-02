const express = require('express');
const {
  getProducts,
  getProductByIdOrSlug,
  getFilterMeta,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/meta/filters', getFilterMeta);
router.post('/', protect, admin, createProduct);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;

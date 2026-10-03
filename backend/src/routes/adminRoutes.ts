import express from 'express';
import {
  getStats,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllUsers,
  setUserStatus,
  getAllOrders,
  setOrderStatus,
  getAllReviews,
  deleteReview,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getStats);
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', setUserStatus);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', setOrderStatus);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

export default router;

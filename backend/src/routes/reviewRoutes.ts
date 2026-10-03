import express from 'express';
import { getProductReviews, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/:productId', createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;

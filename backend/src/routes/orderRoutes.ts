import express from 'express';
import { getOrders, getOrderById, createOrder, cancelOrder } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.post('/:id/cancel', cancelOrder);

export default router;

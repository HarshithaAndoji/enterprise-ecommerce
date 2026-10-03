import express from 'express';
import { getAll, getById, getFeatured, getPopular, getRecent, search, getRelated } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/featured', getFeatured);
router.get('/popular', getPopular);
router.get('/recent', getRecent);
router.get('/search', search);
router.get('/:id/related', getRelated);
router.get('/:id', getById);

export default router;
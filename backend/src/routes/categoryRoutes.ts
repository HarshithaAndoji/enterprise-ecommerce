import express from 'express';
import { getAll, getBySlug, create, update, remove } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;

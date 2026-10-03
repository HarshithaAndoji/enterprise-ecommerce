import express from 'express';
import { getAll, register, login } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAll);
router.post('/register', register);
router.post('/login', login);

export default router;
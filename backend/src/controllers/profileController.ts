import { Request, Response } from 'express';
import { users } from '../controllers/userController.js';

export const getProfile = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

export const updateProfile = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
  users[idx] = { ...users[idx], ...req.body };
  res.json({ success: true, message: 'Profile updated', data: users[idx] });
};

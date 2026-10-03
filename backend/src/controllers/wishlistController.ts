import { Request, Response } from 'express';

let wishlists: Record<string, { userId: string; productIds: string[] }> = {};

export const getWishlist = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const wishlist = wishlists[userId] || { userId, productIds: [] };
  res.json({ success: true, data: wishlist });
};

export const addToWishlist = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  if (!wishlists[userId]) wishlists[userId] = { userId, productIds: [] };
  if (!wishlists[userId].productIds.includes(req.params.productId)) {
    wishlists[userId].productIds.push(req.params.productId);
  }
  res.status(201).json({ success: true, data: wishlists[userId] });
};

export const removeFromWishlist = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  if (wishlists[userId]) {
    wishlists[userId].productIds = wishlists[userId].productIds.filter(id => id !== req.params.productId);
  }
  res.json({ success: true, data: wishlists[userId] || { userId, productIds: [] } });
};

export const checkWishlist = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const inWishlist = wishlists[userId]?.productIds.includes(req.params.productId) ?? false;
  res.json({ success: true, data: inWishlist });
};

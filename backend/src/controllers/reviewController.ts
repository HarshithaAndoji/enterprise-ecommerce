import { Request, Response } from 'express';

let reviews: any[] = [];

export const getProductReviews = (req: Request, res: Response) => {
  const productReviews = reviews.filter(r => r.productId === req.params.productId);
  res.json({ success: true, message: `${productReviews.length} review(s) found`, data: productReviews });
};

export const createReview = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const { rating, comment, title } = req.body;
  const review = {
    id: `rev_${Date.now().toString(36)}`,
    productId: req.params.productId,
    userId,
    rating,
    comment,
    title,
    isApproved: true,
    createdAt: new Date().toISOString(),
  };
  reviews = [review, ...reviews];
  res.status(201).json({ success: true, message: 'Review created', data: review });
};

export const updateReview = (req: Request, res: Response) => {
  const idx = reviews.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Review not found' });
  reviews[idx] = { ...reviews[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, message: 'Review updated', data: reviews[idx] });
};

export const deleteReview = (req: Request, res: Response) => {
  reviews = reviews.filter(r => r.id !== req.params.id);
  res.status(204).send();
};

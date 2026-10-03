import { Request, Response } from 'express';
import { getById as getProductById, products as productList } from './productController.js';

let carts: Record<string, { id: string; items: Array<{ id: string; productId: string; quantity: number; product: any }> }> = {};
let cartIdCounter = 1;

function getUserCart(userId: string) {
  if (!carts[userId]) {
    carts[userId] = { id: `cart_${cartIdCounter++}`, items: [] };
  }
  return carts[userId];
}

function buildCartTotals(items: any[]) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;
  return { subtotal, tax, shipping, total };
}

export const getCart = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const cart = getUserCart(userId);
  const totals = buildCartTotals(cart.items);
  res.json({
    success: true,
    data: {
      id: cart.id,
      items: cart.items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      discount: 0,
      total: totals.total,
      updatedAt: new Date().toISOString(),
    },
  });
};

export const addToCart = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const { productId, quantity = 1 } = req.body;
  const product = productList.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.stock < quantity) return res.status(409).json({ success: false, message: 'Not enough stock' });

  const cart = getUserCart(userId);
  const existing = cart.items.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    if (existing.quantity > product.stock) existing.quantity = product.stock;
  } else {
    cart.items.push({
      id: `cart_item_${Date.now().toString(36)}`,
      productId,
      quantity,
      product,
    });
  }
  const totals = buildCartTotals(cart.items);
  res.status(201).json({
    success: true,
    message: 'Added to cart',
    data: {
      id: cart.id,
      items: cart.items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      discount: 0,
      total: totals.total,
      updatedAt: new Date().toISOString(),
    },
  });
};

export const updateCartItem = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const { quantity } = req.body;
  const cart = getUserCart(userId);
  const item = cart.items.find(i => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.id !== req.params.itemId);
  } else {
    item.quantity = quantity;
  }
  const totals = buildCartTotals(cart.items);
  res.json({
    success: true,
    data: {
      id: cart.id,
      items: cart.items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      discount: 0,
      total: totals.total,
      updatedAt: new Date().toISOString(),
    },
  });
};

export const removeCartItem = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const cart = getUserCart(userId);
  cart.items = cart.items.filter(i => i.id !== req.params.itemId);
  const totals = buildCartTotals(cart.items);
  res.json({
    success: true,
    data: {
      id: cart.id,
      items: cart.items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      discount: 0,
      total: totals.total,
      updatedAt: new Date().toISOString(),
    },
  });
};

export const clearCart = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  carts[userId] = { id: `cart_${cartIdCounter++}`, items: [] };
  res.status(204).send();
};

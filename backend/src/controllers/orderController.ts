import { Request, Response } from 'express';
import { getProductById, products as productList } from './productController.js';

let orders: any[] = [];
let orderIdCounter = 1;

export const getOrders = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const userOrders = orders.filter(o => o.userId === userId);
  res.json({ success: true, message: `${userOrders.length} order(s) found`, data: userOrders });
};

export const getOrderById = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const order = orders.find(o => o.id === req.params.id && o.userId === userId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
};

export const createOrder = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  const orderItems = items.map((item: any) => {
    const product = productList.find(p => p.id === item.productId);
    return {
      id: `item_${Date.now().toString(36)}_${item.productId}`,
      productId: item.productId,
      name: product?.name || 'Product',
      image: product?.images?.[0] || '',
      price: product?.price || 0,
      quantity: item.quantity,
      total: Math.round((product?.price || 0) * item.quantity * 100) / 100,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const order = {
    id: `order_${orderIdCounter++}_${Date.now().toString(36)}`,
    orderNumber: `ORD-${1000 + orders.length + 1}`,
    userId,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    status: 'confirmed',
    subtotal,
    tax,
    shipping,
    discount: 0,
    total,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders = [order, ...orders];
  res.status(201).json({ success: true, message: 'Order placed', data: order });
};

export const cancelOrder = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'user_1';
  const idx = orders.findIndex(o => o.id === req.params.id && o.userId === userId);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
  orders[idx] = { ...orders[idx], status: 'cancelled', cancelledAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  res.json({ success: true, message: 'Order cancelled', data: orders[idx] });
};

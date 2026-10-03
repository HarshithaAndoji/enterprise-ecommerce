import { Request, Response } from 'express';

let products = [
  { id: 'prod_1', name: 'Aurora Wireless Headphones', price: 189.99, stock: 42, category: 'Electronics', isActive: true, createdAt: new Date('2026-01-15').toISOString() },
  { id: 'prod_2', name: 'Nimbus 14 Ultrabook', price: 1249.0, stock: 18, category: 'Electronics', isActive: true, createdAt: new Date('2026-02-01').toISOString() },
  { id: 'prod_3', name: 'Pulse Smart Watch Series 6', price: 249.0, stock: 65, category: 'Electronics', isActive: true, createdAt: new Date('2026-02-10').toISOString() },
  { id: 'prod_4', name: 'Linen Blend Overshirt', price: 89.0, stock: 54, category: 'Fashion', isActive: true, createdAt: new Date('2026-02-20').toISOString() },
  { id: 'prod_5', name: 'Cast Iron Dutch Oven', price: 94.0, stock: 40, category: 'Home & Kitchen', isActive: true, createdAt: new Date('2026-03-01').toISOString() },
  { id: 'prod_6', name: 'Adjustable Kettlebell 12-32kg', price: 219.0, stock: 16, category: 'Sports', isActive: true, createdAt: new Date('2026-03-10').toISOString() },
  { id: 'prod_7', name: 'Vitamin C Brightening Serum', price: 34.0, stock: 120, category: 'Beauty', isActive: true, createdAt: new Date('2026-03-15').toISOString() },
  { id: 'prod_8', name: 'The Pragmatic Engineer', price: 32.0, stock: 48, category: 'Books', isActive: true, createdAt: new Date('2026-03-20').toISOString() },
];

let users = [
  { id: 'user_1', name: 'Demo Customer', email: 'customer@demo.com', role: 'customer', isActive: true, createdAt: new Date('2026-01-01').toISOString() },
  { id: 'user_2', name: 'Demo Admin', email: 'admin@demo.com', role: 'admin', isActive: true, createdAt: new Date('2025-10-01').toISOString() },
  { id: 'user_3', name: 'Priya Raman', email: 'priya@example.com', role: 'customer', isActive: true, createdAt: new Date('2026-02-15').toISOString() },
  { id: 'user_4', name: 'Marcus Bell', email: 'marcus@example.com', role: 'customer', isActive: false, createdAt: new Date('2026-03-01').toISOString() },
];

let orders = [
  { id: 'order_1', orderNumber: 'ORD-1001', userId: 'user_1', userName: 'Demo Customer', status: 'delivered', paymentStatus: 'paid', total: 239.98, createdAt: new Date('2026-08-15').toISOString() },
  { id: 'order_2', orderNumber: 'ORD-1002', userId: 'user_1', userName: 'Demo Customer', status: 'shipped', paymentStatus: 'paid', total: 498.0, createdAt: new Date('2026-09-01').toISOString() },
  { id: 'order_3', orderNumber: 'ORD-1003', userId: 'user_3', userName: 'Priya Raman', status: 'processing', paymentStatus: 'paid', total: 345.0, createdAt: new Date('2026-09-10').toISOString() },
  { id: 'order_4', orderNumber: 'ORD-1004', userId: 'user_1', userName: 'Demo Customer', status: 'cancelled', paymentStatus: 'refunded', total: 89.0, createdAt: new Date('2026-09-05').toISOString() },
  { id: 'order_5', orderNumber: 'ORD-1005', userId: 'user_3', userName: 'Priya Raman', status: 'delivered', paymentStatus: 'paid', total: 612.0, createdAt: new Date('2026-09-12').toISOString() },
  { id: 'order_6', orderNumber: 'ORD-1006', userId: 'user_1', userName: 'Demo Customer', status: 'pending', paymentStatus: 'pending', total: 129.0, createdAt: new Date('2026-09-14').toISOString() },
];

export const getStats = (_req: Request, res: Response) => {
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const pending = orders.filter(o => o.status === 'pending').length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  res.json({
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    lowStockProducts: lowStock,
    pendingOrders: pending,
    recentOrders,
    revenueByMonth: [
      { month: 'Sep', revenue: 1240.50 },
      { month: 'Aug', revenue: 890.00 },
      { month: 'Jul', revenue: 1560.75 },
    ],
    topProducts: products.slice(0, 5).map(p => ({
      name: p.name,
      unitsSold: Math.floor(Math.random() * 100) + 10,
      revenue: Math.round(p.price * (Math.floor(Math.random() * 100) + 10) * 100) / 100,
    })),
  });
};

export const getAllProducts = (_req: Request, res: Response) => {
  res.json(products);
};

export const createProduct = (req: Request, res: Response) => {
  const product = {
    id: `prod_${products.length + 1}_${Date.now().toString(36)}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  products = [product, ...products];
  res.status(201).json(product);
};

export const updateProduct = (req: Request, res: Response) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  products[idx] = { ...products[idx], ...req.body };
  res.json(products[idx]);
};

export const deleteProduct = (req: Request, res: Response) => {
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
};

export const getAllCategories = (_req: Request, res: Response) => {
  const cats = [
    { id: 'cat_1', name: 'Electronics', slug: 'electronics', productCount: products.filter(p => p.category === 'Electronics').length },
    { id: 'cat_2', name: 'Fashion', slug: 'fashion', productCount: products.filter(p => p.category === 'Fashion').length },
    { id: 'cat_3', name: 'Home & Kitchen', slug: 'home-kitchen', productCount: products.filter(p => p.category === 'Home & Kitchen').length },
    { id: 'cat_4', name: 'Sports', slug: 'sports', productCount: products.filter(p => p.category === 'Sports').length },
    { id: 'cat_5', name: 'Beauty', slug: 'beauty', productCount: products.filter(p => p.category === 'Beauty').length },
    { id: 'cat_6', name: 'Books', slug: 'books', productCount: products.filter(p => p.category === 'Books').length },
  ];
  res.json(cats);
};

export const createCategory = (req: Request, res: Response) => {
  const cat = {
    id: `cat_${Date.now().toString(36)}`,
    ...req.body,
    productCount: 0,
    createdAt: new Date().toISOString(),
  };
  res.status(201).json(cat);
};

export const updateCategory = (req: Request, res: Response) => {
  res.json({ id: req.params.id, ...req.body });
};

export const deleteCategory = (req: Request, res: Response) => {
  res.status(204).send();
};

export const getAllUsers = (_req: Request, res: Response) => {
  res.json(users);
};

export const setUserStatus = (req: Request, res: Response) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  users[idx] = { ...users[idx], isActive: req.body.isActive };
  res.json(users[idx]);
};

export const getAllOrders = (_req: Request, res: Response) => {
  res.json(orders);
};

export const setOrderStatus = (req: Request, res: Response) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Order not found' });
  orders[idx] = { ...orders[idx], status: req.body.status, updatedAt: new Date().toISOString() };
  res.json(orders[idx]);
};

export const getAllReviews = (_req: Request, res: Response) => {
  res.json([]);
};

export const deleteReview = (req: Request, res: Response) => {
  res.status(204).send();
};

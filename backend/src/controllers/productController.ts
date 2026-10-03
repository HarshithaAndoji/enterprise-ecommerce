import { Request, Response } from 'express';

let products = [
  { id: 'prod_1', name: 'Aurora Wireless Headphones', price: 189.99, stock: 42, category: 'Electronics', categoryId: 'cat_1', isActive: true, createdAt: new Date('2026-01-15').toISOString(), images: ['https://picsum.photos/seed/prod-1/640/640'], rating: 4.6, reviewCount: 128, isFeatured: true, description: 'Over-ear wireless headphones with adaptive noise cancelling, 40 hour battery life and multipoint Bluetooth 5.3.' },
  { id: 'prod_2', name: 'Nimbus 14 Ultrabook', price: 1249.0, stock: 18, category: 'Electronics', categoryId: 'cat_1', isActive: true, createdAt: new Date('2026-02-01').toISOString(), images: ['https://picsum.photos/seed/prod-2/640/640'], rating: 4.7, reviewCount: 96, isFeatured: true, description: 'A 14 inch ultrabook with a 2.8K OLED display, 32GB RAM and a fanless aluminium chassis.' },
  { id: 'prod_3', name: 'Pulse Smart Watch Series 6', price: 249.0, stock: 65, category: 'Electronics', categoryId: 'cat_1', isActive: true, createdAt: new Date('2026-02-10').toISOString(), images: ['https://picsum.photos/seed/prod-3/640/640'], rating: 4.4, reviewCount: 210, isFeatured: true, description: 'Fitness focused smart watch with continuous heart rate tracking, sleep analysis and 7 day battery.' },
  { id: 'prod_4', name: 'Linen Blend Overshirt', price: 89.0, stock: 54, category: 'Fashion', categoryId: 'cat_2', isActive: true, createdAt: new Date('2026-02-20').toISOString(), images: ['https://picsum.photos/seed/prod-4/640/640'], rating: 4.5, reviewCount: 87, isFeatured: true, description: 'Relaxed fit overshirt in a breathable linen blend, garment washed for softness.' },
  { id: 'prod_5', name: 'Cast Iron Dutch Oven', price: 94.0, stock: 40, category: 'Home & Kitchen', categoryId: 'cat_3', isActive: true, createdAt: new Date('2026-03-01').toISOString(), images: ['https://picsum.photos/seed/prod-5/640/640'], rating: 4.8, reviewCount: 268, isFeatured: true, description: 'Pre-seasoned cast iron dutch oven that works on the hob, in the oven and over a campfire.' },
  { id: 'prod_6', name: 'Adjustable Kettlebell 12-32kg', price: 219.0, stock: 16, category: 'Sports', categoryId: 'cat_4', isActive: true, createdAt: new Date('2026-03-10').toISOString(), images: ['https://picsum.photos/seed/prod-6/640/640'], rating: 4.7, reviewCount: 165, isFeatured: true, description: 'Six weight settings in one compact dial, ideal for home strength training.' },
  { id: 'prod_7', name: 'Vitamin C Brightening Serum', price: 34.0, stock: 120, category: 'Beauty', categoryId: 'cat_5', isActive: true, createdAt: new Date('2026-03-15').toISOString(), images: ['https://picsum.photos/seed/prod-7/640/640'], rating: 4.4, reviewCount: 143, isFeatured: true, description: 'Stabilised 15% vitamin C serum that visibly evens tone and softens fine lines.' },
  { id: 'prod_8', name: 'The Pragmatic Engineer', price: 32.0, stock: 48, category: 'Books', categoryId: 'cat_6', isActive: true, createdAt: new Date('2026-03-20').toISOString(), images: ['https://picsum.photos/seed/prod-8/640/640'], rating: 4.7, reviewCount: 412, isFeatured: true, description: 'A field guide to building reliable systems and making sound technical trade-offs.' },
];

export { products };

export const getAll = (_req: Request, res: Response) => {
  res.json({ success: true, message: `${products.length} product(s) found`, data: products });
};

export const getById = (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
};

export const getFeatured = (_req: Request, res: Response) => {
  const featured = products.filter(p => p.isFeatured).slice(0, 8);
  res.json({ success: true, data: featured });
};

export const getPopular = (_req: Request, res: Response) => {
  const sorted = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8);
  res.json({ success: true, data: sorted });
};

export const getRecent = (_req: Request, res: Response) => {
  const sorted = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
  res.json({ success: true, data: sorted });
};

export const search = (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  ).slice(0, 8);
  res.json({ success: true, data: filtered });
};

export const getRelated = (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.json({ success: true, data: [] });
  const related = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
  res.json({ success: true, data: related });
};
import { Request, Response } from 'express';

let categories = [
  { id: 'cat_1', name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, audio and smart home devices.', image: 'https://picsum.photos/seed/electronics/640/640', isActive: true, createdAt: new Date('2026-01-01').toISOString() },
  { id: 'cat_2', name: 'Fashion', slug: 'fashion', description: 'Clothing, footwear and everyday accessories.', image: 'https://picsum.photos/seed/fashion/640/640', isActive: true, createdAt: new Date('2026-01-02').toISOString() },
  { id: 'cat_3', name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Furniture, cookware and home organisation.', image: 'https://picsum.photos/seed/home-kitchen/640/640', isActive: true, createdAt: new Date('2026-01-03').toISOString() },
  { id: 'cat_4', name: 'Sports', slug: 'sports', description: 'Fitness, outdoor and team sport equipment.', image: 'https://picsum.photos/seed/sports/640/640', isActive: true, createdAt: new Date('2026-01-04').toISOString() },
  { id: 'cat_5', name: 'Beauty', slug: 'beauty', description: 'Skincare, haircare and personal care essentials.', image: 'https://picsum.photos/seed/beauty/640/640', isActive: true, createdAt: new Date('2026-01-05').toISOString() },
  { id: 'cat_6', name: 'Books', slug: 'books', description: 'Fiction, technical and educational titles.', image: 'https://picsum.photos/seed/books/640/640', isActive: true, createdAt: new Date('2026-01-06').toISOString() },
];

export const getAll = (_req: Request, res: Response) => {
  res.json({ success: true, message: `${categories.length} category(ies) found`, data: categories });
};

export const getBySlug = (req: Request, res: Response) => {
  const category = categories.find(c => c.slug === req.params.slug);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
};

export const create = (req: Request, res: Response) => {
  const category = {
    id: `cat_${Date.now().toString(36)}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  categories = [category, ...categories];
  res.status(201).json({ success: true, message: 'Category created', data: category });
};

export const update = (req: Request, res: Response) => {
  const idx = categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Category not found' });
  categories[idx] = { ...categories[idx], ...req.body };
  res.json({ success: true, message: 'Category updated', data: categories[idx] });
};

export const remove = (req: Request, res: Response) => {
  categories = categories.filter(c => c.id !== req.params.id);
  res.status(204).send();
};

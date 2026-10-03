/**
 * ---------------------------------------------------------------------------
 * TEMPORARY DEV DATA - NOT PRODUCTION DATA
 * ---------------------------------------------------------------------------
 * This module only exists so the frontend is fully usable before the backend is
 * wired up. It is imported exclusively by src/services/dev/index.ts, which the
 * service modules delegate to when no VITE_API_URL is configured.
 *
 * To replace it: implement the REST endpoints and delete src/services/dev.
 */
import type { Category, Order, OrderItem, Product, Review, User } from '../../types';
import { generateSlug } from '../../utils';

const DAY = 24 * 60 * 60 * 1000;
const BASE_DATE = new Date('2026-01-15T09:00:00.000Z').getTime();

/** Deterministic "days ago" timestamp so the dataset never changes at runtime. */
export function daysAgo(days: number): string {
  return new Date(BASE_DATE - days * DAY).toISOString();
}

/** Remote placeholder artwork with a deterministic seed per product. */
export function placeholderImage(seed: string, size = 640): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
}

/* -------------------------------------------------------------------------- */
/*                                 Categories                                 */
/* -------------------------------------------------------------------------- */

export const devCategories: Category[] = [
  {
    id: 'cat_1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, laptops, audio and smart home devices.',
    image: placeholderImage('electronics'),
    isActive: true,
    createdAt: daysAgo(200),
  },
  {
    id: 'cat_2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, footwear and everyday accessories.',
    image: placeholderImage('fashion'),
    isActive: true,
    createdAt: daysAgo(190),
  },
  {
    id: 'cat_3',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Furniture, cookware and home organisation.',
    image: placeholderImage('home-kitchen'),
    isActive: true,
    createdAt: daysAgo(180),
  },
  {
    id: 'cat_4',
    name: 'Sports',
    slug: 'sports',
    description: 'Fitness, outdoor and team sport equipment.',
    image: placeholderImage('sports'),
    isActive: true,
    createdAt: daysAgo(170),
  },
  {
    id: 'cat_5',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare, haircare and personal care essentials.',
    image: placeholderImage('beauty'),
    isActive: true,
    createdAt: daysAgo(160),
  },
  {
    id: 'cat_6',
    name: 'Books',
    slug: 'books',
    description: 'Fiction, technical and educational titles.',
    image: placeholderImage('books'),
    isActive: true,
    createdAt: daysAgo(150),
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Products                                  */
/* -------------------------------------------------------------------------- */

type ProductSeed = [
  name: string,
  price: number,
  compareAtPrice: number | null,
  categorySlug: string,
  brand: string,
  stock: number,
  rating: number,
  reviewCount: number,
  featured: boolean,
  ageInDays: number,
  description: string,
];

const PRODUCT_SEED: ProductSeed[] = [
  ['Aurora Wireless Headphones', 189.99, 249.99, 'electronics', 'Aurora', 42, 4.6, 128, true, 12,
    'Over-ear wireless headphones with adaptive noise cancelling, 40 hour battery life and multipoint Bluetooth 5.3.'],
  ['Nimbus 14 Ultrabook', 1249.0, 1399.0, 'electronics', 'Nimbus', 18, 4.7, 96, true, 20,
    'A 14 inch ultrabook with a 2.8K OLED display, 32GB RAM and a fanless aluminium chassis.'],
  ['Pulse Smart Watch Series 6', 249.0, null, 'electronics', 'Pulse', 65, 4.4, 210, true, 8,
    'Fitness focused smart watch with continuous heart rate tracking, sleep analysis and 7 day battery.'],
  ['Vertex 4K Action Camera', 329.0, 379.0, 'electronics', 'Vertex', 12, 4.3, 54, false, 40,
    'Waterproof 4K action camera with in-body stabilisation and a wide range of mounts.'],
  ['Halo Bluetooth Speaker', 79.99, 99.99, 'electronics', 'Halo', 88, 4.2, 143, false, 33,
    'Portable speaker with 360 degree sound, 20 hour playtime and IP67 water resistance.'],
  ['Orbit Smart Home Hub', 129.0, null, 'electronics', 'Orbit', 27, 4.1, 61, false, 55,
    'Central hub for Matter compatible smart home devices with local automation support.'],
  ['Linen Blend Overshirt', 89.0, 120.0, 'fashion', 'Northline', 54, 4.5, 87, true, 26,
    'Relaxed fit overshirt in a breathable linen blend, garment washed for softness.'],
  ['Everyday Leather Sneakers', 129.0, null, 'fashion', 'Northline', 31, 4.6, 175, false, 44,
    'Full grain leather sneakers with a cushioned cork footbed and stitched rubber sole.'],
  ['Merino Crew Socks (3 Pack)', 29.0, 42.0, 'fashion', 'Field', 210, 4.7, 302, false, 61,
    'Temperature regulating merino wool socks with a reinforced heel and toe.'],
  ['Canvas Weekender Bag', 145.0, null, 'fashion', 'Field', 22, 4.4, 74, false, 70,
    'Waxed canvas weekender with leather handles and an internal laptop sleeve.'],
  ['Cast Iron Dutch Oven', 94.0, 115.0, 'home-kitchen', 'Hearth', 40, 4.8, 268, true, 15,
    'Pre-seasoned cast iron dutch oven that works on the hob, in the oven and over a campfire.'],
  ['Bamboo Cutting Board Set', 46.0, null, 'home-kitchen', 'Hearth', 76, 4.5, 132, false, 38,
    'Three piece bamboo board set with juice grooves and a recessed side handles.'],
  ['Stoneware Dinner Set (12 pc)', 168.0, 210.0, 'home-kitchen', 'Hearth', 19, 4.3, 58, false, 49,
    'Twelve piece glazed stoneware set, dishwasher and microwave safe.'],
  ['Aroma Espresso Machine', 349.0, 429.0, 'home-kitchen', 'Crema', 9, 4.6, 211, true, 6,
    'Semi automatic espresso machine with a 15 bar pump and integrated milk frother.'],
  ['Performance Training Tee', 38.0, null, 'sports', 'Kinetic', 140, 4.4, 98, false, 24,
    'Moisture wicking training tee with four way stretch and flatlock seams.'],
  ['Adjustable Kettlebell 12-32kg', 219.0, 259.0, 'sports', 'Kinetic', 16, 4.7, 165, true, 18,
    'Six weight settings in one compact dial, ideal for home strength training.'],
  ['Trail Running Backpack 22L', 118.0, null, 'sports', 'Ridgeline', 33, 4.6, 89, false, 52,
    'Lightweight hydration pack with a bounce free fit and quick access side pockets.'],
  ['Yoga Mat Pro 6mm', 68.0, 85.0, 'sports', 'Kinetic', 71, 4.5, 191, false, 67,
    'High density natural rubber mat with a textured, slip resistant surface.'],
  ['Vitamin C Brightening Serum', 34.0, 45.0, 'beauty', 'Lumière', 120, 4.4, 143, true, 9,
    'Stabilised 15% vitamin C serum that visibly evens tone and softens fine lines.'],
  ['Hydrating Gel Cleanser', 24.0, null, 'beauty', 'Lumière', 210, 4.6, 256, false, 29,
    'Soap free gel cleanser that removes makeup without stripping the skin barrier.'],
  ['Matte Velvet Lipstick', 19.0, 25.0, 'beauty', 'Lumière', 95, 4.2, 87, false, 58,
    'Long wear matte lipstick with a weightless, non drying formula.'],
  ['The Pragmatic Engineer', 32.0, 42.0, 'books', 'Northstar Press', 48, 4.7, 412, true, 31,
    'A field guide to building reliable systems and making sound technical trade-offs.'],
  ['Designing Data Pipelines', 45.0, null, 'books', 'Northstar Press', 27, 4.5, 176, false, 47,
    'Patterns for streaming and batch pipelines, with worked examples in modern tooling.'],
  ['Deep Work, Revisited', 28.0, 35.0, 'books', 'Northstar Press', 63, 4.3, 231, false, 73,
    'A practical framework for protecting focused time in knowledge driven work.'],
];

function buildProducts(): Product[] {
  return PRODUCT_SEED.map((seed, index) => {
    const [name, price, compareAtPrice, categorySlug, brand, stock, rating, reviewCount, featured, ageInDays, description] =
      seed;
    const category = devCategories.find((item) => item.slug === categorySlug)!;
    const slug = generateSlug(name);
    return {
      id: `prod_${index + 1}`,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      images: [
        placeholderImage(`${slug}-1`),
        placeholderImage(`${slug}-2`),
        placeholderImage(`${slug}-3`),
      ],
      categoryId: category.id,
      category,
      brand,
      sku: `SKU-${String(index + 1).padStart(4, '0')}`,
      stock,
      rating,
      reviewCount,
      isFeatured: featured,
      isActive: true,
      tags: [category.slug, brand.toLowerCase()],
      createdAt: daysAgo(ageInDays),
    };
  });
}

export const devProducts: Product[] = buildProducts();

/* -------------------------------------------------------------------------- */
/*                                   Users                                    */
/* -------------------------------------------------------------------------- */

export const devUsers: User[] = [
  {
    id: 'user_1',
    name: 'Demo Customer',
    email: 'customer@demo.com',
    role: 'customer',
    isActive: true,
    phone: '+1 555 0142',
    createdAt: daysAgo(120),
    addresses: [
      {
        id: 'addr_1',
        firstName: 'Demo',
        lastName: 'Customer',
        addressLine1: '221B Baker Street',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'United States',
        phone: '+1 555 0142',
        isDefault: true,
      },
    ],
  },
  {
    id: 'user_2',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    role: 'admin',
    isActive: true,
    createdAt: daysAgo(300),
  },
  {
    id: 'user_3',
    name: 'Priya Raman',
    email: 'priya@example.com',
    role: 'customer',
    isActive: true,
    createdAt: daysAgo(88),
  },
  {
    id: 'user_4',
    name: 'Marcus Bell',
    email: 'marcus@example.com',
    role: 'customer',
    isActive: false,
    createdAt: daysAgo(64),
  },
  {
    id: 'user_5',
    name: 'Lena Fischer',
    email: 'lena@example.com',
    role: 'customer',
    isActive: true,
    createdAt: daysAgo(41),
  },
];

/** Passwords live only inside this dev file, never in Redux or storage. */
export const DEV_CREDENTIALS: Record<string, string> = {
  'customer@demo.com': 'customer123',
  'admin@demo.com': 'admin123',
};

/* -------------------------------------------------------------------------- */
/*                                   Reviews                                  */
/* -------------------------------------------------------------------------- */

const REVIEW_SEED: Array<[productIndex: number, userId: string, rating: number, title: string, comment: string, ageInDays: number]> = [
  [0, 'user_1', 5, 'Excellent noise cancelling', 'I use these on a 40 minute commute and the noise cancelling is genuinely impressive. Battery easily lasts a week with daily use.', 5],
  [0, 'user_3', 4, 'Great sound, snug fit', 'Sound quality is excellent for the price. They run a little tight after a few hours, so consider sizing up.', 12],
  [1, 'user_5', 5, 'Impressive build quality', 'The display is superb and it stays completely silent under load. Battery lasts a full working day.', 20],
  [1, 'user_1', 4, 'Excellent, minor gripe', 'Fantastic laptop. Only wish the ports were more generous out of the box.', 27],
  [2, 'user_3', 4, 'Solid fitness watch', 'Sleep and heart rate data are accurate enough to be useful. Menu navigation is a little slow.', 9],
  [10, 'user_5', 5, 'Kitchen workhorse', 'Heats evenly and the lid is genuinely airtight. Worth every penny.', 15],
  [15, 'user_1', 5, 'Replaced three sets of dumbbells', 'One dial, six weights, tiny footprint. Exactly what a small gym needs.', 18],
  [18, 'user_3', 4, 'Noticeable difference', 'Three weeks in and my skin is noticeably brighter. Packaging could be better.', 9],
  [21, 'user_1', 5, 'Still the best book on the topic', 'Dense, practical and free of fluff. I have recommended it to my whole team.', 31],
];

export const devReviews: Review[] = REVIEW_SEED.map((row, index) => {
  const [productIndex, userId, rating, title, comment, ageInDays] = row;
  const product = devProducts[productIndex];
  const user = devUsers.find((item) => item.id === userId);
  return {
    id: `rev_${index + 1}`,
    productId: product.id,
    userId,
    user: user
      ? { id: user.id, name: user.name, email: user.email, role: user.role }
      : undefined,
    rating,
    title,
    comment,
    isApproved: true,
    createdAt: daysAgo(ageInDays),
  };
});

/* -------------------------------------------------------------------------- */
/*                                   Orders                                   */
/* -------------------------------------------------------------------------- */

function buildOrderItems(rows: Array<[productIndex: number, quantity: number]>): OrderItem[] {
  return rows.map(([productIndex, quantity], index) => {
    const product = devProducts[productIndex];
    return {
      id: `item_${index + 1}`,
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity,
      total: Math.round(product.price * quantity * 100) / 100,
    };
  });
}

const ORDER_SEED: Array<{
  id: string;
  userId: string;
  status: Order['status'];
  paymentStatus: Order['paymentStatus'];
  ageInDays: number;
  items: Array<[number, number]>;
  trackingNumber?: string;
}> = [
  { id: 'order_1', userId: 'user_1', status: 'delivered', paymentStatus: 'paid', ageInDays: 34, items: [[0, 1], [10, 1]], trackingNumber: 'TRK-88213' },
  { id: 'order_2', userId: 'user_1', status: 'shipped', paymentStatus: 'paid', ageInDays: 6, items: [[21, 2]], trackingNumber: 'TRK-90041' },
  { id: 'order_3', userId: 'user_1', status: 'processing', paymentStatus: 'paid', ageInDays: 2, items: [[15, 1], [18, 2]] },
  { id: 'order_4', userId: 'user_1', status: 'cancelled', paymentStatus: 'refunded', ageInDays: 12, items: [[4, 1]] },
  { id: 'order_5', userId: 'user_3', status: 'delivered', paymentStatus: 'paid', ageInDays: 9, items: [[1, 1], [5, 1]], trackingNumber: 'TRK-87771' },
  { id: 'order_6', userId: 'user_5', status: 'pending', paymentStatus: 'pending', ageInDays: 1, items: [[11, 2], [13, 1]] },
];

const DEV_SHIPPING_ADDRESS = devUsers[0].addresses![0];

export const devOrders: Order[] = ORDER_SEED.map((seed, index) => {
  const items = buildOrderItems(seed.items);
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const user = devUsers.find((item) => item.id === seed.userId);
  return {
    id: seed.id,
    orderNumber: `ORD-${1000 + index + 1}`,
    userId: seed.userId,
    user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : undefined,
    items,
    shippingAddress: DEV_SHIPPING_ADDRESS,
    paymentMethod: index % 2 === 0 ? 'card' : 'cod',
    paymentStatus: seed.paymentStatus,
    status: seed.status,
    subtotal,
    tax,
    shipping,
    discount: 0,
    total: Math.round((subtotal + tax + shipping) * 100) / 100,
    trackingNumber: seed.trackingNumber,
    createdAt: daysAgo(seed.ageInDays),
    updatedAt: daysAgo(Math.max(seed.ageInDays - 2, 0)),
    deliveredAt: seed.status === 'delivered' ? daysAgo(Math.max(seed.ageInDays - 5, 0)) : undefined,
    cancelledAt: seed.status === 'cancelled' ? daysAgo(seed.ageInDays - 1) : undefined,
  };
});

/* -------------------------------------------------------------------------- */
/*                             Marketing content                              */
/* -------------------------------------------------------------------------- */

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discount: string;
  image: string;
  tone: 'dark' | 'brand';
}

export const devPromoBanners: PromoBanner[] = [
  {
    id: 'promo_1',
    title: 'Up to 40% off seasonal tech',
    subtitle: 'Limited time across audio, wearables and laptops.',
    code: 'SAVE40',
    discount: '40%',
    image: placeholderImage('promo-tech'),
    tone: 'dark',
  },
  {
    id: 'promo_2',
    title: 'Free shipping over $100',
    subtitle: 'Applies automatically at checkout on every order.',
    code: 'FREESHIP',
    discount: 'FREE',
    image: placeholderImage('promo-ship'),
    tone: 'brand',
  },
];

export const devHero = {
  title: 'Everything you need, delivered today',
  subtitle:
    'Enterprise grade catalogue quality, transparent pricing and next day delivery on thousands of curated products.',
  image: placeholderImage('hero-banner', 1200),
  cta: { label: 'Shop the catalogue', to: '/products' },
  secondaryCta: { label: 'Browse categories', to: '/products' },
};

export const devTestimonials = [
  {
    id: 't1',
    name: 'Priya Raman',
    quote: 'Ordering was effortless and the delivery tracking updates were spot on.',
  },
  {
    id: 't2',
    name: 'Marcus Bell',
    quote: 'Returns were processed in a day. Genuinely impressed with the support team.',
  },
];
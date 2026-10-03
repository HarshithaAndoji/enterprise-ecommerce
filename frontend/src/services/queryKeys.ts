import type { ID, ProductFilters } from '../types';

/**
 * Centralised TanStack Query keys. Keeping them here prevents the classic
 * "invalidate a slightly different key" bug after a mutation.
 */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    detail: (id: ID) => ['products', 'detail', id] as const,
    featured: () => ['products', 'featured'] as const,
    popular: () => ['products', 'popular'] as const,
    recent: () => ['products', 'recent'] as const,
    related: (id: ID) => ['products', 'related', id] as const,
    search: (query: string) => ['products', 'search', query] as const,
  },
  categories: {
    all: ['categories'] as const,
    detail: (slug: string) => ['categories', 'detail', slug] as const,
  },
  cart: {
    all: ['cart'] as const,
  },
  wishlist: {
    all: ['wishlist'] as const,
    check: (productId: ID) => ['wishlist', 'check', productId] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: () => ['orders', 'list'] as const,
    detail: (id: ID) => ['orders', 'detail', id] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    byProduct: (productId: ID) => ['reviews', 'product', productId] as const,
    admin: () => ['reviews', 'admin'] as const,
  },
  profile: {
    all: ['profile'] as const,
  },
  admin: {
    stats: () => ['admin', 'stats'] as const,
    products: () => ['admin', 'products'] as const,
    categories: () => ['admin', 'categories'] as const,
    users: () => ['admin', 'users'] as const,
    orders: () => ['admin', 'orders'] as const,
    reviews: () => ['admin', 'reviews'] as const,
  },
} as const;

export default queryKeys;
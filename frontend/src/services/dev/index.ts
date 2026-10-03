/**
 * ---------------------------------------------------------------------------
 * TEMPORARY DEV API - IN MEMORY IMPLEMENTATION
 * ---------------------------------------------------------------------------
 * Every method mirrors a real REST call one to one, so swapping this module out
 * for HTTP calls is a one line change inside each src/services/*.api.ts file.
 * State is kept in module scope and resets on a full page reload.
 */
import type {
  ApiResponse,
  Cart,
  CartItem,
  Category,
  CreateOrderPayload,
  CreateReviewPayload,
  DashboardStats,
  ID,
  Order,
  OrderStatus,
  Product,
  ProductFilters,
  Review,
  UpdateProfilePayload,
  UpdateReviewPayload,
  User,
} from '../../types';
import { calculateCartTotals, generateSlug, roundMoney } from '../../utils';
import { getAuthToken, getStoredUser } from '../api';
import {
  DEV_CREDENTIALS,
  daysAgo,
  devCategories,
  devOrders,
  devProducts,
  devReviews,
  devUsers,
  placeholderImage,
} from './mockData';

/* -------------------------------------------------------------------------- */
/*                                Mutable state                               */
/* -------------------------------------------------------------------------- */

let products: Product[] = devProducts.map((product) => ({ ...product }));
let categories: Category[] = devCategories.map((category) => ({ ...category }));
let users: User[] = devUsers.map((user) => ({ ...user }));
let reviews: Review[] = devReviews.map((review) => ({ ...review }));
let orders: Order[] = devOrders.map((order) => ({ ...order }));
let cartItems: CartItem[] = [];
let wishlistIds: ID[] = ['prod_10', 'prod_21'];

const LATENCY = 350;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });
}

function fail(message: string, status = 400): Error {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

function buildPaginationMeta(total: number, page = 1, limit = 12) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/**
 * Resolves the dev user for the token currently held in localStorage.
 *
 * Tokens minted while talking to the real backend carry no JWT
 * (`mock_token_<id>` / `dev_token_<id>`), and a user that only exists on the
 * server is not part of the seed data. Both cases are handled so cart, wishlist
 * and order screens keep working when `VITE_API_URL` is configured.
 */
function currentUser(): User {
  const token = getAuthToken();
  const id = token?.replace(/^(dev_token_|mock_token_)/, '') ?? '';
  const seeded = users.find((user) => user.id === id);
  if (seeded) return seeded;

  // A user created through POST /users/register only exists in localStorage.
  const stored = getStoredUser<User>();
  if (stored?.email) {
    const known = users.find(
      (user) => user.email.toLowerCase() === stored.email.toLowerCase(),
    );
    if (known) return { ...known, ...stored, id: known.id };
    users = [...users, stored];
  }

  return users[0];
}

function sortProducts(list: Product[], sort?: ProductFilters['sort']): Product[] {
  const sorted = [...list];
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'popular':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    case 'newest':
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Auth                                    */
/* -------------------------------------------------------------------------- */

const auth = {
  async login(email: string, password: string) {
    const expected = DEV_CREDENTIALS[email.toLowerCase()];
    if (!expected || expected !== password) {
      throw fail('Invalid email or password.', 401);
    }
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user) throw fail('Invalid email or password.', 401);
    if (!user.isActive) throw fail('This account has been deactivated.', 403);
    return delay({ user, token: `dev_token_${user.id}` }, 450);
  },

  async register(name: string, email: string, _password: string) {
    const normalized = email.toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === normalized)) {
      throw fail('An account with this email already exists.', 409);
    }
    const user: User = {
      id: `user_${users.length + 1}_${Date.now().toString(36)}`,
      name,
      email: normalized,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    users = [...users, user];
    return delay({ user, token: `dev_token_${user.id}` }, 500);
  },

  async getProfile() {
    return delay(currentUser(), 250);
  },

  async updateProfile(data: UpdateProfilePayload) {
    const user = currentUser();
    const updated: User = {
      ...user,
      ...data,
      id: user.id,
      role: user.role,
      isActive: user.isActive,
    };
    users = users.map((item) => (item.id === updated.id ? updated : item));
    return delay(updated, 400);
  },

  async forgotPassword(email: string) {
    const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    // Never reveal whether the account exists.
    if (!exists) await delay(null, 350);
    return delay(undefined, 350);
  },

  async resetPassword(_token: string, _password: string) {
    return delay(undefined, 400);
  },
};

/* -------------------------------------------------------------------------- */
/*                                  Products                                  */
/* -------------------------------------------------------------------------- */

function filterProducts(filters: ProductFilters): Product[] {
  const search = filters.search?.trim().toLowerCase();
  return products
    .filter((product) => product.isActive)
    .filter((product) => {
      if (!search) return true;
      return (
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        (product.brand ?? '').toLowerCase().includes(search) ||
        (product.tags ?? []).some((tag) => tag.includes(search))
      );
    })
    .filter((product) => {
      if (filters.categoryId) return product.categoryId === filters.categoryId;
      if (filters.categorySlug) return product.category?.slug === filters.categorySlug;
      return true;
    })
    .filter((product) =>
      filters.minPrice === undefined ? true : product.price >= filters.minPrice,
    )
    .filter((product) =>
      filters.maxPrice === undefined ? true : product.price <= filters.maxPrice,
    )
    .filter((product) =>
      filters.rating === undefined ? true : product.rating >= filters.rating,
    )
    .filter((product) => (filters.inStock ? product.stock > 0 : true))
    .filter((product) => (filters.isFeatured ? product.isFeatured : true));
}

const productsApi = {
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    const { page = 1, limit = 12 } = filters;
    const filtered = sortProducts(filterProducts(filters), filters.sort);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    return delay({
      success: true,
      message: `${filtered.length} product(s) found`,
      data,
      pagination: buildPaginationMeta(filtered.length, page, limit),
    });
  },

  async getProduct(id: string): Promise<Product> {
    const product = products.find(
      (item) => item.id === id || item.slug === generateSlug(id),
    );
    if (!product) throw fail('Product not found.', 404);
    return delay(product);
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return delay(
      sortProducts(
        products.filter((product) => product.isFeatured),
        'rating',
      ).slice(0, 8),
    );
  },

  async getPopularProducts(): Promise<Product[]> {
    return delay(sortProducts(products, 'popular').slice(0, 8));
  },

  async getRecentlyAdded(): Promise<Product[]> {
    return delay(sortProducts(products, 'newest').slice(0, 8));
  },

  async searchProducts(query: string): Promise<Product[]> {
    return delay(filterProducts({ search: query }).slice(0, 8));
  },

  async getRelatedProducts(id: string): Promise<Product[]> {
    const source = products.find((item) => item.id === id || item.slug === id);
    if (!source) return delay([]);
    return delay(
      products
        .filter((product) => product.id !== source.id && product.categoryId === source.categoryId)
        .slice(0, 4),
    );
  },
};

/* -------------------------------------------------------------------------- */
/*                                 Categories                                 */
/* -------------------------------------------------------------------------- */

const categoriesApi = {
  async getCategories(): Promise<Category[]> {
    return delay(
      categories.map((category) => ({
        ...category,
        productCount: products.filter((product) => product.categoryId === category.id).length,
      })),
    );
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = categories.find((item) => item.slug === slug);
    if (!category) throw fail('Category not found.', 404);
    return delay({
      ...category,
      productCount: products.filter((product) => product.categoryId === category.id).length,
    });
  },
};

/* -------------------------------------------------------------------------- */
/*                                    Cart                                    */
/* -------------------------------------------------------------------------- */

function buildCart(): Cart {
  const totals = calculateCartTotals(cartItems);
  return {
    id: 'cart_dev',
    items: cartItems,
    subtotal: totals.subtotal,
    tax: totals.tax,
    shipping: totals.shipping,
    discount: totals.discount,
    total: totals.total,
    updatedAt: new Date().toISOString(),
  };
}

const cartApi = {
  async getCart(): Promise<Cart> {
    return delay(buildCart(), 250);
  },

  async addToCart(productId: string, quantity = 1): Promise<Cart> {
    const product = products.find((item) => item.id === productId);
    if (!product) throw fail('Product not found.', 404);
    if (product.stock < quantity) throw fail('Not enough stock available.', 409);

    const existing = cartItems.find((item) => item.productId === productId);
    if (existing) {
      const next = existing.quantity + quantity;
      if (next > product.stock) throw fail('Not enough stock available.', 409);
      cartItems = cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity: next } : item,
      );
    } else {
      cartItems = [
        ...cartItems,
        { id: `cart_item_${productId}`, productId, quantity, product, price: product.price },
      ];
    }
    products = products.map((item) =>
      item.id === productId ? { ...item, stock: item.stock - quantity } : item,
    );
    return delay(buildCart());
  },

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    const item = cartItems.find((entry) => entry.id === itemId);
    if (!item) throw fail('Cart item not found.', 404);
    if (quantity <= 0) {
      cartItems = cartItems.filter((entry) => entry.id !== itemId);
      return delay(buildCart());
    }
    if (quantity > item.product.stock) throw fail('Not enough stock available.', 409);
    cartItems = cartItems.map((entry) =>
      entry.id === itemId ? { ...entry, quantity } : entry,
    );
    return delay(buildCart());
  },

  async removeCartItem(itemId: string): Promise<Cart> {
    cartItems = cartItems.filter((item) => item.id !== itemId);
    return delay(buildCart());
  },

  async clearCart(): Promise<void> {
    cartItems = [];
    return delay(undefined, 250);
  },
};

/* -------------------------------------------------------------------------- */
/*                                  Wishlist                                  */
/* -------------------------------------------------------------------------- */

const wishlistApi = {
  async getWishlist(): Promise<Product[]> {
    return delay(products.filter((product) => wishlistIds.includes(product.id)));
  },

  async addToWishlist(productId: string): Promise<Product[]> {
    if (!wishlistIds.includes(productId)) wishlistIds = [...wishlistIds, productId];
    return delay(products.filter((product) => wishlistIds.includes(product.id)));
  },

  async removeFromWishlist(productId: string): Promise<Product[]> {
    wishlistIds = wishlistIds.filter((id) => id !== productId);
    return delay(products.filter((product) => wishlistIds.includes(product.id)));
  },

  async checkWishlist(productId: string): Promise<boolean> {
    return delay(wishlistIds.includes(productId), 120);
  },
};

/* -------------------------------------------------------------------------- */
/*                                   Orders                                   */
/* -------------------------------------------------------------------------- */

function orderFromPayload(payload: CreateOrderPayload): Order {
  const items = payload.items
    .map((entry) => {
      const product = products.find((item) => item.id === entry.productId);
      if (!product) return null;
      return {
        id: `item_${product.id}_${entry.quantity}`,
        productId: product.id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        quantity: entry.quantity,
        total: roundMoney(product.price * entry.quantity),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (items.length === 0) throw fail('Your cart is empty.', 400);

  const cartLike: CartItem[] = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
    product: products.find((product) => product.id === item.productId)!,
  }));
  const totals = calculateCartTotals(cartLike);
  const user = currentUser();
  const id = `order_${orders.length + 1}_${Date.now().toString(36)}`;

  const order: Order = {
    id,
    orderNumber: `ORD-${1000 + orders.length + 1}`,
    userId: user.id,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    items,
    shippingAddress: payload.shippingAddress,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'paid',
    status: 'confirmed',
    subtotal: totals.subtotal,
    tax: totals.tax,
    shipping: totals.shipping,
    discount: totals.discount,
    total: totals.total,
    notes: payload.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders = [order, ...orders];
  cartItems = [];
  return order;
}

const ordersApi = {
  async getOrders(): Promise<Order[]> {
    const user = currentUser();
    return delay(orders.filter((order) => order.userId === user.id || user.role === 'admin'), 300);
  },

  async getOrder(id: string): Promise<Order> {
    const order = orders.find((item) => item.id === id);
    if (!order) throw fail('Order not found.', 404);
    return delay(order);
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    return delay(orderFromPayload(payload), 700);
  },

  async cancelOrder(id: string): Promise<Order> {
    const order = orders.find((item) => item.id === id);
    if (!order) throw fail('Order not found.', 404);
    if (order.status === 'delivered') {
      throw fail('Delivered orders cannot be cancelled.', 409);
    }
    const cancelled: Order = {
      ...order,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders = orders.map((item) => (item.id === id ? cancelled : item));
    return delay(cancelled, 400);
  },
};

/* -------------------------------------------------------------------------- */
/*                                   Reviews                                  */
/* -------------------------------------------------------------------------- */

const reviewsApi = {
  async getProductReviews(productId: string): Promise<Review[]> {
    return delay(
      reviews
        .filter((review) => review.productId === productId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      300,
    );
  },

  async createReview(productId: string, payload: CreateReviewPayload): Promise<Review> {
    const user = currentUser();
    const review: Review = {
      id: `rev_${reviews.length + 1}_${Date.now().toString(36)}`,
      productId,
      userId: user.id,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };
    reviews = [review, ...reviews];
    products = products.map((product) => {
      if (product.id !== productId) return product;
      const count = product.reviewCount + 1;
      const rating = roundMoney((product.rating * product.reviewCount + payload.rating) / count);
      return { ...product, reviewCount: count, rating };
    });
    return delay(review, 500);
  },

  async updateReview(id: string, payload: UpdateReviewPayload): Promise<Review> {
    const review = reviews.find((item) => item.id === id);
    if (!review) throw fail('Review not found.', 404);
    const updated: Review = { ...review, ...payload, updatedAt: new Date().toISOString() };
    reviews = reviews.map((item) => (item.id === id ? updated : item));
    return delay(updated, 400);
  },

  async deleteReview(id: string): Promise<void> {
    reviews = reviews.filter((review) => review.id !== id);
    return delay(undefined, 350);
  },
};

/* -------------------------------------------------------------------------- */
/*                                    Admin                                   */
/* -------------------------------------------------------------------------- */

const adminApi = {
  async getStats(): Promise<DashboardStats> {
    const revenue = orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
    return delay({
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: roundMoney(revenue),
      lowStockProducts: products.filter((product) => product.stock > 0 && product.stock <= 10)
        .length,
      pendingOrders: orders.filter((order) => order.status === 'pending').length,
      recentOrders: [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
      revenueByMonth: [
        { month: 'Nov', revenue: 18420 },
        { month: 'Dec', revenue: 24180 },
        { month: 'Jan', revenue: roundMoney(revenue) },
      ],
      topProducts: products.slice(0, 5).map((product) => ({
        name: product.name,
        unitsSold: product.reviewCount,
        revenue: roundMoney(product.price * product.reviewCount * 0.35),
      })),
    });
  },

  async getProducts(): Promise<Product[]> {
    return delay(products, 300);
  },

  async createProduct(payload: Partial<Product>): Promise<Product> {
    const name = payload.name?.trim() ?? 'Untitled product';
    const category =
      categories.find((item) => item.id === payload.categoryId) ?? categories[0];
    const product: Product = {
      id: `prod_${products.length + 1}_${Date.now().toString(36)}`,
      name,
      slug: generateSlug(name),
      description: payload.description ?? '',
      price: payload.price ?? 0,
      compareAtPrice: payload.compareAtPrice ?? null,
      images: payload.images?.length
        ? payload.images
        : [placeholderImage(generateSlug(name) || 'product')],
      categoryId: category.id,
      category,
      brand: payload.brand ?? '',
      sku: payload.sku ?? `SKU-${String(products.length + 1).padStart(4, '0')}`,
      stock: payload.stock ?? 0,
      rating: payload.rating ?? 0,
      reviewCount: payload.reviewCount ?? 0,
      isFeatured: payload.isFeatured ?? false,
      isActive: payload.isActive ?? true,
      tags: payload.tags ?? [],
      createdAt: new Date().toISOString(),
    };
    products = [product, ...products];
    return delay(product, 450);
  },

  async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    const existing = products.find((item) => item.id === id);
    if (!existing) throw fail('Product not found.', 404);
    const updated: Product = { ...existing, ...payload, id: existing.id };
    products = products.map((item) => (item.id === id ? updated : item));
    return delay(updated, 400);
  },

  async deleteProduct(id: string): Promise<void> {
    products = products.filter((product) => product.id !== id);
    cartItems = cartItems.filter((item) => item.productId !== id);
    wishlistIds = wishlistIds.filter((wishId) => wishId !== id);
    return delay(undefined, 350);
  },

  async getCategories(): Promise<Category[]> {
    return categoriesApi.getCategories();
  },

  async createCategory(payload: Partial<Category>): Promise<Category> {
    const name = payload.name?.trim() ?? 'New category';
    const category: Category = {
      id: `cat_${categories.length + 1}_${Date.now().toString(36)}`,
      name,
      slug: payload.slug ?? generateSlug(name),
      description: payload.description ?? '',
      image: payload.image ?? placeholderImage(generateSlug(name) || 'category'),
      isActive: payload.isActive ?? true,
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    categories = [...categories, category];
    return delay(category, 400);
  },

  async updateCategory(id: string, payload: Partial<Category>): Promise<Category> {
    const existing = categories.find((item) => item.id === id);
    if (!existing) throw fail('Category not found.', 404);
    const updated: Category = { ...existing, ...payload, id: existing.id };
    categories = categories.map((item) => (item.id === id ? updated : item));
    return delay(updated, 350);
  },

  async deleteCategory(id: string): Promise<void> {
    if (products.some((product) => product.categoryId === id)) {
      throw fail('Move the products in this category before deleting it.', 409);
    }
    categories = categories.filter((category) => category.id !== id);
    return delay(undefined, 300);
  },

  async getUsers(): Promise<User[]> {
    return delay(users, 300);
  },

  async setUserStatus(id: string, isActive: boolean): Promise<User> {
    const existing = users.find((user) => user.id === id);
    if (!existing) throw fail('User not found.', 404);
    const updated: User = { ...existing, isActive };
    users = users.map((user) => (user.id === id ? updated : user));
    return delay(updated, 350);
  },

  async getOrders(): Promise<Order[]> {
    return delay(
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      300,
    );
  },

  async setOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const existing = orders.find((order) => order.id === id);
    if (!existing) throw fail('Order not found.', 404);
    const updated: Order = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
      deliveredAt: status === 'delivered' ? new Date().toISOString() : existing.deliveredAt,
    };
    orders = orders.map((order) => (order.id === id ? updated : order));
    return delay(updated, 350);
  },

  async getReviews(): Promise<Review[]> {
    return delay(reviews, 300);
  },

  async deleteReview(id: string): Promise<void> {
    return reviewsApi.deleteReview(id);
  },
};

export const devApi = {
  auth,
  products: productsApi,
  categories: categoriesApi,
  cart: cartApi,
  wishlist: wishlistApi,
  orders: ordersApi,
  reviews: reviewsApi,
  admin: adminApi,
};

/** Marker used by the README to explain how to retire the dev layer. */
export const devApiReadyToRemove = typeof daysAgo === 'function';
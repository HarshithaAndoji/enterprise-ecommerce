/**
 * Central domain type definitions shared across the application.
 * Every module (services, store, features, pages) imports its types from here.
 */

export type ID = string;

/* -------------------------------------------------------------------------- */
/*                                   Roles                                    */
/* -------------------------------------------------------------------------- */

export type UserRole = 'customer' | 'admin';

export interface Address {
  id?: ID;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  avatarUrl?: string;
  addresses?: Address[];
  createdAt: string;
}

/** Shape of the user summary embedded inside cart/order payloads. */
export type UserSummary = Pick<User, 'id' | 'name' | 'email' | 'role'>;

/* -------------------------------------------------------------------------- */
/*                                 Catalog                                    */
/* -------------------------------------------------------------------------- */

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  isActive?: boolean;
  parentId?: ID | null;
  createdAt?: string;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  categoryId: ID;
  category?: Category;
  brand?: string;
  sku?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  tags?: string[];
  createdAt: string;
}

export interface Review {
  id: ID;
  productId: ID;
  userId: ID;
  user?: UserSummary;
  rating: number;
  title?: string;
  comment: string;
  isApproved?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CreateReviewPayload = Pick<Review, 'rating' | 'comment'> & {
  title?: string;
};

export type UpdateReviewPayload = Partial<CreateReviewPayload>;

/* -------------------------------------------------------------------------- */
/*                                Cart/Wishlist                              */
/* -------------------------------------------------------------------------- */

export interface CartItem {
  id: ID;
  productId: ID;
  quantity: number;
  product: Product;
  price?: number;
}

export interface Cart {
  id: ID;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  updatedAt?: string;
}

export interface Wishlist {
  id: ID;
  userId: ID;
  productIds: ID[];
  items: Product[];
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Orders                                    */
/* -------------------------------------------------------------------------- */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'card' | 'cod' | 'bank_transfer' | 'paypal';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export interface OrderItem {
  id: ID;
  productId: ID;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: ID;
  orderNumber: string;
  userId: ID;
  user?: UserSummary;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface CreateOrderPayload {
  items: Array<{ productId: ID; quantity: number }>;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Auth                                     */
/* -------------------------------------------------------------------------- */

/** Tokens are returned alongside the user so the caller can persist them. */
export interface AuthResult {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  addresses?: Address[];
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/* -------------------------------------------------------------------------- */
/*                              Transport / API                               */
/* -------------------------------------------------------------------------- */

export interface ApiErrorPayload {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
  /** Present on list endpoints so a page component can render pagination. */
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/* -------------------------------------------------------------------------- */
/*                              Query / filters                               */
/* -------------------------------------------------------------------------- */

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'popular', label: 'Most popular' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export interface ProductFilters extends PaginationParams {
  search?: string;
  categoryId?: ID;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sort?: SortOption;
}

/* -------------------------------------------------------------------------- */
/*                                    UI                                      */
/* -------------------------------------------------------------------------- */

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  message: string;
  type: ToastType;
}

export type BadgeTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent';

export interface AdminUser extends User {
  orderCount?: number;
  totalSpent?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
  recentOrders: Order[];
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topProducts: Array<{ name: string; unitsSold: number; revenue: number }>;
}
import type {
  Category,
  DashboardStats,
  Order,
  OrderStatus,
  Product,
  Review,
  User,
} from '../types';
import { apiDelete, apiGet, apiOrMock, apiPatch, apiPost, apiPut } from './api';
import { devApi } from './dev';

/**
 * MISSING BACKEND ENDPOINTS: there is no `/admin` router on the backend. The
 * only user-facing route it exposes is the unprefixed `GET /api/users` stub,
 * which returns `{ message: 'Get all users' }` instead of a user list. Every
 * route used below - `GET /admin/stats`, `GET|POST /admin/products`,
 * `PUT|DELETE /admin/products/:id`, `GET|POST /admin/categories`,
 * `PUT|DELETE /admin/categories/:id`, `GET /admin/users`,
 * `PATCH /admin/users/:id/status`, `GET /admin/orders`,
 * `PATCH /admin/orders/:id/status`, `GET /admin/reviews` and
 * `DELETE /admin/reviews/:id` - answers 404.
 *
 * Every call below therefore resolves through the dev data layer
 * (`USE_MOCK_API` or a `missing` status in `BACKEND_ENDPOINT_STATUS`, see
 * ./api.ts). The HTTP paths stay wired up and activate automatically once the
 * role-protected admin router is added. Route guarding is a second gap: without
 * JWTs the frontend `AdminRoute` is only a client-side check, so the backend
 * still has to enforce roles itself.
 */

/** GET /admin/stats */
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiOrMock<DashboardStats>(
    'GET /admin/stats',
    () => apiGet<DashboardStats>('/admin/stats'),
    () => devApi.admin.getStats(),
  );
}

/* --------------------------------- products -------------------------------- */

export async function getAdminProducts(): Promise<Product[]> {
  return apiOrMock<Product[]>(
    'GET /admin/products',
    () => apiGet<Product[]>('/admin/products'),
    () => devApi.admin.getProducts(),
  );
}

/** POST /admin/products */
export async function createProduct(payload: Partial<Product>): Promise<Product> {
  return apiOrMock<Product>(
    'POST /admin/products',
    () => apiPost<Product>('/admin/products', payload),
    () => devApi.admin.createProduct(payload),
  );
}

/** PUT /admin/products/:id */
export async function updateProduct(
  id: string,
  payload: Partial<Product>,
): Promise<Product> {
  return apiOrMock<Product>(
    'PUT /admin/products/:id',
    () => apiPut<Product>(`/admin/products/${id}`, payload),
    () => devApi.admin.updateProduct(id, payload),
  );
}

/** DELETE /admin/products/:id */
export async function deleteProduct(id: string): Promise<void> {
  return apiOrMock<void>(
    'DELETE /admin/products/:id',
    async () => {
      await apiDelete<void>(`/admin/products/${id}`);
    },
    () => devApi.admin.deleteProduct(id),
  );
}

/* -------------------------------- categories ------------------------------- */

export async function getAdminCategories(): Promise<Category[]> {
  return apiOrMock<Category[]>(
    'GET /admin/categories',
    () => apiGet<Category[]>('/admin/categories'),
    () => devApi.admin.getCategories(),
  );
}

/** POST /admin/categories */
export async function createCategory(payload: Partial<Category>): Promise<Category> {
  return apiOrMock<Category>(
    'POST /admin/categories',
    () => apiPost<Category>('/admin/categories', payload),
    () => devApi.admin.createCategory(payload),
  );
}

/** PUT /admin/categories/:id */
export async function updateCategory(
  id: string,
  payload: Partial<Category>,
): Promise<Category> {
  return apiOrMock<Category>(
    'PUT /admin/categories/:id',
    () => apiPut<Category>(`/admin/categories/${id}`, payload),
    () => devApi.admin.updateCategory(id, payload),
  );
}

/** DELETE /admin/categories/:id */
export async function deleteCategory(id: string): Promise<void> {
  return apiOrMock<void>(
    'DELETE /admin/categories/:id',
    async () => {
      await apiDelete<void>(`/admin/categories/${id}`);
    },
    () => devApi.admin.deleteCategory(id),
  );
}

/* ---------------------------------- users ---------------------------------- */

export async function getAdminUsers(): Promise<User[]> {
  return apiOrMock<User[]>(
    'GET /admin/users',
    () => apiGet<User[]>('/admin/users'),
    () => devApi.admin.getUsers(),
  );
}

/** PATCH /admin/users/:id/status */
export async function setUserStatus(id: string, isActive: boolean): Promise<User> {
  return apiOrMock<User>(
    'PATCH /admin/users/:id/status',
    () => apiPatch<User>(`/admin/users/${id}/status`, { isActive }),
    () => devApi.admin.setUserStatus(id, isActive),
  );
}

/* ---------------------------------- orders --------------------------------- */

export async function getAdminOrders(): Promise<Order[]> {
  return apiOrMock<Order[]>(
    'GET /admin/orders',
    () => apiGet<Order[]>('/admin/orders'),
    () => devApi.admin.getOrders(),
  );
}

/** PATCH /admin/orders/:id/status */
export async function setOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return apiOrMock<Order>(
    'PATCH /admin/orders/:id/status',
    () => apiPatch<Order>(`/admin/orders/${id}/status`, { status }),
    () => devApi.admin.setOrderStatus(id, status),
  );
}

/* --------------------------------- reviews -------------------------------- */

/** GET /admin/reviews */
export async function getReviews(): Promise<Review[]> {
  return apiOrMock<Review[]>(
    'GET /admin/reviews',
    () => apiGet<Review[]>('/admin/reviews'),
    () => devApi.admin.getReviews(),
  );
}

/** DELETE /admin/reviews/:id */
export async function deleteReview(id: string): Promise<void> {
  return apiOrMock<void>(
    'DELETE /admin/reviews/:id',
    async () => {
      await apiDelete<void>(`/admin/reviews/${id}`);
    },
    () => devApi.admin.deleteReview(id),
  );
}

export const adminApi = {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminUsers,
  setUserStatus,
  getAdminOrders,
  setOrderStatus,
  getReviews,
  deleteReview,
};

export default adminApi;
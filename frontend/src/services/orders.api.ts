import type { CreateOrderPayload, Order } from '../types';
import { apiGet, apiOrMock, apiPost } from './api';
import { devApi } from './dev';

const ENDPOINT = '/orders';

/**
 * MISSING BACKEND ENDPOINTS: the `/orders` router does not exist yet -
 * `GET /orders`, `GET /orders/:id`, `POST /orders` and `POST /orders/:id/cancel`
 * all answer 404 today.
 *
 * Every call below therefore resolves through the dev data layer (`USE_MOCK_API`
 * or a `missing` status in `BACKEND_ENDPOINT_STATUS`, see ./api.ts). The HTTP
 * paths stay wired up and activate automatically once the router is added.
 */

/** GET /orders - orders for the signed in user. */
export async function getOrders(): Promise<Order[]> {
  return apiOrMock<Order[]>(
    'GET /orders',
    () => apiGet<Order[]>(ENDPOINT),
    () => devApi.orders.getOrders(),
  );
}

/** GET /orders/:id */
export async function getOrder(id: string): Promise<Order> {
  return apiOrMock<Order>(
    'GET /orders/:id',
    () => apiGet<Order>(`${ENDPOINT}/${id}`),
    () => devApi.orders.getOrder(id),
  );
}

/** POST /orders */
export async function createOrder(data: CreateOrderPayload): Promise<Order> {
  return apiOrMock<Order>(
    'POST /orders',
    () => apiPost<Order>(ENDPOINT, data),
    () => devApi.orders.createOrder(data),
  );
}

/** POST /orders/:id/cancel */
export async function cancelOrder(id: string): Promise<Order> {
  return apiOrMock<Order>(
    'POST /orders/:id/cancel',
    () => apiPost<Order>(`${ENDPOINT}/${id}/cancel`),
    () => devApi.orders.cancelOrder(id),
  );
}

export const ordersApi = { getOrders, getOrder, createOrder, cancelOrder };

export default ordersApi;
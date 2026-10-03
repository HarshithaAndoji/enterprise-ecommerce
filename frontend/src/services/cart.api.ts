import type { Cart } from '../types';
import { apiDelete, apiGet, apiOrMock, apiPatch, apiPost } from './api';
import { devApi } from './dev';

const ENDPOINT = '/cart';

/**
 * MISSING BACKEND ENDPOINTS: the whole `/cart` router does not exist yet -
 * `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`,
 * `DELETE /cart/items/:itemId` and `DELETE /cart` all answer 404 today.
 *
 * Because of that every call below resolves through the dev data layer, either
 * through `USE_MOCK_API` or because the route is registered as `missing` in
 * `BACKEND_ENDPOINT_STATUS` (see ./api.ts). The HTTP paths stay wired up and
 * start being used as soon as the router is registered on the backend, without
 * touching this file.
 */

/** GET /cart */
export async function getCart(): Promise<Cart> {
  return apiOrMock<Cart>(
    'GET /cart',
    () => apiGet<Cart>(ENDPOINT),
    () => devApi.cart.getCart(),
  );
}

/** POST /cart/items */
export async function addToCart(productId: string, quantity = 1): Promise<Cart> {
  return apiOrMock<Cart>(
    'POST /cart/items',
    () => apiPost<Cart>(`${ENDPOINT}/items`, { productId, quantity }),
    () => devApi.cart.addToCart(productId, quantity),
  );
}

/** PATCH /cart/items/:itemId */
export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  return apiOrMock<Cart>(
    'PATCH /cart/items/:itemId',
    () => apiPatch<Cart>(`${ENDPOINT}/items/${itemId}`, { quantity }),
    () => devApi.cart.updateCartItem(itemId, quantity),
  );
}

/** DELETE /cart/items/:itemId */
export async function removeCartItem(itemId: string): Promise<Cart> {
  return apiOrMock<Cart>(
    'DELETE /cart/items/:itemId',
    () => apiDelete<Cart>(`${ENDPOINT}/items/${itemId}`),
    () => devApi.cart.removeCartItem(itemId),
  );
}

/** DELETE /cart */
export async function clearCart(): Promise<void> {
  return apiOrMock<void>(
    'DELETE /cart',
    async () => {
      await apiDelete<void>(ENDPOINT);
    },
    () => devApi.cart.clearCart(),
  );
}

export const cartApi = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };

export default cartApi;
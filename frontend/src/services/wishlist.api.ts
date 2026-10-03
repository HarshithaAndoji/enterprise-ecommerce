import type { Product } from '../types';
import { apiDelete, apiGet, apiOrMock, apiPost } from './api';
import { devApi } from './dev';

const ENDPOINT = '/wishlist';

/**
 * MISSING BACKEND ENDPOINTS: the `/wishlist` router does not exist yet -
 * `GET /wishlist`, `POST /wishlist/:productId`, `DELETE /wishlist/:productId`
 * and `GET /wishlist/:productId` all answer 404 today.
 *
 * Every call below therefore resolves through the dev data layer (`USE_MOCK_API`
 * or a `missing` status in `BACKEND_ENDPOINT_STATUS`, see ./api.ts). The HTTP
 * paths stay wired up and activate automatically once the router is added.
 */

/** GET /wishlist */
export async function getWishlist(): Promise<Product[]> {
  return apiOrMock<Product[]>(
    'GET /wishlist',
    () => apiGet<Product[]>(ENDPOINT),
    () => devApi.wishlist.getWishlist(),
  );
}

/** POST /wishlist/:productId */
export async function addToWishlist(productId: string): Promise<Product[]> {
  return apiOrMock<Product[]>(
    'POST /wishlist/:productId',
    () => apiPost<Product[]>(`${ENDPOINT}/${productId}`),
    () => devApi.wishlist.addToWishlist(productId),
  );
}

/** DELETE /wishlist/:productId */
export async function removeFromWishlist(productId: string): Promise<Product[]> {
  return apiOrMock<Product[]>(
    'DELETE /wishlist/:productId',
    () => apiDelete<Product[]>(`${ENDPOINT}/${productId}`),
    () => devApi.wishlist.removeFromWishlist(productId),
  );
}

/** GET /wishlist/:productId - used to render the heart state on cards. */
export async function checkWishlist(productId: string): Promise<boolean> {
  return apiOrMock<boolean>(
    'GET /wishlist/:productId',
    () => apiGet<boolean>(`${ENDPOINT}/${productId}`),
    () => devApi.wishlist.checkWishlist(productId),
  );
}

export const wishlistApi = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };

export default wishlistApi;
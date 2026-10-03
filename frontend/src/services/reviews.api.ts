import type { CreateReviewPayload, Review, UpdateReviewPayload } from '../types';
import { apiDelete, apiGet, apiOrMock, apiPatch, apiPost } from './api';
import { devApi } from './dev';

const REVIEWS_ENDPOINT = '/reviews';
const productReviews = (productId: string) => `/reviews/${productId}`;

/**
 * MISSING BACKEND ENDPOINTS: reviews are not served at all today -
 * `GET /reviews/:productId`, `POST /reviews/:productId`, `PATCH /reviews/:id`
 * and `DELETE /reviews/:id` all answer 404.
 *
 * Every call below therefore resolves through the dev data layer (`USE_MOCK_API`
 * or a `missing` status in `BACKEND_ENDPOINT_STATUS`, see ./api.ts). The HTTP
 * paths stay wired up and activate automatically once the router is added.
 */

/** GET /products/:productId/reviews */
export async function getProductReviews(productId: string): Promise<Review[]> {
  return apiOrMock<Review[]>(
    'GET /products/:id/reviews',
    () => apiGet<Review[]>(productReviews(productId)),
    () => devApi.reviews.getProductReviews(productId),
  );
}

/** POST /products/:productId/reviews */
export async function createReview(
  productId: string,
  data: CreateReviewPayload,
): Promise<Review> {
  return apiOrMock<Review>(
    'POST /products/:id/reviews',
    () => apiPost<Review>(productReviews(productId), data),
    () => devApi.reviews.createReview(productId, data),
  );
}

/** PATCH /reviews/:id */
export async function updateReview(id: string, data: UpdateReviewPayload): Promise<Review> {
  return apiOrMock<Review>(
    'PATCH /reviews/:id',
    () => apiPatch<Review>(`${REVIEWS_ENDPOINT}/${id}`, data),
    () => devApi.reviews.updateReview(id, data),
  );
}

/** DELETE /reviews/:id */
export async function deleteReview(id: string): Promise<void> {
  return apiOrMock<void>(
    'DELETE /reviews/:id',
    async () => {
      await apiDelete<void>(`${REVIEWS_ENDPOINT}/${id}`);
    },
    () => devApi.reviews.deleteReview(id),
  );
}

export const reviewsApi = { getProductReviews, createReview, updateReview, deleteReview };

export default reviewsApi;
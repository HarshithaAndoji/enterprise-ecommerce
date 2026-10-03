import type { Category } from '../types';
import { apiGet, apiOrMock } from './api';
import { devApi } from './dev';

const ENDPOINT = '/categories';

/**
 * GET /categories
 * Not implemented by the backend: category records have no route yet, so the
 * dev data layer serves the list (and keeps `productCount` in sync).
 */
export async function getCategories(): Promise<Category[]> {
  return apiOrMock<Category[]>(
    'GET /categories',
    () => apiGet<Category[]>(ENDPOINT),
    () => devApi.categories.getCategories(),
  );
}

/** GET /categories/:slug - not implemented by the backend yet. */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  return apiOrMock<Category>(
    'GET /categories/:slug',
    () => apiGet<Category>(`${ENDPOINT}/${slug}`),
    () => devApi.categories.getCategoryBySlug(slug),
  );
}

export const categoriesApi = { getCategories, getCategoryBySlug };

export default categoriesApi;
import type { ApiResponse, Product, ProductFilters } from '../types';
import {
  apiGet,
  apiGetResponse,
  apiOrMock,
  BackendPayloadError,
  buildPaginationMeta,
} from './api';
import { devApi } from './dev';

const LIST_ENDPOINT = '/products';

function toQueryParams(filters: ProductFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    params[key] = value;
  });
  return params;
}

/**
 * The product controllers currently answer `{ message: 'Get all products' }`,
 * so every real payload is validated before it is handed to the UI. A list that
 * is genuinely empty still counts as valid - only placeholder bodies fall back.
 */
function isProduct(value: unknown): value is Product {
  const product = value as Partial<Product> | null;
  return !!product && typeof product.id === 'string' && typeof product.name === 'string';
}

function isProductList(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}

/** Short payload description so the console warning explains what came back. */
function describe(value: unknown): string {
  if (Array.isArray(value)) return `array(${value.length})`;
  if (value && typeof value === 'object') {
    return `object with keys [${Object.keys(value).join(', ')}]`;
  }
  return value === undefined ? 'no payload' : typeof value;
}

/** GET /products - paginated and filtered list. */
export async function getProducts(
  params: ProductFilters = {},
): Promise<ApiResponse<Product[]>> {
  return apiOrMock<ApiResponse<Product[]>>(
    'GET /products',
    async () => {
      const response = await apiGetResponse<Product[]>(LIST_ENDPOINT, toQueryParams(params));
      if (!isProductList(response.data)) {
        throw new BackendPayloadError(
          `GET ${LIST_ENDPOINT} returned ${describe(response.data)} instead of a product array`,
        );
      }
      return {
        ...response,
        data: response.data,
        pagination:
          response.pagination ??
          buildPaginationMeta(response.data.length, params.page ?? 1, params.limit ?? 12),
      };
    },
    () => devApi.products.getProducts(params),
  );
}

/** GET /products/:id - accepts either the id or the slug. */
export async function getProduct(id: string): Promise<Product> {
  return apiOrMock<Product>(
    'GET /products/:id',
    async () => {
      const product = await apiGet<Product>(`${LIST_ENDPOINT}/${id}`);
      if (!isProduct(product)) {
        throw new BackendPayloadError(
          `GET ${LIST_ENDPOINT}/${id} returned no product record`,
        );
      }
      return product;
    },
    () => devApi.products.getProduct(id),
  );
}

/**
 * GET /products/featured
 * Not implemented: the backend would answer this through its `/products/:id`
 * stub, which looks like a successful response but is not a product list.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  return apiOrMock<Product[]>(
    'GET /products/featured',
    async () => {
      const list = await apiGet<Product[]>(`${LIST_ENDPOINT}/featured`);
      if (!isProductList(list)) {
        throw new BackendPayloadError(`GET ${LIST_ENDPOINT}/featured returned no products`);
      }
      return list;
    },
    () => devApi.products.getFeaturedProducts(),
  );
}

/** GET /products/popular - not implemented by the backend yet. */
export async function getPopularProducts(): Promise<Product[]> {
  return apiOrMock<Product[]>(
    'GET /products/popular',
    async () => {
      const list = await apiGet<Product[]>(`${LIST_ENDPOINT}/popular`);
      if (!isProductList(list)) {
        throw new BackendPayloadError(`GET ${LIST_ENDPOINT}/popular returned no products`);
      }
      return list;
    },
    () => devApi.products.getPopularProducts(),
  );
}

/** GET /products/recent - not implemented by the backend yet. */
export async function getRecentlyAdded(): Promise<Product[]> {
  return apiOrMock<Product[]>(
    'GET /products/recent',
    async () => {
      const list = await apiGet<Product[]>(`${LIST_ENDPOINT}/recent`);
      if (!isProductList(list)) {
        throw new BackendPayloadError(`GET ${LIST_ENDPOINT}/recent returned no products`);
      }
      return list;
    },
    () => devApi.products.getRecentlyAdded(),
  );
}

/** GET /products/search?q= - not implemented by the backend yet. */
export async function searchProducts(query: string): Promise<Product[]> {
  return apiOrMock<Product[]>(
    'GET /products/search',
    async () => {
      const list = await apiGet<Product[]>(`${LIST_ENDPOINT}/search`, { q: query });
      if (!isProductList(list)) {
        throw new BackendPayloadError(`GET ${LIST_ENDPOINT}/search returned no products`);
      }
      return list;
    },
    () => devApi.products.searchProducts(query),
  );
}

/** GET /products/:id/related - not implemented by the backend yet. */
export async function getRelatedProducts(id: string): Promise<Product[]> {
  return apiOrMock<Product[]>(
    'GET /products/:id/related',
    async () => {
      const list = await apiGet<Product[]>(`${LIST_ENDPOINT}/${id}/related`);
      if (!isProductList(list)) {
        throw new BackendPayloadError(
          `GET ${LIST_ENDPOINT}/${id}/related returned no products`,
        );
      }
      return list;
    },
    () => devApi.products.getRelatedProducts(id),
  );
}

export const productsApi = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getPopularProducts,
  getRecentlyAdded,
  searchProducts,
  getRelatedProducts,
};

export default productsApi;
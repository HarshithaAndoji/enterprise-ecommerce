import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import type { ApiErrorPayload, ApiResponse, ToastType } from '../types';
import { getErrorMessage } from '../utils';

/* -------------------------------------------------------------------------- */
/*                              Configuration                                */
/* -------------------------------------------------------------------------- */

const env = import.meta.env;

/**
 * Root of the REST API. Configure it through VITE_API_URL (e.g.
 * "http://localhost:5000/api"). When it is not set we fall back to the "/api"
 * relative path, which the dev server proxies to the backend.
 */
export const API_BASE_URL: string = env.VITE_API_URL || '/api';

/**
 * When the backend is not reachable yet the app runs on clearly separated dev
 * data (see src/services/dev). Set VITE_USE_MOCK_API=false once a real backend
 * is available, or simply provide VITE_API_URL to switch automatically.
 */
export const USE_MOCK_API: boolean =
  env.VITE_USE_MOCK_API === 'true' || !env.VITE_API_URL;

/* -------------------------------------------------------------------------- */
/*                       Backend capability registry                          */
/* -------------------------------------------------------------------------- */

/**
 * How well the Express backend supports a given route today:
 *
 * - `implemented` the route works and returns real data;
 * - `stub`       the route exists but only echoes a message, so the response is
 *                validated and the dev data layer takes over when unusable;
 * - `missing`    the route does not exist yet, so the dev data layer is used
 *                directly and no request is wasted on a guaranteed 404.
 *
 * Every service module looks its endpoint up here before deciding between HTTP
 * and dev data. See ../BACKEND_DEPENDENCIES.md for the full audit and for what
 * still has to be built on the server.
 */
export type EndpointStatus = 'implemented' | 'stub' | 'missing';

export const BACKEND_ENDPOINT_STATUS = {
  /* ----------------------------- implemented ----------------------------- */
  'POST /users/register': 'implemented',
  'POST /users/login': 'implemented',
  'GET /products': 'implemented',
  'GET /products/:id': 'implemented',
  'GET /products/featured': 'implemented',
  'GET /products/popular': 'implemented',
  'GET /products/recent': 'implemented',
  'GET /products/search': 'implemented',
  'GET /products/:id/related': 'implemented',
  'GET /products/:id/reviews': 'implemented',
  'POST /products/:id/reviews': 'implemented',
  'GET /categories': 'implemented',
  'GET /categories/:slug': 'implemented',
  'GET /cart': 'implemented',
  'POST /cart/items': 'implemented',
  'PATCH /cart/items/:itemId': 'implemented',
  'DELETE /cart/items/:itemId': 'implemented',
  'DELETE /cart': 'implemented',
  'GET /wishlist': 'implemented',
  'POST /wishlist/:productId': 'implemented',
  'DELETE /wishlist/:productId': 'implemented',
  'GET /wishlist/:productId': 'implemented',
  'GET /orders': 'implemented',
  'GET /orders/:id': 'implemented',
  'POST /orders': 'implemented',
  'POST /orders/:id/cancel': 'implemented',
  'GET /auth/profile': 'implemented',
  'PATCH /auth/profile': 'implemented',
  'PATCH /reviews/:id': 'implemented',
  'DELETE /reviews/:id': 'implemented',
  'GET /admin/stats': 'implemented',
  'GET /admin/products': 'implemented',
  'POST /admin/products': 'implemented',
  'PUT /admin/products/:id': 'implemented',
  'DELETE /admin/products/:id': 'implemented',
  'GET /admin/categories': 'implemented',
  'POST /admin/categories': 'implemented',
  'PUT /admin/categories/:id': 'implemented',
  'DELETE /admin/categories/:id': 'implemented',
  'GET /admin/users': 'implemented',
  'PATCH /admin/users/:id/status': 'implemented',
  'GET /admin/orders': 'implemented',
  'PATCH /admin/orders/:id/status': 'implemented',
  'GET /admin/reviews': 'implemented',
  'DELETE /admin/reviews/:id': 'implemented',

  /* -------------------------------- missing ------------------------------ */
  'POST /auth/forgot-password': 'missing',
  'POST /auth/reset-password': 'missing',
} as const satisfies Record<string, EndpointStatus>;

/** Every route the frontend knows how to call. */
export type BackendEndpoint = keyof typeof BACKEND_ENDPOINT_STATUS;

export function backendEndpointStatus(endpoint: BackendEndpoint): EndpointStatus {
  return BACKEND_ENDPOINT_STATUS[endpoint];
}

/** True when the route exists on the server, i.e. an HTTP call is worth making. */
export function isBackendEndpointAvailable(endpoint: BackendEndpoint): boolean {
  return BACKEND_ENDPOINT_STATUS[endpoint] !== 'missing';
}

/**
 * Thrown by a service when a route answers 2xx but with a placeholder body
 * (the current product controllers). `apiOrMock` treats it like a missing
 * route and falls back to dev data.
 */
export class BackendPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackendPayloadError';
  }
}

/** 404/405/501 mean "this route does not exist yet", not a real failure. */
function isMissingEndpointError(error: unknown): boolean {
  const status = (error as { status?: number } | null)?.status;
  return status === 404 || status === 405 || status === 501;
}

export const TOKEN_STORAGE_KEY = 'ecommerce.token';
export const USER_STORAGE_KEY = 'ecommerce.user';

/* -------------------------------------------------------------------------- */
/*                              Cross-layer events                            */
/* -------------------------------------------------------------------------- */

/** Dispatched when the API answers 401 so the app can log the user out. */
export const AUTH_UNAUTHORIZED_EVENT = 'app:auth-unauthorized';
/** Dispatched by the transport layer to surface a global toast. */
export const APP_TOAST_EVENT = 'app:toast';

export interface ToastEventDetail {
  message: string;
  type: ToastType;
}

export function emitToast(message: string, type: ToastType = 'info'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<ToastEventDetail>(APP_TOAST_EVENT, {
      detail: { message, type },
    }),
  );
}

export function emitUnauthorized(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
}

/* -------------------------------------------------------------------------- */
/*                                  Instance                                  */
/* -------------------------------------------------------------------------- */

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status;

    if (status === 401) {
      clearAuthToken();
      clearStoredUser();
      emitUnauthorized();
    }

    if (!error.response || status === undefined || status >= 500) {
      emitToast(getErrorMessage(error, 'Network problem. Please try again.'), 'error');
    }

    return Promise.reject(normalizeApiError(error));
  },
);

/* -------------------------------------------------------------------------- */
/*                              Token utilities                               */
/* -------------------------------------------------------------------------- */

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* ignore unavailable storage */
  }
}

export function clearAuthToken(): void {
  setAuthToken(null);
}

export function getStoredUser<T>(): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    /* ignore unavailable storage */
  }
}

export function clearStoredUser(): void {
  setStoredUser(null);
}

/* -------------------------------------------------------------------------- */
/*                             Response helpers                               */
/* -------------------------------------------------------------------------- */

function isEnvelope(body: unknown): boolean {
  return (
    !!body &&
    typeof body === 'object' &&
    'data' in (body as Record<string, unknown>) &&
    ('success' in (body as Record<string, unknown>) ||
      'message' in (body as Record<string, unknown>))
  );
}

/** Returns the `data` field of `{ success, data }` responses, or the body. */
export function unwrapData<T>(response: AxiosResponse<unknown>): T {
  const body = response.data;
  if (isEnvelope(body)) return (body as { data: T }).data;
  return body as T;
}

/** Returns the full `{ success, message, data }` envelope, normalising raw bodies. */
export function unwrapApiResponse<T>(response: AxiosResponse<unknown>): ApiResponse<T> {
  const body = response.data;
  if (isEnvelope(body)) {
    return body as ApiResponse<T>;
  }
  return { success: true, message: '', data: body as T };
}

/** Attaches auth-independent pagination metadata to a list request. */
export function buildPaginationMeta(
  total: number,
  page = 1,
  limit = 12,
): { page: number; limit: number; total: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return { page, limit, total, totalPages };
}

/** Normalises anything thrown by axios into a predictable shape. */
export function normalizeApiError(error: unknown): Error & { status?: number; errors?: Record<string, string[]> } {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    const message =
      axiosError.response?.data?.message ??
      (axiosError.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : axiosError.message) ??
      'Request failed';
    const normalized = new Error(message) as Error & {
      status?: number;
      errors?: Record<string, string[]>;
    };
    normalized.name = 'ApiError';
    normalized.status = axiosError.response?.status;
    normalized.errors = axiosError.response?.data?.errors;
    return normalized;
  }
  return error instanceof Error ? error : new Error('Request failed');
}

/* -------------------------------------------------------------------------- */
/*                             Convenience verbs                              */
/* -------------------------------------------------------------------------- */

export const apiGet = <T>(url: string, params?: Record<string, unknown>) =>
  apiClient.get(url, { params }).then((response) => unwrapData<T>(response));

export const apiGetResponse = <T>(url: string, params?: Record<string, unknown>) =>
  apiClient.get(url, { params }).then((response) => unwrapApiResponse<T>(response));

export const apiPost = <T>(url: string, payload?: unknown) =>
  apiClient.post(url, payload).then((response) => unwrapData<T>(response));

export const apiPut = <T>(url: string, payload?: unknown) =>
  apiClient.put(url, payload).then((response) => unwrapData<T>(response));

export const apiPatch = <T>(url: string, payload?: unknown) =>
  apiClient.patch(url, payload).then((response) => unwrapData<T>(response));

export const apiDelete = <T>(url: string) =>
  apiClient.delete(url).then((response) => unwrapData<T>(response));

/* -------------------------------------------------------------------------- */
/*                           Real / dev data switch                           */
/* -------------------------------------------------------------------------- */

export interface ApiOrMockOptions {
  /** Invoked when the route turned out to be missing or stubbed. */
  onFallback?: (endpoint: BackendEndpoint) => void;
}

/**
 * Single entry point every service module uses to reach the network.
 *
 * Dev data is used when the app runs without a backend (`USE_MOCK_API`), when
 * the route is not implemented yet, or when an implemented route answers 404 /
 * a placeholder payload. Every other failure - a 400 on bad credentials, a
 * 500, a network outage - is rethrown so real errors are never hidden behind
 * demo data.
 */
export async function apiOrMock<T>(
  endpoint: BackendEndpoint,
  realCall: () => Promise<T>,
  mockCall: () => Promise<T>,
  options: ApiOrMockOptions = {},
): Promise<T> {
  if (USE_MOCK_API || !isBackendEndpointAvailable(endpoint)) {
    return mockCall();
  }

  try {
    return await realCall();
  } catch (error) {
    if (!isMissingEndpointError(error) && !(error instanceof BackendPayloadError)) {
      throw error;
    }
    if (typeof console !== 'undefined') {
      console.warn(
        `[api] ${endpoint} is not served by the backend (${getErrorMessage(
          error,
          'no route',
        )}) - using dev data.`,
      );
    }
    options.onFallback?.(endpoint);
    return mockCall();
  }
}

export default apiClient;
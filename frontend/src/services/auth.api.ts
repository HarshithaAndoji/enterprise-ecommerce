import type {
  Address,
  AuthResult,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
  UserRole,
} from '../types';
import { apiGet, apiOrMock, apiPatch, apiPost, emitToast } from './api';
import { devApi } from './dev';

/** The auth router is mounted at `/api/users`, not `/api/auth`. */
const USERS_ENDPOINT = '/users';

/**
 * Raw payload accepted from the Express auth controllers.
 *
 * Today they answer `{ message, body }` where `body` is just the echoed request
 * body - no user record and no token. The optional `user` / `token` / `data`
 * fields describe the shape the frontend would rather receive, so the day the
 * backend returns real auth data it is picked up without further changes.
 */
interface BackendAuthResponse {
  message?: string;
  body?: Record<string, unknown>;
  data?: Record<string, unknown>;
  user?: Partial<User>;
  token?: string;
}

/**
 * TRUE BACKEND STATE (2026-10): JWT auth is NOT implemented yet.
 * `POST /users/login` and `POST /users/register` echo the request body and hand
 * back no token, no user id and no roles. The session is therefore kept with a
 * provisional token derived from the user id. Delete `buildProvisionalToken`
 * and return the real token once the backend signs JWTs.
 */
function buildProvisionalToken(userId: string): string {
  return `mock_token_${userId}`;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readRole(value: unknown): UserRole | undefined {
  return value === 'admin' || value === 'customer' ? value : undefined;
}

/**
 * The stubbed controllers store nothing and return no id, so a stable id is
 * derived from the email address. It keeps the session (and the dev data layer)
 * consistent across reloads until the backend returns a real primary key.
 */
function deriveUserId(source: Record<string, unknown>, email: string): string {
  const explicit = readString(source.id) ?? readString(source.user_id);
  if (explicit) return explicit;
  const slug = email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `email_${slug || 'user'}`;
}

/** Maps any backend auth payload onto the `{ user, token }` contract. */
function toAuthResult(
  response: BackendAuthResponse,
  submitted: { name?: string; email: string },
): AuthResult {
  const nested = (response.data ?? response.body ?? {}) as Record<string, unknown>;
  const user = (response.user ?? {}) as Record<string, unknown>;
  const source: Record<string, unknown> = { ...nested, ...user };

  const email = (readString(source.email) ?? submitted.email).trim().toLowerCase();
  const name = readString(source.name) ?? submitted.name?.trim() ?? email.split('@')[0] ?? email;
  const id = deriveUserId(source, email);

  // Fields are copied one by one on purpose: the stubbed controllers echo the
  // whole request body, and a blanket spread would persist the submitted
  // password in local storage.
  const normalized: User = {
    id,
    name,
    email,
    role: readRole(source.role) ?? 'customer',
    isActive: source.isActive === false ? false : true,
    phone: readString(source.phone),
    avatarUrl: readString(source.avatarUrl),
    addresses: Array.isArray(source.addresses) ? (source.addresses as Address[]) : undefined,
    createdAt: readString(source.createdAt) ?? new Date().toISOString(),
  };

  // A real JWT wins as soon as the backend starts issuing one.
  const token = readString(response.token) ?? buildProvisionalToken(normalized.id);

  return { user: normalized, token };
}

/** Tells the user when a request silently fell back to the demo dataset. */
function notifyFallback(): void {
  emitToast(
    'The backend does not expose this route yet - signing you in against the local demo data.',
    'info',
  );
}

/** POST /users/login */
export async function login(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  return apiOrMock<AuthResult>(
    'POST /users/login',
    async () => {
      const response = await apiPost<BackendAuthResponse>(`${USERS_ENDPOINT}/login`, {
        email: normalizedEmail,
        password,
      } satisfies LoginPayload);
      return toAuthResult(response, { email: normalizedEmail });
    },
    () => devApi.auth.login(email, password),
    { onFallback: notifyFallback },
  );
}

/** POST /users/register */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  return apiOrMock<AuthResult>(
    'POST /users/register',
    async () => {
      const response = await apiPost<BackendAuthResponse>(`${USERS_ENDPOINT}/register`, {
        name: name.trim(),
        email: normalizedEmail,
        password,
      } satisfies RegisterPayload);
      return toAuthResult(response, { name: name.trim(), email: normalizedEmail });
    },
    () => devApi.auth.register(name, email, password),
    { onFallback: notifyFallback },
  );
}

/**
 * POST /auth/forgot-password - always resolves, never reveals account existence.
 * Not implemented by the backend, so this resolves through dev data.
 */
export async function forgotPassword(email: string): Promise<void> {
  return apiOrMock<void>(
    'POST /auth/forgot-password',
    async () => {
      await apiPost<void>('/auth/forgot-password', { email });
    },
    () => devApi.auth.forgotPassword(email),
  );
}

/** POST /auth/reset-password - not implemented by the backend yet. */
export async function resetPassword(token: string, password: string): Promise<void> {
  return apiOrMock<void>(
    'POST /auth/reset-password',
    async () => {
      await apiPost<void>('/auth/reset-password', { token, password });
    },
    () => devApi.auth.resetPassword(token, password),
  );
}

/**
 * GET /auth/profile - not implemented by the backend, so the session user held
 * in local storage is returned and profile edits stay local.
 */
export async function getProfile(): Promise<User> {
  return apiOrMock<User>(
    'GET /auth/profile',
    () => apiGet<User>('/auth/profile'),
    () => devApi.auth.getProfile(),
  );
}

/** PATCH /auth/profile - not implemented by the backend yet. */
export async function updateProfile(data: UpdateProfilePayload): Promise<User> {
  return apiOrMock<User>(
    'PATCH /auth/profile',
    () => apiPatch<User>('/auth/profile', data),
    () => devApi.auth.updateProfile(data),
  );
}

export const authApi = {
  login,
  register,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};

export default authApi;
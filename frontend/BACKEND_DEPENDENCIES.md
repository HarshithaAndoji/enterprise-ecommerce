# Backend dependencies

Audit of what the Express backend in `../backend` actually serves today versus
what this frontend calls. Written 2026-10-03 against
`backend/src/{app.ts,server.ts,routes/,controllers/}`.

The machine readable version of this audit lives in
`src/services/api.ts` -> `BACKEND_ENDPOINT_STATUS`, which every service module
reads before deciding between HTTP and the dev data layer. **When a route is
implemented on the server, flip its status there and the frontend switches over
without touching that service module.**

---

## 0. Blocking issue: the routers are never mounted

Before anything else, the one thing that has to be fixed server-side.

`backend/src/app.ts` registers only `cors()`, `express.json()` and
`GET /api/health`. `userRoutes.ts` and `productRoutes.ts` exist but are
**imported nowhere** - there is no `app.use('/api/users', userRoutes)` or
`app.use('/api/products', productRoutes)` anywhere in `backend/src`.

Consequence: all five endpoints documented as "implemented" below currently
return **404**, not their handler responses. Login and register still appear to
work because `apiOrMock()` treats a 404 as "route missing" and falls back to the
dev data layer, but no request ever reaches `userController`.

The fix is one line in `app.ts` each:

```ts
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
```

Frontend code does not need to change once this lands.

---

## 1. Implemented endpoints

Request and response shapes as they exist in the controllers. Note that none of
them touch the database or return a token.

### `POST /api/users/register`

`backend/src/controllers/userController.ts` -> `register`

- Request: `{ name: string, email: string, password: string }`
- Response `201`:

```json
{
  "message": "User registered",
  "body": { "name": "...", "email": "...", "password": "..." }
}
```

`body` is the echoed request body. Nothing is persisted and **no id, role or
token is returned**. The echoed `password` is discarded on the client
(`toAuthResult()` copies fields individually, see
`src/services/auth.api.ts`).

Called by: `register()` in `src/services/auth.api.ts`.

### `POST /api/users/login`

`backend/src/controllers/userController.ts` -> `login`

- Request: `{ email: string, password: string }`
- Response `200`: identical shape to register with
  `"message": "User logged in"`.

Credentials are not verified against anything - any password succeeds for any
email. Acceptable while the backend is a stub; must be fixed before the app is
exposed.

Called by: `login()` in `src/services/auth.api.ts`.

### `GET /api/products`

`backend/src/controllers/productController.ts` -> `getAll`

- Response `200`: `{ "message": "Get all products" }`

A stub. No products are returned and no query parameters are read, so
`apiOrMock` validates the payload, throws `BackendPayloadError` and falls back
to the dev catalogue. Filters, sorting and pagination are ignored entirely.

### `GET /api/products/:id`

`productController.ts` -> `getById`

- Response `200`: `{ "message": "Get product <id>" }`

Same stub behaviour. Note the route is `/:id`, so `featured`, `popular`,
`recent` and `search` are matched as an `:id` value rather than 404-ing, and
they must be validated as stubs too (they are, in `products.api.ts`).

### `GET /api/users`

`userController.ts` -> `getAll`

- Response `200`: `{ "message": "Get all users" }`

Stub. Not used by the admin console, which calls `GET /admin/users`.

### `GET /api/health`

`backend/src/app.ts`

- Response `200`: `{ "success": true, "message": "API and PostgreSQL are running" }`
- Response `503`: `{ "success": false, "message": "Database is unavailable" }`

Useful for confirming the server is up. Not wrapped by a service module.

---

## 2. Missing endpoints, by feature

Everything below answers **404**. The frontend serves all of it from
`src/services/dev` and will switch to HTTP automatically once the route is both
registered and marked `implemented` in `BACKEND_ENDPOINT_STATUS`.

### Auth (`src/services/auth.api.ts`)

| Method | Path                     | Notes                                             |
| ------ | ------------------------ | ------------------------------------------------- |
| POST   | `/auth/forgot-password`  | Should always answer 2xx, never 404, and must not reveal whether the account exists |
| POST   | `/auth/reset-password`   | `{ token, password }`                             |
| GET    | `/auth/profile`          | Current user, from the verified JWT                |
| PATCH  | `/auth/profile`          | Update name, phone, avatar, addresses              |

Note the path mismatch: the router that *does* exist is mounted (intended) at
`/api/users`, but these four are modelled under `/api/auth`. Either mount a
separate auth router at `/api/auth` or move them to `/api/users` and update the
four call sites in `auth.api.ts`.

### Products (`src/services/products.api.ts`)

| Method | Path                        | Notes                                            |
| ------ | --------------------------- | ------------------------------------------------ |
| GET    | `/products/featured`        | Home hero carousel                               |
| GET    | `/products/popular`         | Home best sellers                                |
| GET    | `/products/recent`          | Home newest arrivals                             |
| GET    | `/products/search?q=`       | Typeahead                                       |
| GET    | `/products/:id/related`     | Related products for a detail page               |

The list endpoint also needs real pagination, filtering (`category`, `search`,
`price range`), sorting and a `total` so the `Pagination` component works.

### Categories (`src/services/categories.api.ts`)

| Method | Path                | Notes                            |
| ------ | ------------------- | -------------------------------- |
| GET    | `/categories`       | List with a live `productCount`  |
| GET    | `/categories/:slug` | Single category                  |

### Cart (`src/services/cart.api.ts`)

| Method | Path                      | Notes                       |
| ------ | ------------------------- | --------------------------- |
| GET    | `/cart`                   | Current cart for the user   |
| POST   | `/cart/items`             | `{ productId, quantity }`   |
| PATCH  | `/cart/items/:itemId`     | `{ quantity }`              |
| DELETE | `/cart/items/:itemId`     | Remove one line             |
| DELETE | `/cart`                   | Empty the cart              |

### Wishlist (`src/services/wishlist.api.ts`)

| Method | Path                       | Notes                            |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/wishlist`                | Saved products                   |
| POST   | `/wishlist/:productId`     | Save                             |
| DELETE | `/wishlist/:productId`     | Unsave                           |
| GET    | `/wishlist/:productId`     | Boolean, for the heart icon      |

### Orders (`src/services/orders.api.ts`)

| Method | Path                  | Notes                                    |
| ------ | --------------------- | ---------------------------------------- |
| GET    | `/orders`             | Orders for the signed-in user            |
| GET    | `/orders/:id`         | Detail with line items                   |
| POST   | `/orders`             | Create from the current cart             |
| POST   | `/orders/:id/cancel`  | Cancel while still cancellable           |

### Reviews (`src/services/reviews.api.ts`)

| Method | Path                           | Notes                             |
| ------ | ------------------------------ | --------------------------------- |
| GET    | `/products/:id/reviews`        | With the rating aggregate         |
| POST   | `/products/:id/reviews`        | `{ rating, comment }`, one per user per product |
| PATCH  | `/reviews/:id`                 | Author only                       |
| DELETE | `/reviews/:id`                 | Author or admin                   |

### Admin (`src/services/admin.api.ts`)

There is no `/admin` router at all. Every route below is missing, and each one
also needs server-side role enforcement - see the JWT note in section 3.

| Method        | Path                          |
| ------------- | ----------------------------- |
| GET           | `/admin/stats`                |
| GET           | `/admin/products`             |
| POST          | `/admin/products`             |
| PUT           | `/admin/products/:id`         |
| DELETE        | `/admin/products/:id`         |
| GET           | `/admin/categories`           |
| POST          | `/admin/categories`           |
| PUT           | `/admin/categories/:id`       |
| DELETE        | `/admin/categories/:id`       |
| GET           | `/admin/users`                |
| PATCH         | `/admin/users/:id/status`     |
| GET           | `/admin/orders`               |
| PATCH         | `/admin/orders/:id/status`    |
| GET           | `/admin/reviews`              |
| DELETE        | `/admin/reviews/:id`          |

---

## 3. Authentication

**JWT is not implemented.** `POST /users/login` and `POST /users/register` return
no token, no user id and no roles.

How the frontend copes today:

- `toAuthResult()` in `src/services/auth.api.ts` normalises the response onto the
  `{ user, token }` contract the rest of the app expects.
- Because there is no id, one is derived from the email
  (`deriveUserId()`, e.g. `email_alex_example_com`).
- Because there is no token, a provisional one is minted from that id
  (`buildProvisionalToken()`, e.g. `mock_token_email_alex_example_com`). It is
  **not** a credential and the backend never validates it.
- Fields are copied one at a time, never spread, because the controllers echo
  the entire request body - a spread would put the submitted password into the
  Redux state and into `localStorage`.
- Passwords never leave the auth thunks. `loginThunk` / `registerThunk` keep them
  in a closure and only dispatch `loginSuccess` / `loginFailure`, so no password
  is ever part of a dispatched action.

Once the backend issues real tokens, `toAuthResult()` already prefers
`response.token` and `response.user` when present, so the only cleanup is
deleting `buildProvisionalToken()` and `deriveUserId()`.

### What the backend still owes

1. Sign a JWT on login and register, and return it alongside the user.
2. Verify that token on every protected route.
3. Verify passwords with bcrypt/argon2 instead of echoing them.
4. Reject duplicate emails on register with `409` and bad credentials on login
   with `401` - both are currently unconditional successes.
5. Enforce `role` server-side on `/admin/*`. Until then the `AdminRoute` guard in
   `src/components/common/AdminRoute.tsx` is a client-side check only and is
   trivially bypassed.
6. Return a consistent envelope. Right now the controllers use `{ message, body }`
   while the frontend's `unwrapData()` expects `{ success, message, data }`.
   `unwrapData()` passes bare bodies through unchanged, so either shape works
   today, but standardising on `{ success, message, data }` lets the fallback
   logic key off `data` reliably.

### Cleanup rules the backend should follow

`401` matters: the axios response interceptor clears the stored token and user
and dispatches `app:auth-unauthorized`, which `App.tsx` listens for. Returning
`401` for an expired session is the only way the client logs out on its own.

---

## 4. CORS and proxy

**CORS is already open.** `app.ts` calls `cors()` with no options, so every
origin is allowed. No frontend change is needed for CORS. Worth narrowing to the
dev origins before production.

**Two ways to reach the API in development**, both in
`src/services/api.ts`:

1. Leave `VITE_API_URL` unset. `API_BASE_URL` becomes the relative `/api` and
   the Vite dev server proxies it to `http://localhost:5000`
   (`vite.config.ts`, `/api` with `changeOrigin: true`). Same-origin, so no CORS
   involvement and no cookie problems.
2. Set `VITE_API_URL=http://localhost:5000/api`. Requests go straight to the
   server and rely on the permissive `cors()` above.

**Important:** `USE_MOCK_API` is derived as
`VITE_USE_MOCK_API === 'true' || !VITE_API_URL`. So an **unset**
`VITE_API_URL` means the app stays on dev data even though the proxy is
configured. To actually exercise the backend you must set the variable
explicitly.

The production build in `dist/` has no dev server, so `/api` cannot be proxied.
Set `VITE_API_URL` to an absolute backend URL at build time, or serve `dist/`
behind a reverse proxy that forwards `/api`.

---

## 5. Summary

| Area      | Implemented | Stub      | Missing |
| --------- | ----------- | --------- | ------- |
| Auth      | 2           | 0         | 4       |
| Products  | 0           | 2         | 5       |
| Users     | 0           | 1         | 0       |
| Categories| 0           | 0         | 2       |
| Cart      | 0           | 0         | 5       |
| Wishlist  | 0           | 0         | 4       |
| Orders    | 0           | 0         | 4       |
| Reviews   | 0           | 0         | 4       |
| Admin     | 0           | 0         | 14      |

Plus one prerequisite: mount `userRoutes` and `productRoutes` in `app.ts`, or
none of the "implemented" endpoints are reachable.

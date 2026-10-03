# EnterpriseShop Frontend

React 18 + TypeScript + Vite storefront and admin console for the Enterprise
E-Commerce Platform. Built with Tailwind CSS, Redux Toolkit and TanStack Query.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional - the app runs without it
npm run dev                  # http://localhost:3000
```

With no `VITE_API_URL` configured the app runs on the bundled dev data layer
(`src/services/dev`) so every screen is usable immediately. See
[Dev data layer](#dev-data-layer-temporary).

### Demo accounts (dev data only)

| Role    | Email               | Password      |
| ------- | ------------------- | ------------- |
| Customer| `customer@demo.com` | `customer123` |
| Admin   | `admin@demo.com`    | `admin123`    |

---

## Backend integration status

The Express backend in `../backend` is still a scaffold. What actually exists
today:

| Endpoint                   | Status  | Notes                                              |
| -------------------------- | ------- | -------------------------------------------------- |
| `POST /api/users/register` | usable  | Echoes `{ message, body }`; persists nothing, issues no token |
| `POST /api/users/login`    | usable  | Echoes `{ message, body }`; verifies no credentials |
| `GET /api/products`        | stub    | `{ message: 'Get all products' }`                  |
| `GET /api/products/:id`    | stub    | `{ message: 'Get product <id>' }`                   |
| `GET /api/users`           | stub    | `{ message: 'Get all users' }`                      |
| `GET /api/health`          | usable  | Returns 200 / 503 with the PostgreSQL check        |

Everything else - `/auth/*`, `/products/featured|popular|recent|search`,
`/products/:id/related`, `/categories`, `/cart`, `/wishlist`, `/orders`,
`/reviews`, `/admin/*` - **does not exist and answers 404**. JWT auth is not
implemented at all.

Two consequences for this frontend:

- **The backend routers are never mounted.** `backend/src/app.ts` registers only
  `cors()`, `express.json()` and `/api/health`; `userRoutes` and `productRoutes`
  are never imported. Until `app.use('/api/users', userRoutes)` and
  `app.use('/api/products', productRoutes)` are added, even the table above
  answers 404. Login and register still work because the fallback catches it.
- **Sessions are provisional.** Login mints a placeholder token from the user id
  (`mock_token_<id>`); the backend never validates it. Passwords are never
  placed in Redux state or `localStorage`.

Full audit, per-endpoint request/response shapes and the CORS/proxy notes:
**[BACKEND_DEPENDENCIES.md](./BACKEND_DEPENDENCIES.md)**.

### Switching between mock and real API

Set `VITE_API_URL` in `frontend/.env.local`:

```bash
# Dev data only - the default. No backend needed.
VITE_API_URL=

# Talk to the backend. Endpoints that are not implemented (or not yet mounted)
# fall back to dev data automatically, per endpoint.
VITE_API_URL=http://localhost:5000/api

# Force dev data even with VITE_API_URL set - useful for UI work.
VITE_USE_MOCK_API=true
```

`USE_MOCK_API` is `VITE_USE_MOCK_API === 'true' || !VITE_API_URL`, so an **unset**
`VITE_API_URL` means mock mode regardless of the dev-server proxy. Setting it is
what actually exercises the backend.

The switch is per endpoint, not global. `src/services/api.ts` holds a
`BACKEND_ENDPOINT_STATUS` registry (`implemented` / `stub` / `missing`) and every
service calls `apiOrMock(endpoint, realCall, mockCall)`:

- status `missing` -> dev data, no request is sent;
- status `stub` -> request is sent, and if the payload is a placeholder the dev
  data layer takes over;
- a `404` / `405` / `501` at runtime -> treated as missing, dev data;
- **any other error is rethrown**, so bad credentials, 500s and network outages
  surface as real errors instead of being masked by demo data.

**To retire the dev data layer:** implement the routes in
[BACKEND_DEPENDENCIES.md](./BACKEND_DEPENDENCIES.md), flip their status to
`implemented` in `BACKEND_ENDPOINT_STATUS`, set `VITE_API_URL`, then delete
`src/services/dev`.

---

## Scripts

| Script                  | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server on port 3000               |
| `npm run build`         | Typecheck (`tsc -b`) then build to `dist/`            |
| `npm run preview`       | Serve the production build locally                   |
| `npm run typecheck`     | Typecheck only (`tsc --noEmit`)                      |
| `npm run lint`          | ESLint (requires an ESLint config, see Notes)        |
| `npm run test`          | Unit/component tests once (`vitest run`)             |
| `npm run test:watch`    | Vitest in watch mode                                 |
| `npm run test:coverage` | Vitest with coverage report                          |
| `npm run test:e2e`      | Playwright end to end suite (auto-starts dev server) |
| `npm run test:e2e:ui`   | Playwright UI mode                                   |

No test files are committed yet - `npm run test` passes with `passWithNoTests`
and `playwright.config.ts` points at `./e2e`. Add specs in
`src/**/*.test.tsx` (Vitest + Testing Library) and `e2e/*.spec.ts` (Playwright).

---

## Environment variables

| Variable            | Purpose                                                                                   | Default        |
| ------------------- | ----------------------------------------------------------------------------------------- | -------------- |
| `VITE_API_URL`      | REST API root, e.g. `http://localhost:5000/api`. Empty means dev data.                      | `/api` (proxy) |
| `VITE_USE_MOCK_API` | `true` forces the dev data layer even when `VITE_API_URL` is set.                           | unset          |
| `E2E_BASE_URL`      | Base URL for Playwright.                                                                    | `http://localhost:3000` |

No URL is hardcoded in `src/services` - everything flows through
`src/services/api.ts`. When `VITE_API_URL` is empty the Vite dev server proxies
`/api` to `http://localhost:5000` (see `vite.config.ts`), but an empty
`VITE_API_URL` also forces `USE_MOCK_API` to `true`, so the proxy is only used
once the variable is set to an absolute URL. The `dist/` build has no dev
server, so it needs an absolute `VITE_API_URL` at build time or a reverse proxy
in front of it.

---

## Architecture

```
src/
  types/          Domain models (Product, Cart, Order, User, ApiResponse, ...)
  utils/          formatCurrency, generateSlug, classNames, truncate, cart maths
  hooks/          useDebounce, useLocalStorage, useMediaQuery, useBodyScrollLock
  services/       Axios client + one typed module per resource
    api.ts        Instance, auth header, 401 handling, envelope unwrapping
    dev/          TEMPORARY in-memory implementation (delete once backend exists)
    queryKeys.ts  Central TanStack Query key factory
  store/          Redux Toolkit (auth, cart, ui) + typed useAppDispatch/useAppSelector
  features/       Feature logic and hooks (auth, products, cart, orders, ...)
  components/     Reusable UI (common, layout, product, cart, forms)
  layouts/        MainLayout (storefront shell) and AdminLayout
  routes/         AppRoutes - public / protected / admin route table
  pages/          Route level screens
  test/setup.ts   Vitest setup (jest-dom, matchMedia, ResizeObserver stubs)
```

### State split

- **TanStack Query** owns all server state: products, categories, reviews,
  orders, wishlist, cart and profile.
- **Redux Toolkit** owns session and UI state: `auth` (user, token,
  isAuthenticated), `cart` (item list mirrored from the cart query for the
  header badge) and `ui` (mobile menu, cart drawer, toasts).
- Passwords are never dispatched to Redux and never written to storage. The
  auth thunks keep them in a closure and only dispatch the outcome
  (`loginSuccess` / `loginFailure`).

### Transport layer

`src/services/api.ts` exports the shared `apiClient`:

- request interceptor adds `Authorization: Bearer <token>` from localStorage;
- response interceptor clears the session and dispatches
  `app:auth-unauthorized` on `401` (listened to in `App.tsx`), and raises a
  global toast through the `app:toast` event for network/5xx failures;
- `unwrapData` / `unwrapApiResponse` normalise `{ success, message, data }`
  responses and bare payloads alike.

### Routing

| Path                     | Access      | Screen                |
| ------------------------ | ----------- | --------------------- |
| `/`                      | public      | Home                  |
| `/products`              | public      | Products              |
| `/products/:id`          | public      | Product details       |
| `/categories/:slug`      | public      | Products (filtered)   |
| `/search`                | public      | Products (search)     |
| `/login`, `/register`    | public      | Auth                  |
| `/forgot-password`, `/reset-password` | public | Auth            |
| `/cart`, `/wishlist`, `/checkout` | `ProtectedRoute` | Customer     |
| `/orders`, `/orders/:id`, `/profile` | `ProtectedRoute` | Customer |
| `/admin`, `/admin/*`     | `AdminRoute`| Admin console         |

Catalogue filters live in the URL, so `/products?search=shoes&sort=price_asc`
is shareable and the back button works. `ProtectedRoute` remembers the attempted
location and returns you there after signing in; `AdminRoute` sends non-admins
to `/profile`.

### Accessibility and responsiveness

- semantic landmarks (`header`/`nav`/`main`/`aside`/`footer`), skip links,
  breadcrumb navigation and labelled tables;
- every input has a real `<label>`, and errors are wired through
  `aria-invalid` / `aria-describedby` with `role="alert"`;
- modals, drawers and the mobile sidebar close on `Escape`, lock page scroll and
  use `role="dialog" aria-modal="true"`;
- visible `focus-visible` rings on all interactive elements, alt text on all
  images, `aria-pressed`/`aria-current` on toggles and pagination;
- Tailwind breakpoints: mobile first, `sm` tablet, `lg` desktop (desktop header
  at `lg`, mobile header + off-canvas nav below it).

### UI states

`Loading` (spinner / skeleton / card skeletons), `ErrorState` (with retry) and
`EmptyState` are used on every API-driven screen via `ProductGrid` and the
individual pages.

---

## Dev data layer (temporary)

`src/services/dev/` holds an in-memory implementation of every service call
plus the seed catalogue (`mockData.ts`). Each service module branches once:

```ts
return apiOrMock<AuthResult>('POST /users/login', realCall, () => devApi.auth.login(...));
```

The branch lives in `src/services/api.ts`, driven by the
`BACKEND_ENDPOINT_STATUS` registry - see
[Switching between mock and real API](#switching-between-mock-and-real-api).
`USE_MOCK_API` short-circuits it entirely; otherwise each call consults the
registry and retries against dev data on a 404 or a placeholder payload.

**To retire it:** implement the endpoints below, set `VITE_API_URL`, and delete
`src/services/dev`.

The REST surface the frontend expects. **Only the two auth rows marked ✅ exist;
everything else is still 404.**

| Method | Path                        | Purpose                        | Status |
| ------ | --------------------------- | ------------------------------ | ------ |
| POST   | `/users/login`              | Returns `{ user, token }`      | ✅ stub |
| POST   | `/users/register`           | Returns `{ user, token }`      | ✅ stub |
| POST   | `/auth/forgot-password`     | Always 2xx                     | missing |
| POST   | `/auth/reset-password`      | Token + new password           | missing |
| GET    | `/auth/profile`             | Current user                   | missing |
| PATCH  | `/auth/profile`             | Update profile                 | missing |
| GET    | `/products`                 | Paginated, filtered list       | stub |
| GET    | `/products/:idOrSlug`       | Single product                 | stub |
| GET    | `/products/featured\|popular\|recent` | Home sections          | missing |
| GET    | `/products/search?q=`       | Typeahead                      | missing |
| GET    | `/products/:id/related`     | Related products               | missing |
| GET    | `/categories`               | Category list                  | missing |
| GET    | `/categories/:slug`         | Single category                | missing |
| GET    | `/cart`                     | Current cart                   | missing |
| POST   | `/cart/items`               | Add item                       | missing |
| PATCH  | `/cart/items/:itemId`       | Update quantity                | missing |
| DELETE | `/cart/items/:itemId`       | Remove item                    | missing |
| DELETE | `/cart`                     | Empty cart                     | missing |
| GET    | `/wishlist`                 | Saved products                 | missing |
| POST   | `/wishlist/:productId`      | Save product                   | missing |
| DELETE | `/wishlist/:productId`      | Unsave product                 | missing |
| GET    | `/wishlist/:productId`      | Boolean membership             | missing |
| GET    | `/orders`, `/orders/:id`    | Order history / detail         | missing |
| POST   | `/orders`                   | Create order                   | missing |
| POST   | `/orders/:id/cancel`        | Cancel order                   | missing |
| GET    | `/products/:id/reviews`     | Reviews for a product          | missing |
| POST   | `/products/:id/reviews`     | Create review                  | missing |
| PATCH  | `/reviews/:id`              | Update review                  | missing |
| DELETE | `/reviews/:id`              | Delete review                  | missing |
| GET    | `/admin/stats`              | Dashboard metrics              | missing |
| GET/POST/PUT/DELETE | `/admin/products`     | Product CRUD                   | missing |
| GET/POST/PUT/DELETE | `/admin/categories`  | Category CRUD                  | missing |
| GET    | `/admin/users`              | User list                      | missing |
| PATCH  | `/admin/users/:id/status`   | Activate / deactivate          | missing |
| GET    | `/admin/orders`             | All orders                     | missing |
| PATCH  | `/admin/orders/:id/status`  | Update order status            | missing |
| GET    | `/admin/reviews`            | All reviews                    | missing |
| DELETE | `/admin/reviews/:id`        | Moderate a review              | missing |

Auth is the one area where the path matters today: login and register live under
`/users` because that is where the backend mounts its router, not `/auth`.

List endpoints should answer with
`{ success, message, data, pagination: { page, limit, total, totalPages } }`.
The current controllers answer `{ message, body }`; `unwrapData()` passes bare
bodies through, so both shapes work.

---

## Notes and known issues

- **JWT auth is pending on the backend.** Login and register hit
  `POST /api/users/login` / `POST /api/users/register`, but neither returns a
  token or a user id. `src/services/auth.api.ts` mints a provisional token from
  the email (`buildProvisionalToken`, `deriveUserId`) and sends it as
  `Authorization: Bearer ...`, which the backend ignores. `ProtectedRoute` and
  `AdminRoute` are therefore client-side checks only - they must be enforced
  server-side once auth exists. Passwords are never dispatched to Redux or
  written to storage; the thunks keep them in a closure.
- **`npm run build` is green.** `tailwindcss` is pinned to `^3.4.19`, matching
  the v3 API used by `postcss.config.js`, `tailwind.config.js` and
  `src/index.css`. `npx tsc --noEmit` and `npx vite build` both pass (228
  modules).
- **The backend's product and user routers are not mounted** in
  `backend/src/app.ts`, so every documented endpoint currently 404s. See
  section 0 of [BACKEND_DEPENDENCIES.md](./BACKEND_DEPENDENCIES.md). Fixing it
  is backend-only work; no frontend change is needed.
- `npm run lint` requires an ESLint configuration that is not in the repo yet.
- Product and category artwork uses `https://picsum.photos/seed/<slug>` as
  placeholder imagery; `ProductImage` falls back to a generated inline SVG when
  a remote image fails.
- The checkout collects no card data; payment is a stub until the backend
  gateway is wired in.
- CORS is fully open server-side (`cors()` with no options). The dev server also
  proxies `/api` to `http://localhost:5000`, but that proxy is bypassed unless
  `VITE_API_URL` is set - see
  [Switching between mock and real API](#switching-between-mock-and-real-api).
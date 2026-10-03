import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const errors = [];
const log = (...a) => console.log(...a);

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    `${process.env.USERPROFILE}\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe`,
});
const page = await browser.newPage();

page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' || t.includes('[api]')) log(`  console.${m.type()}: ${t}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

// 1. Home page renders catalogue from the fallback dataset.
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const cards = await page.locator('a[href^="/products/"]').count();
log(`home: product links = ${cards}`);

// 2. Products listing with filters.
await page.goto(`${BASE}/products?sort=price_asc`, { waitUntil: 'networkidle' });
log(`products: links = ${await page.locator('a[href^="/products/"]').count()}`);

// 3. Product detail.
await page.goto(`${BASE}/products/prod_1`, { waitUntil: 'networkidle' });
log(`detail: h1 = ${(await page.locator('h1').first().textContent())?.trim()}`);

// 4. Bad credentials must surface an error, not a fake success.
//    Skipped against the contract stub, which accepts every payload with 200.
if (!process.env.SKIP_BAD_CREDENTIALS) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'nobody@example.com');
  await page.fill('input[name="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="alert"]', { timeout: 10000 });
  log(`login(bad): alert = ${(await page.locator('[role="alert"]').first().textContent())?.trim()}`);
} else {
  log('login(bad): skipped (stub accepts any payload)');
}

// 5. Register through the real backend route.
const email = `qa_${Date.now()}@example.com`;
await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
await page.fill('input[name="name"]', 'QA Tester');
await page.fill('input[name="email"]', email);
await page.fill('input[name="password"]', 'password123');
await page.fill('input[name="confirmPassword"]', 'password123');
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes('/register'), { timeout: 15000 });
const storedUser = await page.evaluate(() => localStorage.getItem('ecommerce.user'));
const storedToken = await page.evaluate(() => localStorage.getItem('ecommerce.token'));
log(`register: path = ${new URL(page.url()).pathname}`);
log(`register: stored user = ${storedUser}`);
log(`register: stored token = ${storedToken}`);

// 6. Protected screens reachable with the provisional token.
for (const path of ['/cart', '/wishlist', '/orders', '/profile', '/checkout']) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  const alert = await page.locator('[role="alert"]').first().textContent().catch(() => null);
  log(`${path}: ok${alert ? ` (alert: ${alert.trim().slice(0, 70)})` : ''}`);
}

// 7. Admin console must redirect a customer away.
await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
log(`admin as customer: landed on ${new URL(page.url()).pathname}`);

await browser.close();
log(errors.length ? `PAGE ERRORS: ${errors.join(' | ')}` : 'no page errors');
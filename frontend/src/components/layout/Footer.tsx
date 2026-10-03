import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useCategories } from '../../features/categories/useCategories';
import { useAppDispatch } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';

const FOOTER_LINKS: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: '/products' },
      { label: 'New arrivals', to: '/products?sort=newest' },
      { label: 'Top rated', to: '/products?sort=rating' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My orders', to: '/orders' },
      { label: 'My profile', to: '/profile' },
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping policy', to: '/' },
      { label: 'Returns', to: '/' },
      { label: 'Contact us', to: '/' },
      { label: 'Privacy', to: '/' },
    ],
  },
];

/** Site footer with link columns and a newsletter signup form. */
export function Footer() {
  const dispatch = useAppDispatch();
  const { data: categories = [] } = useCategories();
  const [email, setEmail] = useState('');

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    dispatch(
      showToast({ message: 'Thanks for subscribing to our newsletter', type: 'success' }),
    );
    setEmail('');
  };

  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Icon name="cart" className="h-5 w-5" />
              </span>
              EnterpriseShop
            </Link>
            <p className="mt-3 max-w-sm text-sm text-gray-500">
              A full stack ecommerce reference implementation: catalogue, cart, checkout,
              orders, reviews and an admin console.
            </p>

            <form onSubmit={subscribe} className="mt-6 max-w-sm">
              <label htmlFor="newsletter-email" className="label">
                Newsletter
              </label>
              <div className="flex gap-2">
                <Input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address for the newsletter"
                />
                <Button type="submit">Subscribe</Button>
              </div>
            </form>
          </div>

          {FOOTER_LINKS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-600 transition hover:text-blue-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {categories.length > 0 ? (
          <div className="mt-10 border-t border-gray-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Popular categories
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/categories/${category.slug}`}
                    className="text-sm text-gray-600 hover:text-blue-700 hover:underline"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} EnterpriseShop. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <Icon name="lock" className="h-4 w-4" />
            Secure checkout &middot; 30 day returns
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useCategories } from '../../features/categories/useCategories';
import { useProductSearch } from '../../features/products/useProducts';
import { useCartCount } from '../../features/cart/useCart';
import { useWishlist } from '../../features/wishlist/useWishlist';
import { useAppSelector } from '../../store/store';
import { useClickOutside, useDebounce } from '../../hooks';
import { classNames, formatCurrency } from '../../utils';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'Orders', to: '/orders' },
];

/** Desktop storefront header: logo, navigation, search and account actions. */
export function Header() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: wishlist = [] } = useWishlist();
  const cartCount = useCartCount();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const [search, setSearch] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setCategoriesOpen(false));
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: suggestions = [] } = useProductSearch(debouncedSearch);
  const showSuggestions = search.trim().length > 1 && suggestions.length > 0;

  const handleSearchSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
  };

  return (
    <header className="sticky top-0 z-40 hidden border-b border-gray-200 bg-white shadow-sm lg:block">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Icon name="cart" className="h-5 w-5" />
          </span>
          EnterpriseShop
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1">
          {NAV_LINKS.slice(0, 2).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                classNames(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setCategoriesOpen((open) => !open)}
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Categories
              <Icon name="chevron-down" className="h-4 w-4" />
            </button>
            {categoriesOpen ? (
              <div className="absolute left-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <ul>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/categories/${category.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {category.name}
                        {category.productCount !== undefined ? (
                          <span className="text-xs text-gray-400">{category.productCount}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="relative flex-1" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} role="search">
            <label htmlFor="header-search" className="sr-only">
              Search products
            </label>
            <input
              id="header-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="input"
            />
          </form>
          {showSuggestions ? (
            <ul className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {suggestions.slice(0, 5).map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/products/${product.id}`}
                    onClick={() => setSearch('')}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <span className="truncate text-gray-800">{product.name}</span>
                    <span className="shrink-0 text-xs font-semibold text-gray-500">
                      {formatCurrency(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  See all results
                </button>
              </li>
            </ul>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <Link
            to="/wishlist"
            className="relative rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label={`Wishlist, ${wishlist.length} item(s)`}
          >
            <Icon name="heart" className="h-5 w-5" />
            {wishlist.length > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            ) : null}
          </Link>

          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            className="flex items-center gap-2 rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label={isAuthenticated ? 'Your account' : 'Sign in'}
          >
            <Icon name="user" className="h-5 w-5" />
            <span className="hidden text-sm font-medium xl:inline">
              {isAuthenticated ? user?.name?.split(' ')[0] ?? 'Account' : 'Sign in'}
            </span>
          </Link>

          <Link
            to="/cart"
            className="relative rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label={`Cart, ${cartCount} item(s)`}
          >
            <Icon name="cart" className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <nav aria-label="Secondary" className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Icon name="truck" className="h-4 w-4 text-blue-600" />
            Free delivery over {formatCurrency(100)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="check" className="h-4 w-4 text-emerald-600" />
            30 day returns
          </span>
          {isAuthenticated ? (
            <Link to="/admin" className="ml-auto font-semibold text-blue-700 hover:underline">
              Admin console
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

export default Header;
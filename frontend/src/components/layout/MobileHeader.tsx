import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { useCartCount } from '../../features/cart/useCart';
import { useAppDispatch } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';

export interface MobileHeaderProps {
  onToggleMenu: () => void;
}

/** Compact header shown below the `lg` breakpoint. */
export function MobileHeader({ onToggleMenu }: MobileHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartCount = useCartCount();
  const [search, setSearch] = useState('');

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm lg:hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label="Open navigation menu"
          aria-controls="mobile-sidebar"
          className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Icon name="menu" className="h-6 w-6" />
        </button>

        <Link to="/" className="flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Icon name="cart" className="h-4 w-4" />
          </span>
          EnterpriseShop
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/cart"
            className="relative rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label={`Cart, ${cartCount} item(s)`}
          >
            <Icon name="cart" className="h-6 w-6" />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <form onSubmit={submitSearch} role="search" className="px-4 pb-3">
        <label htmlFor="mobile-search" className="sr-only">
          Search products
        </label>
        <input
          id="mobile-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          className="input"
        />
      </form>

      <div className="flex gap-3 overflow-x-auto border-t border-gray-100 px-4 py-2 text-xs text-gray-600">
        <span className="inline-flex shrink-0 items-center gap-1">
          <Icon name="truck" className="h-4 w-4 text-blue-600" />
          Free delivery over $100
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() =>
            dispatch(showToast({ message: 'Newsletter signup coming soon', type: 'info' }))
          }
        >
          Subscribe
        </Button>
      </div>
    </header>
  );
}

export default MobileHeader;
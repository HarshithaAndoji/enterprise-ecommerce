import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { LinkButton } from '../common/LinkButton';
import { useCategories } from '../../features/categories/useCategories';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setMobileMenuOpen } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { useBodyScrollLock } from '../../hooks';
import { classNames } from '../../utils';
import type { IconName } from '../common/Icon';

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const PRIMARY_LINKS: Array<{ label: string; to: string; icon: IconName }> = [
  { label: 'Home', to: '/', icon: 'dashboard' },
  { label: 'All products', to: '/products', icon: 'package' },
  { label: 'Wishlist', to: '/wishlist', icon: 'heart' },
  { label: 'Cart', to: '/cart', icon: 'cart' },
  { label: 'My orders', to: '/orders', icon: 'truck' },
  { label: 'Profile', to: '/profile', icon: 'user' },
];

/** Off-canvas navigation for mobile and tablet screens. */
export function Sidebar({ open, onClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { data: categories = [] } = useCategories();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useBodyScrollLock(open);

  // Navigating always closes the drawer.
  useEffect(() => {
    if (open) dispatch(setMobileMenuOpen(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div
      id="mobile-sidebar"
      className={classNames(
        'fixed inset-0 z-50 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <div
        className={classNames(
          'absolute inset-0 bg-gray-900/50 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={classNames(
          'absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <span className="flex items-center gap-2 text-base font-bold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Icon name="cart" className="h-4 w-4" />
            </span>
            Menu
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close navigation menu">
            <Icon name="close" className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    classNames(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100',
                    )
                  }
                >
                  <Icon name={link.icon} className="h-5 w-5" />
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Categories
          </h2>
          <ul className="mt-2 space-y-1">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/categories/${category.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {category.name}
                  <Icon name="chevron-right" className="h-4 w-4 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-200 px-4 py-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <div className="flex gap-2">
                <LinkButton to="/profile" variant="outline" size="sm" fullWidth onClick={onClose}>
                  My profile
                </LinkButton>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  leftIcon="logout"
                  onClick={() => {
                    dispatch(logout());
                    onClose();
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <LinkButton to="/login" size="sm" fullWidth onClick={onClose}>
                Sign in
              </LinkButton>
              <LinkButton to="/register" variant="outline" size="sm" fullWidth onClick={onClose}>
                Register
              </LinkButton>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;
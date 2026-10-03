import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { useAppDispatch, useAppSelector } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { setMobileMenuOpen } from '../store/slices/uiSlice';
import { useBodyScrollLock } from '../hooks';
import { classNames, getInitials } from '../utils';
import type { IconName } from '../components/common/Icon';

const ADMIN_LINKS: Array<{ label: string; to: string; icon: IconName; end?: boolean }> = [
  { label: 'Dashboard', to: '/admin', icon: 'dashboard', end: true },
  { label: 'Products', to: '/admin/products', icon: 'package' },
  { label: 'Categories', to: '/admin/categories', icon: 'tag' },
  { label: 'Orders', to: '/admin/orders', icon: 'truck' },
  { label: 'Users', to: '/admin/users', icon: 'users' },
  { label: 'Reviews', to: '/admin/reviews', icon: 'star' },
];

const PAGE_TITLES: Array<[string, string]> = [
  ['/admin/products', 'Products'],
  ['/admin/categories', 'Categories'],
  ['/admin/orders', 'Orders'],
  ['/admin/users', 'Users'],
  ['/admin/reviews', 'Reviews'],
  ['/admin', 'Dashboard'],
];

/** Admin shell: collapsible sidebar, top bar and the routed admin content. */
export function AdminLayout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useBodyScrollLock(sidebarOpen);

  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
    setSidebarOpen(false);
  }, [location.pathname, dispatch]);

  const title =
    PAGE_TITLES.find(([prefix]) => location.pathname.startsWith(prefix))?.[1] ?? 'Dashboard';

  const navClass = ({ isActive }: { isActive: boolean }) =>
    classNames(
      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white',
    );

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to admin content
      </a>

      {/* Sidebar: static on desktop, off-canvas on smaller screens. */}
      <aside
        className={classNames(
          'z-50 w-64 shrink-0 bg-gray-900 lg:sticky lg:top-0 lg:block lg:h-screen',
          sidebarOpen ? 'fixed inset-y-0 left-0 block' : 'hidden',
        )}
        aria-label="Admin navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <Link to="/admin" className="flex items-center gap-2 text-base font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Icon name="cog" className="h-4 w-4" />
            </span>
            Admin console
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close admin navigation"
          >
            <Icon name="close" className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {ADMIN_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
              <Icon name={link.icon} className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <div className="rounded-lg bg-gray-800 p-4">
            <p className="text-sm font-semibold text-white">{user?.name ?? 'Administrator'}</p>
            <p className="mt-0.5 truncate text-xs text-gray-400">{user?.email}</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 hover:underline"
              >
                <Icon name="arrow-left" className="h-3.5 w-3.5" />
                Back to storefront
              </Link>
              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white"
              >
                <Icon name="logout" className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin navigation"
            >
              <Icon name="menu" className="h-5 w-5" />
            </Button>

            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

            <div className="ml-auto flex items-center gap-3">
              <Link
                to="/"
                className="hidden text-sm font-medium text-gray-600 hover:text-blue-700 sm:inline"
              >
                View storefront
              </Link>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
                aria-hidden="true"
              >
                {getInitials(user?.name ?? 'Admin')}
              </span>
            </div>
          </div>
        </header>

        <main id="admin-content" className="flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
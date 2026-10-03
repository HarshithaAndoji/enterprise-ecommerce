import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import MobileHeader from '../components/layout/MobileHeader';
import Sidebar from '../components/layout/Sidebar';
import CartDrawer from '../components/layout/CartDrawer';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  selectCartDrawerOpen,
  selectMobileMenuOpen,
  setCartDrawerOpen,
  toggleMobileMenu,
} from '../store/slices/uiSlice';

/**
 * Storefront shell: desktop header, mobile header, the off-canvas navigation,
 * the cart drawer and the routed page content inside a skip-linked main region.
 */
export function MainLayout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const mobileMenuOpen = useAppSelector(selectMobileMenuOpen);
  const cartDrawerOpen = useAppSelector(selectCartDrawerOpen);

  // Route changes should reset both overlays.
  useEffect(() => {
    dispatch(setCartDrawerOpen(false));
  }, [location.pathname, dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow"
      >
        Skip to main content
      </a>

      <Header />
      <MobileHeader onToggleMenu={() => dispatch(toggleMobileMenu())} />

      <Sidebar open={mobileMenuOpen} onClose={() => dispatch(toggleMobileMenu())} />
      <CartDrawer open={cartDrawerOpen} onClose={() => dispatch(setCartDrawerOpen(false))} />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
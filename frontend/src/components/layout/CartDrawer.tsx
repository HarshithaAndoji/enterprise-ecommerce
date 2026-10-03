import { Link } from 'react-router-dom';
import { Button, EmptyState, Icon, LinkButton, Loading, ProductImage } from '../common';
import { useCart } from '../../features/cart/useCart';
import { useBodyScrollLock } from '../../hooks';
import { formatCurrency } from '../../utils';
import type { Cart } from '../../types';

export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart?: Cart;
}

/** Slide-over cart summary, opened from the header on desktop. */
export function CartDrawer({ open, onClose, cart }: CartDrawerProps) {
  const query = useCart();
  const data = cart ?? query.data;
  useBodyScrollLock(open);

  if (!open) return null;

  const items = data?.items ?? [];
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Your cart {itemCount > 0 ? `(${itemCount})` : ''}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close cart">
            <Icon name="close" className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-4">
          {query.isLoading ? (
            <Loading label="Loading your cart" rows={4} className="py-6" />
          ) : items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Browse the catalogue and add something you like."
              icon="cart"
              className="mt-6"
              action={
                <Link
                  to="/products"
                  onClick={onClose}
                  className="text-sm font-semibold text-blue-700 hover:underline"
                >
                  Start shopping
                </Link>
              }
            />
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-center gap-3 border-b border-gray-100 py-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <ProductImage
                        src={item.product.images[0]}
                        alt={item.product.name}
                        seed={item.product.slug || item.product.id}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.price ?? item.product.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <footer className="border-t border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(data?.subtotal ?? 0)}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Tax and delivery are calculated at checkout.
            </p>
            <div className="mt-4 flex gap-2">
              <LinkButton to="/cart" variant="outline" fullWidth onClick={onClose}>
                View cart
              </LinkButton>
              <LinkButton to="/checkout" fullWidth onClick={onClose}>
                Checkout
              </LinkButton>
            </div>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

export default CartDrawer;
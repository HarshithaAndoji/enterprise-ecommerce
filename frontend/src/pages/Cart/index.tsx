import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  LinkButton,
  Loading,
} from '../../components/common';
import CartItemCard from '../../features/cart/CartItemCard';
import { useCart, useClearCart } from '../../features/cart/useCart';
import { formatCurrency } from '../../utils';
// Aliased so the page component name does not shadow the domain type.
import type { Cart as CartModel } from '../../types';

/** Reusable order totals block shared by the cart and checkout screens. */
export function CartSummary({
  cart,
  children,
}: {
  cart: CartModel;
  children?: ReactNode;
}) {
  return (
    <section aria-label="Order summary" className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Subtotal</dt>
          <dd className="font-medium text-gray-900">{formatCurrency(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Estimated tax</dt>
          <dd className="font-medium text-gray-900">{formatCurrency(cart.tax)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Delivery</dt>
          <dd className="font-medium text-gray-900">
            {cart.shipping === 0 ? 'Free' : formatCurrency(cart.shipping)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
          <dt className="font-semibold text-gray-900">Total</dt>
          <dd className="font-bold text-gray-900">{formatCurrency(cart.total)}</dd>
        </div>
      </dl>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

/** Shopping cart page. */
export function Cart() {
  const { cart, isLoading, isError, error, refetch } = useCart();
  const clearCart = useClearCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Loading label="Loading your cart" rows={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  const isEmpty = cart.items.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Shopping cart</h1>
          <p className="mt-1 text-sm text-gray-500" aria-live="polite">
            {isEmpty
              ? 'Your cart is empty.'
              : `${cart.items.length} line item(s) ready to check out.`}
          </p>
        </div>
        {!isEmpty ? (
          showClearConfirm ? (
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  clearCart.mutate();
                  setShowClearConfirm(false);
                }}
                isLoading={clearCart.isPending}
              >
                Confirm empty cart
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>
                Keep items
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(true)}>
              Empty cart
            </Button>
          )
        ) : null}
      </header>

      {isEmpty ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse the catalogue and add a few items to get started."
          icon="cart"
          action={<LinkButton to="/products">Start shopping</LinkButton>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section aria-label="Cart items">
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white px-4">
              {cart.items.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <LinkButton to="/products" variant="outline" leftIcon="arrow-left">
                Continue shopping
              </LinkButton>
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <Icon name="truck" className="h-4 w-4 text-blue-600" />
                Free delivery on orders over {formatCurrency(100)}
              </p>
            </div>
          </section>

          <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            <CartSummary cart={cart}>
              <LinkButton to="/checkout" fullWidth size="lg" rightIcon="arrow-right">
                Proceed to checkout
              </LinkButton>
            </CartSummary>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
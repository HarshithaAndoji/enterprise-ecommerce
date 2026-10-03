import { Link } from 'react-router-dom';
import { Button, Icon, ProductImage } from '../common';
import { useRemoveCartItem, useUpdateCartItem } from '../../features/cart/useCart';
import {
  classNames,
  formatCurrency,
  getCartItemPrice,
  getCartItemTotal,
} from '../../utils';
import type { CartItem } from '../../types';

export interface CartItemCardProps {
  item: CartItem;
  /** Read-only variant used in the checkout summary and order confirmation. */
  compact?: boolean;
  className?: string;
}

/** A single line in the cart: artwork, quantity stepper, price and remove. */
export function CartItemCard({ item, compact = false, className }: CartItemCardProps) {
  const removeItem = useRemoveCartItem();
  const updateItem = useUpdateCartItem();
  const isUpdating = updateItem.isPending && updateItem.variables?.itemId === item.id;
  const productPath = `/products/${item.productId}`;

  const changeQuantity = (quantity: number) => {
    if (quantity < 1) return;
    updateItem.mutate({ itemId: item.id, quantity });
  };

  return (
    <li
      className={classNames(
        'flex gap-4 border-b border-gray-100 py-4 last:border-b-0',
        isUpdating && 'opacity-60',
        className,
      )}
    >
      <Link
        to={productPath}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100 sm:h-24 sm:w-24"
      >
        <ProductImage
          src={item.product.images[0]}
          alt={item.product.name}
          seed={item.product.slug || item.product.id}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              <Link to={productPath} className="hover:text-blue-700">
                {item.product.name}
              </Link>
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {item.product.brand ? `${item.product.brand} · ` : ''}
              {formatCurrency(getCartItemPrice(item))} each
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold text-gray-900">
            {formatCurrency(getCartItemTotal(item))}
          </p>
        </div>

        {compact ? null : (
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-md border border-gray-300">
              <button
                type="button"
                onClick={() => changeQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                aria-label={`Decrease quantity of ${item.product.name}`}
                className="rounded-l-md px-2.5 py-1.5 text-gray-600 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-40"
              >
                <Icon name="minus" className="h-4 w-4" />
              </button>

              <label htmlFor={`qty-${item.id}`} className="sr-only">
                Quantity for {item.product.name}
              </label>
              <input
                id={`qty-${item.id}`}
                type="number"
                min={1}
                max={Math.max(item.product.stock, 1)}
                value={item.quantity}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isFinite(next) && next >= 1) changeQuantity(next);
                }}
                className="w-12 border-x border-gray-300 py-1.5 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              />

              <button
                type="button"
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={item.quantity >= item.product.stock || isUpdating}
                aria-label={`Increase quantity of ${item.product.name}`}
                className="rounded-r-md px-2.5 py-1.5 text-gray-600 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-40"
              >
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem.mutate(item.id)}
              isLoading={removeItem.isPending && removeItem.variables === item.id}
              aria-label={`Remove ${item.product.name} from cart`}
              className="text-red-600 hover:bg-red-50"
            >
              <Icon name="trash" className="h-4 w-4" />
              <span className="hidden sm:inline">Remove</span>
            </Button>
          </div>
        )}

        </div>
    </li>
  );
}

export default CartItemCard;
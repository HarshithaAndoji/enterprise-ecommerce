import { Link } from 'react-router-dom';
import { Badge, Button, Icon, ProductImage, Rating } from '../common';
import { useAddToCart } from '../../features/cart/useCart';
import { useIsInWishlist, useToggleWishlist } from '../../features/wishlist/useWishlist';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';
import {
  classNames,
  formatCurrency,
  getDiscountPercentage,
  truncate,
} from '../../utils';
import type { Product } from '../../types';

export interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * Catalogue card used on the home page, category listings, search results and
 * related products. Entire card links to the product; the action buttons stop
 * propagation so they stay independently clickable.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const addToCart = useAddToCart();
  const wishlistQuery = useIsInWishlist(product.id);
  const wishlist = useToggleWishlist();

  const inWishlist = wishlistQuery.data ?? false;
  const outOfStock = product.stock <= 0;
  const discount = getDiscountPercentage(product.price, product.compareAtPrice);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      dispatch(
        showToast({ message: 'Sign in to start shopping', type: 'info' }),
      );
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Sign in to save items', type: 'info' }));
      return;
    }
    if (inWishlist) wishlist.remove.mutate(product.id);
    else wishlist.add.mutate(product.id);
  };

  return (
    <article
      className={classNames(
        'group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${product.id}`} tabIndex={-1} aria-hidden="true">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            seed={product.slug || product.id}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col gap-1">
          {discount > 0 ? <Badge tone="danger">-{discount}%</Badge> : null}
          {product.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
          {outOfStock ? <Badge tone="neutral">Out of stock</Badge> : null}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-gray-600 shadow-sm transition hover:bg-white hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Icon name="heart" className={classNames('h-4 w-4', inWishlist && 'fill-red-600 text-red-600')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category ? (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
            {product.category.name}
          </p>
        ) : null}

        <h3 className="text-sm font-semibold text-gray-900">
          <Link
            to={`/products/${product.id}`}
            className="line-clamp-2 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {truncate(product.name, 70)}
          </Link>
        </h3>

        <div className="mt-2">
          <Rating value={product.rating} count={product.reviewCount} size="sm" />
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          {product.compareAtPrice ? (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2 pt-1">
          <Button
            size="sm"
            fullWidth
            onClick={handleAddToCart}
            isLoading={addToCart.isPending && addToCart.variables?.productId === product.id}
            disabled={outOfStock}
            leftIcon="cart"
          >
            {outOfStock ? 'Unavailable' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
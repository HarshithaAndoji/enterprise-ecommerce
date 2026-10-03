import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  LinkButton,
  Loading,
} from '../../components/common';
import ProductGrid from '../../features/products/ProductGrid';
import { useAddToCart } from '../../features/cart/useCart';
import { useToggleWishlist, useWishlist } from '../../features/wishlist/useWishlist';
import { formatCurrency } from '../../utils';

/** Saved items page. */
export function Wishlist() {
  const wishlistQuery = useWishlist();
  const addToCart = useAddToCart();
  const { remove } = useToggleWishlist();
  const products = wishlistQuery.data ?? [];

  if (wishlistQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Loading variant="cards" label="Loading your wishlist" />
      </div>
    );
  }

  if (wishlistQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState error={wishlistQuery.error} onRetry={() => wishlistQuery.refetch()} />
      </div>
    );
  }

  const total = products.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Your wishlist</h1>
          <p className="mt-1 text-sm text-gray-500" aria-live="polite">
            {products.length === 0
              ? 'Nothing saved yet.'
              : `${products.length} saved item(s) worth ${formatCurrency(total)}`}
          </p>
        </div>
        {products.length > 0 ? (
          <LinkButton to="/products" variant="outline" leftIcon="search">
            Find more products
          </LinkButton>
        ) : null}
      </header>

      {products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          icon="heart"
          action={<LinkButton to="/products">Browse products</LinkButton>}
        />
      ) : (
        <>
          <ProductGrid products={products} />

          <section className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Add everything to cart</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Moves each saved item into your cart, skipping anything out of stock.
                </p>
              </div>
              <Button
                onClick={() => {
                  products
                    .filter((product) => product.stock > 0)
                    .forEach((product) =>
                      addToCart.mutate({ productId: product.id, quantity: 1 }),
                    );
                }}
                isLoading={addToCart.isPending}
                leftIcon="cart"
              >
                Add all to cart
              </Button>
            </div>

            <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  <LinkButton to={`/products/${product.id}`} variant="ghost" size="sm">
                    {product.name}
                  </LinkButton>
                  <div className="flex items-center gap-2">
                    {product.stock <= 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600">
                        <Icon name="warning" className="h-3.5 w-3.5" />
                        Out of stock
                      </span>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => remove.mutate(product.id)}
                      isLoading={remove.isPending && remove.variables === product.id}
                    >
                      <Icon name="trash" className="h-4 w-4" />
                      <span className="sr-only">Remove {product.name}</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default Wishlist;
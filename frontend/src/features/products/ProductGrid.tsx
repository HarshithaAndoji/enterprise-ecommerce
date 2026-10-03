import type { ReactNode } from 'react';
import { EmptyState, ErrorState, Loading } from '../../components/common';
import ProductCard from '../../components/product/ProductCard';
import { classNames } from '../../utils';
import type { Product } from '../../types';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  columns?: 3 | 4;
  className?: string;
}

/**
 * Responsive product grid that owns the loading, error and empty states so
 * every catalogue surface behaves identically.
 */
export function ProductGrid({
  products,
  isLoading = false,
  error,
  onRetry,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters or search for something else.',
  emptyAction,
  columns = 4,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return <Loading variant="cards" label="Loading products" className={className} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} className={className} />;
  }

  if (!products.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon="search"
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div
      className={classNames(
        'grid grid-cols-2 gap-4 sm:grid-cols-3',
        columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
import { Link } from 'react-router-dom';
import {
  ErrorState,
  LinkButton,
  Loading,
  Pagination,
} from '../../components/common';
import ProductFilters from '../../features/products/ProductFilters';
import ProductGrid from '../../features/products/ProductGrid';
import { useProductsList } from '../../features/products/useProducts';
import { useUrlProductFilters } from '../../features/products/useUrlProductFilters';

/**
 * Catalogue page. Serves /products, /search and /categories/:slug because the
 * filter state is derived from the URL.
 */
export function Products() {
  const { filters, setFilters, category } = useUrlProductFilters();
  const query = useProductsList(filters);

  const heading = category ? category.name : filters.search ? 'Search results' : 'All products';
  const subheading = category
    ? category.description
    : filters.search
      ? `Showing matches for "${filters.search}"`
      : 'Filter by category, price or rating to narrow things down.';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-blue-700 hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          {category ? (
            <li>
              <Link to="/products" className="hover:text-blue-700 hover:underline">
                Products
              </Link>
            </li>
          ) : null}
          {category ? (
            <>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-gray-700">
                {category.name}
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{heading}</h1>
        {subheading ? <p className="mt-1 text-sm text-gray-500">{subheading}</p> : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <ProductFilters value={filters} onChange={setFilters} />
        </aside>

        <section aria-label="Product results">
          <div className="mb-4 flex items-center justify-between gap-3 text-sm text-gray-600">
            <p aria-live="polite">
              {query.isLoading
                ? 'Loading products...'
                : `${query.data?.total ?? 0} product(s) found`}
            </p>
          </div>

          <ProductGrid
            products={query.data?.products ?? []}
            isLoading={query.isLoading}
            error={query.isError ? query.error : undefined}
            onRetry={() => query.refetch()}
            emptyAction={
              <LinkButton to="/products" variant="outline" size="sm">
                Clear filters
              </LinkButton>
            }
          />

          <div className="mt-8">
            {query.isLoading ? (
              <Loading label="Loading pagination" rows={1} className="justify-center" />
            ) : query.isError ? (
              <ErrorState error={query.error} onRetry={() => query.refetch()} />
            ) : (
              <Pagination
                page={filters.page ?? 1}
                totalPages={query.data?.totalPages ?? 1}
                onPageChange={(page) => setFilters({ ...filters, page })}
                disabled={query.isFetching}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Products;
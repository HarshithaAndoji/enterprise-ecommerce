import { useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCategoryBySlug } from '../categories/useCategories';
import type { ProductFilters, SortOption } from '../../types';

const SORTS: SortOption[] = ['newest', 'price_asc', 'price_desc', 'rating', 'name_asc', 'popular'];

/**
 * Keeps the product filter state in the URL so the catalogue page is
 * shareable, bookmarkable and works with the back button. Supports the plain
 * /products view, /search?q= and /categories/:slug deep links.
 */
export function useUrlProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams<{ slug: string }>();
  const { data: category } = useCategoryBySlug(slug);

  const filters = useMemo<ProductFilters>(() => {
    const numberOrUndefined = (key: string): number | undefined => {
      const raw = searchParams.get(key);
      if (raw === null || raw === '') return undefined;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const sort = searchParams.get('sort');
    const search =
      searchParams.get('search') ?? searchParams.get('q') ?? undefined;

    return {
      search: search || undefined,
      categoryId: category?.id,
      categorySlug: category?.slug,
      minPrice: numberOrUndefined('minPrice'),
      maxPrice: numberOrUndefined('maxPrice'),
      rating: numberOrUndefined('rating'),
      inStock: searchParams.get('inStock') === 'true' ? true : undefined,
      sort: sort && SORTS.includes(sort as SortOption) ? (sort as SortOption) : 'newest',
      page: numberOrUndefined('page') ?? 1,
      limit: numberOrUndefined('limit') ?? 12,
    };
  }, [searchParams, category]);

  const setFilters = useCallback(
    (next: ProductFilters) => {
      const params = new URLSearchParams();
      if (next.search) params.set('search', next.search);
      if (next.categoryId) params.set('category', next.categoryId);
      if (next.minPrice !== undefined) params.set('minPrice', String(next.minPrice));
      if (next.maxPrice !== undefined) params.set('maxPrice', String(next.maxPrice));
      if (next.rating !== undefined) params.set('rating', String(next.rating));
      if (next.inStock) params.set('inStock', 'true');
      if (next.sort && next.sort !== 'newest') params.set('sort', next.sort);
      if (next.page && next.page > 1) params.set('page', String(next.page));
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  return { filters, setFilters, category };
}

export default useUrlProductFilters;
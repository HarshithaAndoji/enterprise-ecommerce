import { useQuery } from '@tanstack/react-query';
import * as productsService from '../../services/products.api';
import { queryKeys } from '../../services/queryKeys';
import type { ApiResponse, Product, ProductFilters, SortOption } from '../../types';

const DEFAULT_LIMIT = 12;

export interface ProductListResult {
  products: Product[];
  total: number;
  totalPages: number;
}

/** Paginated + filtered product list (the workhorse of the catalogue pages). */
export function useProductsList(filters: ProductFilters) {
  const query = useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async (): Promise<ProductListResult> => {
      const response = await productsService.getProducts({
        limit: DEFAULT_LIMIT,
        ...filters,
      });
      return {
        products: response.data ?? [],
        total: response.pagination?.total ?? response.data?.length ?? 0,
        totalPages: response.pagination?.totalPages ?? 1,
      };
    },
    placeholderData: (previous) => previous,
    staleTime: 60 * 1000,
  });

  return query;
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => productsService.getProduct(id as string),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: productsService.getFeaturedProducts,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularProducts() {
  return useQuery({
    queryKey: queryKeys.products.popular(),
    queryFn: productsService.getPopularProducts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentlyAdded() {
  return useQuery({
    queryKey: queryKeys.products.recent(),
    queryFn: productsService.getRecentlyAdded,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRelatedProducts(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.related(id ?? ''),
    queryFn: () => productsService.getRelatedProducts(id as string),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

/** Typeahead search used by the header search field. */
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: () => productsService.searchProducts(query),
    enabled: query.trim().length > 1,
    staleTime: 30 * 1000,
  });
}

/** Convenience wrapper for callers that need the raw envelope shape. */
export function useRawProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productsService.getProducts(filters),
    placeholderData: (previous) => previous as ApiResponse<Product[]> | undefined,
    staleTime: 60 * 1000,
  });
}

export const PRODUCT_SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'popular', label: 'Most popular' },
];

export const PRICE_BOUNDS = { min: 0, max: 1500 };
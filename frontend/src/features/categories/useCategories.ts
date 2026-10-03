import { useQuery } from '@tanstack/react-query';
import * as categoriesService from '../../services/categories.api';
import { queryKeys } from '../../services/queryKeys';

/** Category list for the home page, header dropdown and product filters. */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: categoriesService.getCategories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug ?? ''),
    queryFn: () => categoriesService.getCategoryBySlug(slug as string),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });
}
import { useEffect, useState } from 'react';
import { Button, Icon } from '../../components/common';
import { FormSelect } from '../../components/forms/FormSelect';
import { Input } from '../../components/common/Input';
import { useCategories } from '../categories/useCategories';
import { useDebounce } from '../../hooks';
import { classNames } from '../../utils';
import { PRODUCT_SORT_OPTIONS, PRICE_BOUNDS } from './useProducts';
// Aliased so the local component name does not shadow the domain type.
import type { Category, ProductFilters as ProductFilterValues } from '../../types';

export interface ProductFiltersProps {
  value: ProductFilterValues;
  onChange: (filters: ProductFilterValues) => void;
  categories?: Category[];
  /** Hides the search box when the page already renders its own header. */
  hideSearch?: boolean;
  className?: string;
}

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5 & up' },
  { value: '4', label: '4.0 & up' },
  { value: '3', label: '3.0 & up' },
];

/**
 * Search, category, price, rating and sort controls. The search box is debounced
 * locally so typing does not flood the query cache.
 */
export function ProductFilters({
  value,
  onChange,
  categories,
  hideSearch = false,
  className,
}: ProductFiltersProps) {
  const { data: fetchedCategories } = useCategories();
  const categoryOptions = categories ?? fetchedCategories ?? [];

  const [search, setSearch] = useState(value.search ?? '');
  const debouncedSearch = useDebounce(search, 400);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if ((value.search ?? '') !== debouncedSearch) {
      onChange({ ...value, search: debouncedSearch || undefined, page: 1 });
    }
    // Only the debounced value should push updates into the filter state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setSearch(value.search ?? '');
  }, [value.search]);

  const setFilter = <K extends keyof ProductFilterValues>(
    key: K,
    nextValue: ProductFilterValues[K],
  ) => {
    onChange({ ...value, [key]: nextValue, page: 1 });
  };

  const clearAll = () => {
    setSearch('');
    onChange({ page: value.page, limit: value.limit });
  };

  const activeCount = [
    value.categoryId ?? value.categorySlug,
    value.minPrice,
    value.maxPrice,
    value.rating,
    value.inStock,
  ].filter((entry) => entry !== undefined && entry !== '').length;

  return (
    <section className={classNames('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Icon name="filter" className="h-4 w-4" />
          Filters
          {activeCount > 0 ? (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {activeCount}
            </span>
          ) : null}
        </h2>
        <div className="flex items-center gap-2">
          {activeCount > 0 || search ? (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear
            </Button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="product-filters-panel"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 md:hidden"
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div
        id="product-filters-panel"
        className={classNames('mt-4 gap-4', isOpen ? 'grid' : 'hidden', 'md:grid md:grid-cols-2 lg:grid-cols-5')}
      >
        {hideSearch ? null : (
          <div className="md:col-span-2 lg:col-span-5">
            <label htmlFor="product-search" className="label">
              Search products
            </label>
            <Input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, brand or keyword"
              addon={<Icon name="search" className="h-4 w-4 text-gray-400" />}
            />
          </div>
        )}

        <FormSelect
          label="Category"
          value={value.categoryId ?? value.categorySlug ?? ''}
          onChange={(next) =>
            setFilter('categoryId', next === '' ? undefined : next)
          }
          options={categoryOptions.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          placeholder="All categories"
        />

        <div>
          <span className="label" id="price-range-label">
            Price range
          </span>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-labelledby="price-range-label"
          >
            <Input
              type="number"
              inputMode="numeric"
              min={PRICE_BOUNDS.min}
              max={PRICE_BOUNDS.max}
              placeholder={String(PRICE_BOUNDS.min)}
              aria-label="Minimum price"
              value={value.minPrice ?? ''}
              onChange={(event) =>
                setFilter(
                  'minPrice',
                  event.target.value === '' ? undefined : Number(event.target.value),
                )
              }
            />
            <span className="text-gray-400" aria-hidden="true">
              &ndash;
            </span>
            <Input
              type="number"
              inputMode="numeric"
              min={PRICE_BOUNDS.min}
              max={PRICE_BOUNDS.max}
              placeholder={String(PRICE_BOUNDS.max)}
              aria-label="Maximum price"
              value={value.maxPrice ?? ''}
              onChange={(event) =>
                setFilter(
                  'maxPrice',
                  event.target.value === '' ? undefined : Number(event.target.value),
                )
              }
            />
          </div>
        </div>

        <FormSelect
          label="Rating"
          value={value.rating ? String(value.rating) : ''}
          onChange={(next) => setFilter('rating', next === '' ? undefined : Number(next))}
          options={RATING_OPTIONS}
          placeholder="Any rating"
        />

        <FormSelect
          label="Sort by"
          value={value.sort ?? 'newest'}
          onChange={(next) => setFilter('sort', next as ProductFilterValues['sort'])}
          options={PRODUCT_SORT_OPTIONS}
        />

        <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={Boolean(value.inStock)}
            onChange={(event) => setFilter('inStock', event.target.checked || undefined)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          In stock only
        </label>
      </div>
    </section>
  );
}

export default ProductFilters;
import { classNames } from '../../utils';
import { Icon } from './Icon';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Disables navigation, e.g. while a page change is in flight. */
  disabled?: boolean;
}

/** Builds a compact page list with ellipses, e.g. 1 … 4 5 6 … 12. */
function buildPageRange(page: number, totalPages: number): Array<number | 'gap'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages = new Set<number>([1, totalPages, page]);
  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < totalPages) pages.add(page + 1);
  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | 'gap'> = [];
  let previous = 0;
  sorted.forEach((value) => {
    if (previous && value - previous > 1) result.push('gap');
    result.push(value);
    previous = value;
  });
  return result;
}

/** Numbered pagination control with previous/next buttons. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const range = buildPageRange(page, totalPages);

  const buttonClass =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav
      aria-label="Pagination"
      className={classNames('flex items-center justify-center gap-1.5', className)}
    >
      <button
        type="button"
        className={classNames(buttonClass, 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')}
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Go to previous page"
      >
        <Icon name="chevron-left" className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Previous</span>
      </button>

      <ul className="flex items-center gap-1.5">
        {range.map((entry, index) =>
          entry === 'gap' ? (
            <li
              key={`gap-${index}`}
              className="px-1 text-sm text-gray-400"
              aria-hidden="true"
            >
              &hellip;
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                onClick={() => onPageChange(entry)}
                disabled={disabled}
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`Go to page ${entry}`}
                className={classNames(
                  buttonClass,
                  entry === page
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                )}
              >
                {entry}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={classNames(buttonClass, 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')}
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Go to next page"
      >
        <span className="mr-1 hidden sm:inline">Next</span>
        <Icon name="chevron-right" className="h-4 w-4" />
      </button>
    </nav>
  );
}

export default Pagination;
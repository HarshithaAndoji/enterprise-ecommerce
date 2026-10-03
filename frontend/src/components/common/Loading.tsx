import { classNames } from '../../utils';

export interface LoadingProps {
  label?: string;
  className?: string;
  /** Number of skeleton blocks to render. */
  rows?: number;
  variant?: 'spinner' | 'skeleton' | 'cards';
}

/**
 * Loading primitives: a spinner for small regions, skeletons for lists and
 * card placeholders for grids. All variants announce themselves politely.
 */
export function Loading({
  label = 'Loading...',
  className,
  rows = 3,
  variant = 'skeleton',
}: LoadingProps) {
  if (variant === 'spinner') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={classNames('flex flex-col items-center justify-center gap-3 py-10', className)}
      >
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={classNames('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="aspect-square w-full bg-gray-200" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
              <div className="h-8 w-full rounded bg-gray-200" />
            </div>
          </div>
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={classNames('space-y-3', className)}
      aria-label={label}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-md bg-gray-200" style={{ height: 16 }} />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Loading;
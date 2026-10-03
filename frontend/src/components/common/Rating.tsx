import { classNames } from '../../utils';
import { Icon } from './Icon';

export interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  label?: string;
}

const STAR_SIZES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/**
 * Read-only star rating. The star row is hidden from assistive tech and the
 * group is described with a single readable label instead.
 */
export function Rating({
  value,
  count,
  size = 'md',
  showValue = true,
  className,
  label,
}: RatingProps) {
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 5) : 0;
  const rounded = Math.round(safeValue * 2) / 2;
  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className={classNames('flex items-center gap-1.5', className)}
      role="img"
      aria-label={label ?? `Rated ${safeValue.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ''}`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {stars.map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          return (
            <span key={star} className="relative inline-flex">
              <Icon
                name="star"
                className={classNames(
                  STAR_SIZES[size],
                  filled ? 'text-amber-400' : 'text-gray-300',
                )}
              />
              {half ? (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: '50%' }}
                >
                  <Icon name="star" className={classNames(STAR_SIZES[size], 'text-amber-400')} />
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span aria-hidden="true" className="text-xs font-medium text-gray-600">
          {safeValue.toFixed(1)}
          {count !== undefined ? (
            <span className="ml-1 font-normal text-gray-400">({count})</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

export default Rating;
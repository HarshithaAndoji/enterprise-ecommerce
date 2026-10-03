import type { ReactNode } from 'react';
import { classNames } from '../../utils';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: ReactNode;
  className?: string;
}

/** Consistent "there is nothing here yet" block with an optional CTA. */
export function EmptyState({
  title,
  description,
  icon = 'package',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center',
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description ? (
          <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export default EmptyState;
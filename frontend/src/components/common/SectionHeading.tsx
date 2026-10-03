import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { classNames } from '../../utils';

export interface SectionHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  /** Renders a "view all" link to this path when provided. */
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
}

/** Reusable section header used by the home page and list pages. */
export function SectionHeading({
  title,
  description,
  eyebrow,
  action,
  viewAllHref,
  viewAllLabel = 'View all',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={classNames(
        'mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
        ) : null}
      </div>
      {action}
      {viewAllHref ? (
        <Link
          to={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
        >
          {viewAllLabel}
          <span aria-hidden="true">&rarr;</span>
        </Link>
      ) : null}
    </div>
  );
}

export default SectionHeading;
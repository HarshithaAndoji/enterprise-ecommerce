import type { ReactNode } from 'react';
import { classNames, STATUS_TONES } from '../../utils';
import type { BadgeTone } from '../../types';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  accent: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

/** Small pill used for statuses, counts and tags. */
export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Maps a domain status (order, payment, user) to the matching badge tone.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = (STATUS_TONES[status] ?? 'neutral') as BadgeTone;
  return (
    <Badge tone={tone} className={classNames('capitalize', className)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

export default Badge;
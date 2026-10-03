import { classNames } from '../../utils';
import { getErrorMessage } from '../../utils';
import { Button } from './Button';
import { Icon } from './Icon';

export interface ErrorStateProps {
  error?: unknown;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * Shared error state for every API driven screen. Rendered as an alert so
 * screen readers announce the failure as soon as it appears.
 */
export function ErrorState({
  error,
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  const text = message ?? getErrorMessage(error);

  return (
    <div
      role="alert"
      className={classNames(
        'flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <Icon name="warning" className="h-6 w-6" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-red-900">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-red-700">{text}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} leftIcon="arrow-right">
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default ErrorState;
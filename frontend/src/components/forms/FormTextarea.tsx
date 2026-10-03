import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { classNames } from '../../utils';

export interface FormTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
}

/** Multi-line input used for addresses, product descriptions and reviews. */
export function FormTextarea({
  label,
  error,
  hint,
  rows = 4,
  id,
  className,
  required,
  ...rest
}: FormTextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={classNames('w-full', className)}>
      {label ? (
        <label htmlFor={textareaId} className="label">
          {label}
          {required ? (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={classNames('input resize-y', error && 'border-red-400 focus:ring-red-500')}
        {...rest}
      />

      {hint && !error ? (
        <p id={hintId} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default FormTextarea;
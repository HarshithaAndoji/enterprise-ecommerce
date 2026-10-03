import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../../utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  /** Rendered on the right of the field, e.g. a show/hide password toggle. */
  addon?: ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

/**
 * Text input with an always-rendered <label>, optional hint and error message
 * wired up through aria-describedby / aria-invalid.
 */
export function Input({
  label,
  hint,
  error,
  addon,
  className,
  inputSize = 'md',
  id,
  type = 'text',
  required,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames('w-full', className)}>
      {label ? (
        <label htmlFor={inputId} className="label">
          {label}
          {required ? (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div className="relative flex items-center">
        <input
          id={inputId}
          type={type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={classNames(
            'input',
            inputSize === 'sm' && 'px-2.5 py-1.5 text-sm',
            inputSize === 'lg' && 'px-4 py-3',
            error && 'border-red-400 focus:ring-red-500',
            Boolean(addon) && 'pr-12',
          )}
          {...rest}
        />
        {addon ? (
          <div className="absolute right-2 flex items-center">{addon}</div>
        ) : null}
      </div>

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

export default Input;
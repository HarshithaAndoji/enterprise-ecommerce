import { Input } from '../common/Input';
import type { InputProps } from '../common/Input';

export type FormInputProps = InputProps;

/**
 * Form specific text input. Keeps a consistent name/hint/error contract across
 * every form in the app while delegating markup to the common Input.
 */
export function FormInput({
  name,
  label,
  error,
  hint,
  ...rest
}: FormInputProps) {
  return (
    <Input
      name={name}
      label={label}
      error={error}
      hint={hint}
      autoComplete={rest.autoComplete ?? 'off'}
      {...rest}
    />
  );
}

export default FormInput;
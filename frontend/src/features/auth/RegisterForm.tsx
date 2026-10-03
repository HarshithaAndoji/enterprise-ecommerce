import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useRegister } from './useAuth';
import { useAppSelector } from '../../store/store';
import { USE_MOCK_API } from '../../services/api';
import type { User } from '../../types';

export interface RegisterFormProps {
  onSuccess?: (user: User) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your full name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Enter a valid email address';
  if (values.password.length < 8) errors.password = 'Use at least 8 characters';
  if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Passwords do not match';
  return errors;
}

/** Account creation form with client side validation. */
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const register = useRegister();
  const reduxError = useAppSelector((state) => state.auth.error);

  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    register.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      },
      { onSuccess: (result) => onSuccess?.(result.user) },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {reduxError ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {reduxError}
        </p>
      ) : null}

      <Input
        label="Full name"
        name="name"
        required
        autoComplete="name"
        value={values.name}
        error={errors.name}
        onChange={(event) => update('name', event.target.value)}
        placeholder="Alex Morgan"
      />

      <Input
        label="Email address"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(event) => update('email', event.target.value)}
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        hint="At least 8 characters"
        value={values.password}
        error={errors.password}
        onChange={(event) => update('password', event.target.value)}
      />

      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(event) => update('confirmPassword', event.target.value)}
      />

      <Button type="submit" fullWidth size="lg" isLoading={register.isPending}>
        {register.isPending ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-700 hover:underline">
          Sign in
        </Link>
      </p>

      {USE_MOCK_API ? null : (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Your details are posted to <code>POST /api/users/register</code>. The backend echoes
          them back without persisting a user or issuing a token yet, so the session token is
          provisional until auth is implemented.
        </p>
      )}
    </form>
  );
}

export default RegisterForm;
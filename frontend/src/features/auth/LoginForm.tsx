import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useLogin } from './useAuth';
import { useAppSelector } from '../../store/store';
import { USE_MOCK_API } from '../../services/api';
import { getErrorMessage } from '../../utils';
import type { User } from '../../types';

export interface LoginFormProps {
  onSuccess?: (user: User) => void;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

/** Sign in form. Credentials live in local component state only. */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const login = useLogin();
  const reduxError = useAppSelector((state) => state.auth.error);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (result) => onSuccess?.(result.user),
      },
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
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        error={errors.email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        error={errors.password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your password"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Remember me
        </label>
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={login.isPending}
        disabled={login.isPending}
      >
        {login.isPending ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        New to the platform?{' '}
        <Link to="/register" className="font-semibold text-blue-700 hover:underline">
          Create an account
        </Link>
      </p>

      {USE_MOCK_API ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <p className="font-semibold">Dev mode &mdash; no backend configured</p>
          <p className="mt-1">
            Customer: <code>customer@demo.com</code> / <code>customer123</code>
          </p>
          <p>
            Admin: <code>admin@demo.com</code> / <code>admin123</code>
          </p>
          {login.isError ? (
            <p className="mt-1 font-medium">{getErrorMessage(login.error)}</p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <p className="font-semibold">Backend connected</p>
          <p className="mt-1">
            Credentials are posted to <code>POST /api/users/login</code>. The backend does not
            issue JWTs yet, so the session token is provisional and every other screen still
            reads from the local demo dataset until the API is implemented.
          </p>
        </div>
      )}
    </form>
  );
}

export default LoginForm;
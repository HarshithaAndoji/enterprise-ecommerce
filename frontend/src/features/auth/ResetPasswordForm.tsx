import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useResetPassword } from './useAuth';
import { useAppSelector } from '../../store/store';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  token?: string;
}

/** Sets a new password from the token in the reset link. */
export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [values, setValues] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const resetPassword = useResetPassword();
  const reduxMessage = useAppSelector((state) => state.auth.message);
  const reduxError = useAppSelector((state) => state.auth.error);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!token) nextErrors.token = 'This reset link is invalid or has expired.';
    if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters';
    if (values.confirmPassword !== values.password)
      nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    resetPassword.mutate({ token, password: values.password });
  };

  if (resetPassword.isSuccess) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h2 className="text-base font-semibold text-emerald-900">Password updated</h2>
        <p className="mt-1 text-sm text-emerald-800">{reduxMessage}</p>
        <Link
          to="/login"
          className="mt-4 inline-block text-sm font-semibold text-emerald-900 hover:underline"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {errors.token ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errors.token}
        </p>
      ) : null}
      {reduxError ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {reduxError}
        </p>
      ) : null}

      <Input
        label="New password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        hint="At least 8 characters"
        value={values.password}
        error={errors.password}
        onChange={(event) =>
          setValues((current) => ({ ...current, password: event.target.value }))
        }
      />

      <Input
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(event) =>
          setValues((current) => ({ ...current, confirmPassword: event.target.value }))
        }
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={resetPassword.isPending}
        disabled={!token}
      >
        Update password
      </Button>
    </form>
  );
}

export default ResetPasswordForm;
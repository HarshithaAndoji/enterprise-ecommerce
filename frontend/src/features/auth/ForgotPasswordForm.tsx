import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { Input } from '../../components/common/Input';
import { useForgotPassword } from './useAuth';

/** Requests a password reset email. Never reveals whether an account exists. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const forgotPassword = useForgotPassword();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    setError(undefined);
    forgotPassword.mutate(email.trim());
  };

  if (forgotPassword.isSuccess) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Icon name="check" className="h-6 w-6" />
        </span>
        <h2 className="text-base font-semibold text-emerald-900">Check your inbox</h2>
        <p className="mt-1 text-sm text-emerald-800">
          If an account exists for {email}, a password reset link is on its way.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block text-sm font-semibold text-emerald-900 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        label="Email address"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        error={error}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        hint="We will email you a link to choose a new password."
      />

      <Button type="submit" fullWidth size="lg" isLoading={forgotPassword.isPending}>
        {forgotPassword.isPending ? 'Sending...' : 'Send reset link'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-blue-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export default ForgotPasswordForm;
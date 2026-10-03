import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../../features/auth/ForgotPasswordForm';

/** Password recovery request screen. */
export function ForgotPassword() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Forgot your password?</h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">
          Enter the email address on your account and we will send you a link to reset your
          password.
        </p>
        <ForgotPasswordForm />
      </section>

      <p className="mt-6 text-center text-sm text-gray-600">
        Need help?{' '}
        <Link to="/" className="font-semibold text-blue-700 hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}

export default ForgotPassword;
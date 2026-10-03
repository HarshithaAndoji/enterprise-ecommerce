import { Link } from 'react-router-dom';
import ResetPasswordForm from '../../features/auth/ResetPasswordForm';

/** Password reset screen, driven by the ?token= query parameter. */
export function ResetPassword() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Choose a new password</h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">
          Pick something you have not used before. You will be signed out everywhere else.
        </p>
        <ResetPasswordForm />
      </section>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/login" className="font-semibold text-blue-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default ResetPassword;
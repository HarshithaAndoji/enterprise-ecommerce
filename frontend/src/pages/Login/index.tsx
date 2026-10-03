import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../../features/auth/LoginForm';
import { Icon } from '../../components/common/Icon';
import { useAppSelector } from '../../store/store';

/** Login screen. Redirects back to the attempted page after a successful sign in. */
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  if (isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-gray-600">
          You are already signed in.{' '}
          <Link to="/" className="font-semibold text-blue-700 hover:underline">
            Continue shopping
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center">
      <section className="hidden flex-1 lg:block">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-3 max-w-md text-gray-600">
          Sign in to track orders, save items to your wishlist and check out faster with
          your saved addresses.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Icon name="check" className="h-4 w-4 text-emerald-600" />
            One click reorder from your order history
          </li>
          <li className="flex items-center gap-2">
            <Icon name="check" className="h-4 w-4 text-emerald-600" />
            Wishlist synced across devices
          </li>
          <li className="flex items-center gap-2">
            <Icon name="check" className="h-4 w-4 text-emerald-600" />
            Faster checkout with stored addresses
          </li>
        </ul>
      </section>

      <section className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:max-w-md">
        <h2 className="text-xl font-bold text-gray-900">Sign in</h2>
        <p className="mb-6 mt-1 text-sm text-gray-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-blue-700 hover:underline">
            Create an account
          </Link>
        </p>
        <LoginForm onSuccess={() => navigate(from, { replace: true })} />
      </section>
    </div>
  );
}

export default Login;
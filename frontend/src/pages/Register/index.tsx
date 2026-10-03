import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../../features/auth/RegisterForm';
import { Icon } from '../../components/common/Icon';

/** Account creation screen. */
export function Register() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center">
      <section className="hidden flex-1 lg:block">
        <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-3 max-w-md text-gray-600">
          Join to unlock faster checkout, order tracking and personalised product
          recommendations.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Icon name="sparkles" className="h-4 w-4 text-blue-600" />
            Member only promotions
          </li>
          <li className="flex items-center gap-2">
            <Icon name="truck" className="h-4 w-4 text-blue-600" />
            Track every order in one place
          </li>
          <li className="flex items-center gap-2">
            <Icon name="lock" className="h-4 w-4 text-emerald-600" />
            We never store your password in the browser store
          </li>
        </ul>
      </section>

      <section className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:max-w-md">
        <h2 className="text-xl font-bold text-gray-900">Register</h2>
        <p className="mb-6 mt-1 text-sm text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-700 hover:underline">
            Sign in
          </Link>
        </p>
        <RegisterForm onSuccess={() => navigate('/', { replace: true })} />
      </section>
    </div>
  );
}

export default Register;
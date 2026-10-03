import { LinkButton } from '../../components/common';
import { Icon } from '../../components/common/Icon';

/** Catch-all route for unknown URLs. */
export function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <Icon name="search" className="h-8 w-8" />
      </span>
      <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-600">
        The page you were looking for does not exist or may have moved.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <LinkButton to="/" size="lg">
          Back to home
        </LinkButton>
        <LinkButton to="/products" variant="outline" size="lg">
          Browse products
        </LinkButton>
      </div>
    </div>
  );
}

export default NotFound;
import { EmptyState, ErrorState, LinkButton, Loading } from '../../components/common';
import OrderCard from '../../features/orders/OrderCard';
import { useOrders } from '../../features/orders/useOrders';

/** Customer order history. */
export function Orders() {
  const query = useOrders();
  const orders = query.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My orders</h1>
        <p className="mt-1 text-sm text-gray-500" aria-live="polite">
          {query.isLoading
            ? 'Loading your orders...'
            : `${orders.length} order(s) placed with your account.`}
        </p>
      </header>

      {query.isLoading ? (
        <Loading label="Loading your orders" rows={4} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order it will appear here with tracking details."
          icon="truck"
          action={<LinkButton to="/products">Start shopping</LinkButton>}
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Orders;
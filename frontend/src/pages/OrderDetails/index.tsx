import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  ErrorState,
  LinkButton,
  Loading,
  ProductImage,
  StatusBadge,
} from '../../components/common';
import OrderCard from '../../features/orders/OrderCard';
import { useOrder } from '../../features/orders/useOrders';
import { formatCurrency, formatDate } from '../../utils';

const TIMELINE: Array<{ status: string; label: string }> = [
  { status: 'confirmed', label: 'Order confirmed' },
  { status: 'processing', label: 'Being prepared' },
  { status: 'shipped', label: 'On the way' },
  { status: 'delivered', label: 'Delivered' },
];

const STATUS_ORDER = TIMELINE.map((step) => step.status);

/** Full detail view for a single order. */
export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const query = useOrder(id);

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Loading label="Loading order" rows={6} />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState
          error={query.error}
          title="Order not found"
          message="This order may belong to another account or have been removed."
          onRetry={() => query.refetch()}
        />
        <div className="mt-6 text-center">
          <Link to="/orders" className="text-sm font-semibold text-blue-700 hover:underline">
            Back to my orders
          </Link>
        </div>
      </div>
    );
  }

  const order = query.data;
  const currentIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-gray-500">
        <Link to="/orders" className="font-medium text-blue-700 hover:underline">
          My orders
        </Link>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-gray-500">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus === 'paid' ? 'paid' : 'failed'} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Progress */}
          {order.status !== 'cancelled' ? (
            <section aria-label="Delivery progress" className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-base font-semibold text-gray-900">Delivery progress</h2>
              <ol className="mt-4 space-y-3">
                {TIMELINE.map((step, index) => {
                  const done = index <= currentIndex;
                  return (
                    <li key={step.status} className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          done ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                        aria-hidden="true"
                      >
                        {done ? (
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                            <path d="M4.5 12.75l6 6 9-13.5" stroke="currentColor" strokeWidth="2" fill="none" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-bold">{index + 1}</span>
                        )}
                      </span>
                      <span
                        className={`text-sm ${done ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                      >
                        {step.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
              {order.trackingNumber ? (
                <p className="mt-4 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  Tracking number: <span className="font-semibold">{order.trackingNumber}</span>
                </p>
              ) : null}
            </section>
          ) : null}

          {/* Items */}
          <section aria-label="Order items" className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">
              Items ({order.items.length})
            </h2>
            <ul className="mt-4 divide-y divide-gray-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <ProductImage src={item.image} alt={item.name} seed={item.productId} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-700"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.price)} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Totals</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium">{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Tax</dt>
                <dd className="font-medium">{formatCurrency(order.tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Delivery</dt>
                <dd className="font-medium">
                  {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                <dt className="font-semibold text-gray-900">Total</dt>
                <dd className="font-bold text-gray-900">{formatCurrency(order.total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-gray-500">
              Paid with <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
            <h2 className="text-base font-semibold text-gray-900">Delivery address</h2>
            <address className="mt-2 not-italic leading-relaxed text-gray-600">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              <br />
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? (
                <>
                  <br />
                  {order.shippingAddress.addressLine2}
                </>
              ) : null}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </address>
            {order.notes ? (
              <p className="mt-3 rounded-md bg-gray-50 p-2 text-xs text-gray-600">
                Notes: {order.notes}
              </p>
            ) : null}
          </section>

          <div className="flex flex-wrap gap-2">
            <LinkButton to="/orders" variant="outline" leftIcon="arrow-left">
              All orders
            </LinkButton>
            <LinkButton to="/products" variant="ghost">
              Shop again
            </LinkButton>
          </div>

          {order.deliveredAt ? (
            <Badge tone="success">Delivered {formatDate(order.deliveredAt)}</Badge>
          ) : null}
        </aside>
      </div>

      <div className="mt-8">
        <OrderCard order={order} />
      </div>
    </div>
  );
}

export default OrderDetails;
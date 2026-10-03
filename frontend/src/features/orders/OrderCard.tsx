import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, ProductImage, StatusBadge } from '../../components/common';
import { useCancelOrder } from './useOrders';
import { classNames, formatCurrency, formatDate } from '../../utils';
import type { Order } from '../../types';

export interface OrderCardProps {
  order: Order;
  showCustomer?: boolean;
  className?: string;
}

/** Order summary line used on the customer orders list and admin screens. */
export function OrderCard({ order, showCustomer = false, className }: OrderCardProps) {
  const navigate = useNavigate();
  const cancelOrder = useCancelOrder();
  const canCancel = order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing';

  return (
    <article
      className={classNames(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            <Link to={`/orders/${order.id}`} className="hover:text-blue-700">
              {order.orderNumber}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Placed {formatDate(order.createdAt)}
            {order.trackingNumber ? ` · Tracking ${order.trackingNumber}` : ''}
          </p>
          {showCustomer && order.user ? (
            <p className="mt-0.5 text-xs text-gray-500">{order.user.name}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={order.status} />
          <Badge tone={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
            {order.paymentStatus === 'paid' ? 'Paid' : `Payment ${order.paymentStatus}`}
          </Badge>
        </div>
      </header>

      <ul className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
        {order.items.slice(0, 5).map((item) => (
          <li
            key={item.id}
            className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100"
            title={item.name}
          >
            <ProductImage src={item.image} alt={item.name} seed={item.productId} />
          </li>
        ))}
        {order.items.length > 5 ? (
          <li className="shrink-0 text-xs text-gray-500">+{order.items.length - 5} more</li>
        ) : null}
      </ul>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-600">
          {order.items.reduce((count, item) => count + item.quantity, 0)} item(s) ·{' '}
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(order.total)}
          </span>
        </p>

        <div className="flex items-center gap-2">
          {canCancel ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelOrder.mutate(order.id)}
              isLoading={cancelOrder.isPending && cancelOrder.variables === order.id}
              className="text-red-600 hover:bg-red-50"
            >
              Cancel
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            rightIcon="arrow-right"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            View details
          </Button>
        </div>
      </footer>
    </article>
  );
}

export default OrderCard;
import { useMemo, useState } from 'react';
import { Button, ErrorState, Loading, StatusBadge } from '../../../components/common';
import { FormSelect } from '../../../components/forms/FormSelect';
import { useAdminOrders, useSetOrderStatus } from '../../../features/admin/useAdmin';
import { formatCurrency, formatDate } from '../../../utils';
import { ORDER_STATUSES } from '../../../types';
import type { OrderStatus } from '../../../types';

const STATUS_OPTIONS = ORDER_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}));

/** Admin order management with inline status updates. */
export function AdminOrders() {
  const query = useAdminOrders();
  const setStatus = useSetOrderStatus();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const orders = query.data ?? [];

  const filtered = useMemo(
    () => (statusFilter ? orders.filter((order) => order.status === statusFilter) : orders),
    [orders, statusFilter],
  );

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">
            {orders.length} order(s) placed across the store.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <FormSelect
            label="Filter by status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as OrderStatus | '')}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
          />
        </div>
      </header>

      {query.isLoading ? (
        <Loading label="Loading orders" rows={6} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <caption className="sr-only">All orders</caption>
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-4 py-3 font-semibold">Items</th>
                <th scope="col" className="px-4 py-3 font-semibold">Placed</th>
                <th scope="col" className="px-4 py-3 font-semibold">Total</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{order.user?.name ?? 'Guest'}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.items.length}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.paymentStatus === 'paid' ? 'paid' : 'failed'} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <label htmlFor={`status-${order.id}`} className="sr-only">
                        Status for {order.orderNumber}
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        disabled={setStatus.isPending}
                        onChange={(event) =>
                          setStatus.mutate({
                            id: order.id,
                            status: event.target.value as OrderStatus,
                          })
                        }
                        className="input w-40 py-1.5 text-sm"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={
                          setStatus.isPending && setStatus.variables?.id === order.id
                        }
                        onClick={() =>
                          setStatus.mutate({
                            id: order.id,
                            status:
                              order.status === 'delivered' ? 'processing' : 'delivered',
                          })
                        }
                      >
                        {order.status === 'delivered' ? 'Reopen' : 'Mark delivered'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              No orders with the selected status.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
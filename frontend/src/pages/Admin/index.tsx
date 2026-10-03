import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  ErrorState,
  Loading,
  ProductImage,
  SectionHeading,
  StatusBadge,
} from '../../components/common';
import { useDashboardStats } from '../../features/admin/useAdmin';
import { formatCurrency, formatDate } from '../../utils';
import type { DashboardStats } from '../../types';

function StatCard({
  label,
  value,
  hint,
  icon,
  to,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  to?: string;
}) {
  const content = (
    <div className="flex h-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          {icon}
        </span>
        {to ? <span className="text-xs font-semibold text-blue-700">View</span> : null}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );

  return to ? (
    <Link to={to} className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
      {content}
    </Link>
  ) : (
    content
  );
}

/** Admin dashboard: headline metrics plus recent orders. */
export function AdminDashboard() {
  const query = useDashboardStats();

  if (query.isLoading) {
    return <Loading label="Loading dashboard" rows={6} />;
  }

  if (query.isError || !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const stats: DashboardStats = query.data;

  return (
    <div className="space-y-6">
      <section aria-label="Key metrics">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <li>
            <StatCard
              label="Total users"
              value={String(stats.totalUsers)}
              hint="Registered accounts"
              to="/admin/users"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                </svg>
              }
            />
          </li>
          <li>
            <StatCard
              label="Products"
              value={String(stats.totalProducts)}
              hint={`${stats.lowStockProducts} low on stock`}
              to="/admin/products"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              }
            />
          </li>
          <li>
            <StatCard
              label="Orders"
              value={String(stats.totalOrders)}
              hint={`${stats.pendingOrders} awaiting fulfilment`}
              to="/admin/orders"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0h6m-9 0H3.375a1.5 1.5 0 01-1.5-1.5V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0h1.125" />
                </svg>
              }
            />
          </li>
          <li>
            <StatCard
              label="Revenue"
              value={formatCurrency(stats.totalRevenue)}
              hint="Excludes cancelled orders"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25" />
                </svg>
              }
            />
          </li>
          <li>
            <StatCard
              label="Low stock"
              value={String(stats.lowStockProducts)}
              hint="10 units or fewer"
              to="/admin/products"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              }
            />
          </li>
          <li>
            <StatCard
              label="Revenue trend"
              value={`${stats.revenueByMonth.length} months`}
              hint={stats.revenueByMonth
                .map((entry) => `${entry.month}: ${formatCurrency(entry.revenue)}`)
                .join(' Â· ')}
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
                </svg>
              }
            />
          </li>
        </ul>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section aria-labelledby="recent-orders-heading">
          <SectionHeading
            title="Recent orders"
            viewAllHref="/admin/orders"
            viewAllLabel="Manage orders"
          />
          <h2 id="recent-orders-heading" className="sr-only">
            Recent orders
          </h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <caption className="sr-only">Five most recent orders</caption>
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{order.user?.name ?? 'Guest'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="top-products-heading">
          <SectionHeading title="Top products" />
          <h2 id="top-products-heading" className="sr-only">
            Top products
          </h2>

          <ul className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            {stats.topProducts.map((product, index) => (
              <li key={product.name} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-600">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.unitsSold} units sold</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(product.revenue)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Restock soon</p>
            <ul className="mt-2 space-y-1">
              {stats.recentOrders.slice(0, 2).map((order) => (
                <li key={order.id} className="flex items-center gap-2">
                  <ProductImage
                    src={order.items[0]?.image}
                    alt=""
                    className="h-8 w-8 rounded"
                  />
                  <span className="truncate">{order.items[0]?.name}</span>
                </li>
              ))}
            </ul>
            <Badge tone="warning" className="mt-3">
              {stats.lowStockProducts} product(s) below threshold
            </Badge>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
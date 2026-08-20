import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { formatCurrency } from '@printfection/shared';
import type { DashboardStats } from '@printfection/types';

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardStats>('/admin/dashboard'),
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div></div>;
  }

  if (error) {
    return <p className="text-red-600">{(error as Error).message}</p>;
  }

  const stats = [
    { label: 'Total Products', value: data?.totalProducts ?? 0 },
    { label: 'Active Products', value: data?.activeProducts ?? 0 },
    { label: 'Low Stock', value: data?.lowStockProducts ?? 0, alert: true },
    { label: 'Pending Orders', value: data?.pendingOrders ?? 0 },
    { label: 'Total Orders', value: data?.totalOrders ?? 0 },
    { label: 'Total Quotes', value: data?.totalQuotes ?? 0 },
    { label: 'Revenue', value: formatCurrency(data?.revenue ?? 0) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="text-sm text-brand-gray">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.alert ? 'text-orange-600' : 'text-brand-dark'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          {data?.recentOrders?.length ? (
            <ul className="space-y-2 text-sm">
              {(data.recentOrders as { orderNumber?: string; total?: number }[]).map((order, i) => (
                <li key={i} className="flex justify-between py-2 border-b border-gray-100">
                  <span>{order.orderNumber || 'Order'}</span>
                  <span>{order.total ? formatCurrency(order.total) : '—'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-gray">No orders yet</p>
          )}
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Recent Quotes</h2>
          {data?.recentQuotes?.length ? (
            <ul className="space-y-2 text-sm">
              {(data.recentQuotes as { quoteReference?: string; total?: number }[]).map((quote, i) => (
                <li key={i} className="flex justify-between py-2 border-b border-gray-100">
                  <span>{quote.quoteReference || 'Quote'}</span>
                  <span>{quote.total ? formatCurrency(quote.total) : '—'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-gray">No quotes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

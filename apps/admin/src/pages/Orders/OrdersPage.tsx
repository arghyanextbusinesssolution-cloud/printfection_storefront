import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { formatCurrency } from '@printfection/shared';
import type { PaginatedResponse } from '@printfection/types';

interface Order {
  _id: string;
  orderNumber: string;
  customerSnapshot: { name: string; email: string };
  total: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  artwork_review: 'bg-purple-100 text-purple-700',
  production: 'bg-orange-100 text-orange-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiGet<PaginatedResponse<Order>>('/orders', { limit: 50 }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {isLoading && <p className="text-brand-gray">Loading...</p>}
      {data && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order #</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{order.customerSnapshot.name}</div>
                    <div className="text-brand-gray text-xs">{order.customerSnapshot.email}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(order.total, order.currency)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100'}`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs">{order.paymentStatus}</td>
                  <td className="px-4 py-3 text-brand-gray">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/orders/${order._id}`} className="text-brand-accent hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <p className="p-8 text-center text-brand-gray">No orders yet</p>}
        </div>
      )}
    </div>
  );
}

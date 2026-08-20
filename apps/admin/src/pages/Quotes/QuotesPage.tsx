import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { formatCurrency } from '@printfection/shared';
import type { PaginatedResponse } from '@printfection/types';

interface Quote {
  _id: string;
  quoteReference: string;
  customerSnapshot: { name: string; email: string };
  total: number;
  currency: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  sent: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
  converted: 'bg-purple-100 text-purple-700',
};

export function QuotesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-quotes'],
    queryFn: () => apiGet<PaginatedResponse<Quote>>('/quotes', { limit: 50 }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quotes</h1>
      {isLoading && <p className="text-brand-gray">Loading...</p>}
      {data && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Reference</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((quote) => (
                <tr key={quote._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{quote.quoteReference}</td>
                  <td className="px-4 py-3">
                    <div>{quote.customerSnapshot.name}</div>
                    <div className="text-brand-gray text-xs">{quote.customerSnapshot.email}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(quote.total, quote.currency)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[quote.status] || 'bg-gray-100'}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-gray">{new Date(quote.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/quotes/${quote._id}`} className="text-brand-accent hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <p className="p-8 text-center text-brand-gray">No quotes yet</p>}
        </div>
      )}
    </div>
  );
}

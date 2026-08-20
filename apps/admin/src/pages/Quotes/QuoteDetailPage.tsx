import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '../../services/api';
import { formatCurrency } from '@printfection/shared';
import { QUOTE_STATUSES } from '@printfection/config';

interface QuoteDetail {
  _id: string;
  quoteReference: string;
  customerSnapshot: { name: string; email: string; phone?: string; company?: string };
  items: {
    productName: string;
    colourName: string;
    variants: { size: string; quantity: number }[];
    printLocations?: { locationName?: string; colourCount: number }[];
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: string;
  customerNotes?: string;
  adminNotes?: string;
  expiresAt?: string;
  createdAt: string;
}

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['admin-quote', id],
    queryFn: () => apiGet<QuoteDetail>(`/quotes/${id}`),
    enabled: !!id,
  });

  const convertMutation = useMutation({
    mutationFn: () => apiPost<{ orderNumber: string; _id: string }>(`/quotes/${id}/convert`, {}),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['admin-quote', id] });
      navigate(`/orders/${order._id}`);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: string; notes?: string }) =>
      apiPatch(`/quotes/${id}/status`, { status, adminNotes: notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-quote', id] }),
  });

  if (isLoading) return <p className="text-brand-gray">Loading quote...</p>;
  if (error) return <p className="text-red-600">{(error as Error).message}</p>;
  if (!quote) return null;

  const handleStatusUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    statusMutation.mutate({
      status: form.get('status') as string,
      notes: (form.get('adminNotes') as string) || undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/quotes" className="text-sm text-brand-accent hover:underline">← Back to Quotes</Link>
        <h1 className="text-2xl font-bold">{quote.quoteReference}</h1>
        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 uppercase">{quote.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold mb-4">Customer</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-brand-gray">Name</dt><dd className="font-medium">{quote.customerSnapshot.name}</dd></div>
              <div><dt className="text-brand-gray">Email</dt><dd>{quote.customerSnapshot.email}</dd></div>
              {quote.customerSnapshot.phone && <div><dt className="text-brand-gray">Phone</dt><dd>{quote.customerSnapshot.phone}</dd></div>}
              {quote.customerSnapshot.company && <div><dt className="text-brand-gray">Company</dt><dd>{quote.customerSnapshot.company}</dd></div>}
            </dl>
          </section>

          {quote.items.map((item, i) => (
            <section key={i} className="card p-6">
              <h3 className="font-semibold">{item.productName}</h3>
              <p className="text-sm text-brand-gray mt-1">Colour: {item.colourName}</p>
              <table className="w-full mt-4 text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">Size</th><th className="text-right py-2">Qty</th></tr></thead>
                <tbody>
                  {item.variants?.filter((v) => v.quantity > 0).map((v) => (
                    <tr key={v.size} className="border-b border-gray-100">
                      <td className="py-2">{v.size}</td>
                      <td className="text-right py-2">{v.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {item.printLocations && item.printLocations.length > 0 && (
                <div className="mt-4 pt-4 border-t text-sm">
                  {item.printLocations.map((pl, j) => (
                    <div key={j}>{pl.locationName || 'Location'} — {pl.colourCount} colours</div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {quote.customerNotes && (
            <section className="card p-6">
              <h2 className="font-semibold mb-2">Customer Notes</h2>
              <p className="text-sm text-brand-gray">{quote.customerNotes}</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold mb-4">Pricing</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(quote.subtotal, quote.currency)}</dd></div>
              <div className="flex justify-between"><dt>Tax</dt><dd>{formatCurrency(quote.tax, quote.currency)}</dd></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t"><dt>Total</dt><dd>{formatCurrency(quote.total, quote.currency)}</dd></div>
            </dl>
            {quote.expiresAt && (
              <p className="mt-3 text-xs text-brand-gray">Expires: {new Date(quote.expiresAt).toLocaleDateString()}</p>
            )}
          </section>

          <section className="card p-6">
            <h2 className="font-semibold mb-4">Actions</h2>
            {quote.status !== 'converted' && (
              <button
                onClick={() => convertMutation.mutate()}
                disabled={convertMutation.isPending}
                className="btn-primary w-full mb-4"
              >
                {convertMutation.isPending ? 'Converting...' : 'Convert to Order'}
              </button>
            )}
            {quote.status === 'converted' && (
              <p className="text-sm text-green-600 mb-4">This quote has been converted to an order.</p>
            )}
            {convertMutation.error && (
              <p className="text-red-600 text-sm mb-4">{(convertMutation.error as Error).message}</p>
            )}
            <h3 className="font-medium mb-3 text-sm">Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <select name="status" defaultValue={quote.status} className="input-field">
                {QUOTE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <textarea name="adminNotes" defaultValue={quote.adminNotes || ''} placeholder="Internal notes..." rows={3} className="input-field" />
              <button type="submit" disabled={statusMutation.isPending} className="btn-primary w-full">
                {statusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

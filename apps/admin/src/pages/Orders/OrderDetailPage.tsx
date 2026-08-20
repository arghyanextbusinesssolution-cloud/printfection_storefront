import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '../../services/api';
import { formatCurrency } from '@printfection/shared';
import { ORDER_STATUSES } from '@printfection/config';

interface OrderDetail {
  _id: string;
  orderNumber: string;
  customerSnapshot: { name: string; email: string; phone?: string; company?: string };
  billingAddress?: { line1: string; line2?: string; city: string; county?: string; postcode: string; country: string };
  shippingAddress?: { line1: string; line2?: string; city: string; county?: string; postcode: string; country: string };
  items: {
    productName: string;
    colourName: string;
    variants: { size: string; quantity: number; unitPrice?: number }[];
    printLocations?: { locationName?: string; colourCount: number }[];
  }[];
  pricingBreakdown: Record<string, number>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => apiGet<OrderDetail>(`/orders/${id}`),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: string; notes?: string }) =>
      apiPatch(`/orders/${id}/status`, { orderStatus: status, adminNotes: notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-order', id] }),
  });

  if (isLoading) return <p className="text-brand-gray">Loading order...</p>;
  if (error) return <p className="text-red-600">{(error as Error).message}</p>;
  if (!order) return null;

  const handleStatusUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    statusMutation.mutate({
      status: form.get('orderStatus') as string,
      notes: (form.get('adminNotes') as string) || undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/orders" className="text-sm text-brand-accent hover:underline">← Back to Orders</Link>
        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold mb-4">Customer</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-brand-gray">Name</dt><dd className="font-medium">{order.customerSnapshot.name}</dd></div>
              <div><dt className="text-brand-gray">Email</dt><dd>{order.customerSnapshot.email}</dd></div>
              {order.customerSnapshot.phone && <div><dt className="text-brand-gray">Phone</dt><dd>{order.customerSnapshot.phone}</dd></div>}
              {order.customerSnapshot.company && <div><dt className="text-brand-gray">Company</dt><dd>{order.customerSnapshot.company}</dd></div>}
            </dl>
          </section>

          {order.items.map((item, i) => (
            <section key={i} className="card p-6">
              <h3 className="font-semibold">{item.productName}</h3>
              <p className="text-sm text-brand-gray mt-1">Colour: {item.colourName}</p>
              <table className="w-full mt-4 text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">Size</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Unit</th></tr></thead>
                <tbody>
                  {item.variants.filter((v) => v.quantity > 0).map((v) => (
                    <tr key={v.size} className="border-b border-gray-100">
                      <td className="py-2">{v.size}</td>
                      <td className="text-right py-2">{v.quantity}</td>
                      <td className="text-right py-2">{v.unitPrice != null ? formatCurrency(v.unitPrice, order.currency) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {item.printLocations && item.printLocations.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Print Locations</h4>
                  <ul className="text-sm space-y-1">
                    {item.printLocations.map((pl, j) => (
                      <li key={j}>{pl.locationName || 'Location'} — {pl.colourCount} colour{pl.colourCount > 1 ? 's' : ''}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}

          {order.customerNotes && (
            <section className="card p-6">
              <h2 className="font-semibold mb-2">Customer Notes</h2>
              <p className="text-sm text-brand-gray">{order.customerNotes}</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold mb-4">Pricing</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal, order.currency)}</dd></div>
              <div className="flex justify-between"><dt>Tax</dt><dd>{formatCurrency(order.tax, order.currency)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{formatCurrency(order.shipping, order.currency)}</dd></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t"><dt>Total</dt><dd>{formatCurrency(order.total, order.currency)}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-brand-gray">Payment: {order.paymentStatus}</p>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold mb-4">Update Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <select name="orderStatus" defaultValue={order.orderStatus} className="input-field">
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <textarea name="adminNotes" defaultValue={order.adminNotes || ''} placeholder="Admin notes..." rows={3} className="input-field" />
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

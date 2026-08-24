import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '../../services/api';
import { formatCurrency } from '@printfection/shared';
import { ORDER_STATUSES } from '@printfection/config';

interface BulkColourVariant {
  size: string;
  quantity: number;
  unitPrice?: number;
}

interface BulkColourConfig {
  colourName: string;
  colourHex?: string;
  variants: BulkColourVariant[];
}

interface ArtworkRef {
  colourName?: string;
  locationId?: string;
  url: string;
  filename: string;
}

interface OrderItem {
  productName: string;
  colourName: string;
  colourHex?: string;
  isBulkOrder?: boolean;
  colours?: BulkColourConfig[];
  artworks?: ArtworkRef[];
  variants: { size: string; quantity: number; unitPrice?: number }[];
  printLocations?: { locationId?: string; locationName?: string; colourCount: number }[];
}

interface OrderDetail {
  _id: string;
  orderNumber: string;
  customerSnapshot: { name: string; email: string; phone?: string; company?: string };
  billingAddress?: { line1: string; line2?: string; city: string; county?: string; postcode: string; country: string };
  shippingAddress?: { line1: string; line2?: string; city: string; county?: string; postcode: string; country: string };
  items: OrderItem[];
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

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

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

  if (isLoading) return <p className="text-gray-500">Loading order...</p>;
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

  const artworkUrl = (ref: ArtworkRef) =>
    ref.url.startsWith('http') ? ref.url : `${API_BASE}${ref.url}`;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/orders" className="text-sm text-blue-600 hover:underline">← Back to Orders</Link>
        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        <span
          className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            order.orderStatus === 'completed'
              ? 'bg-green-100 text-green-800'
              : order.orderStatus === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {order.orderStatus.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <section className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Customer</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500 text-xs">Name</dt><dd className="font-medium">{order.customerSnapshot.name}</dd></div>
              <div><dt className="text-gray-500 text-xs">Email</dt><dd>{order.customerSnapshot.email}</dd></div>
              {order.customerSnapshot.phone && <div><dt className="text-gray-500 text-xs">Phone</dt><dd>{order.customerSnapshot.phone}</dd></div>}
              {order.customerSnapshot.company && <div><dt className="text-gray-500 text-xs">Company</dt><dd>{order.customerSnapshot.company}</dd></div>}
            </dl>
            {order.shippingAddress && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Shipping Address</p>
                <address className="text-sm not-italic text-gray-700 leading-relaxed">
                  {order.shippingAddress.line1}<br />
                  {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                  {order.shippingAddress.city}, {order.shippingAddress.postcode}<br />
                  {order.shippingAddress.country}
                </address>
              </div>
            )}
          </section>

          {/* Items */}
          {order.items.map((item, i) => (
            <section key={i} className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{item.productName}</h3>
                  {item.isBulkOrder ? (
                    <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-700 font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
                      Bulk Order
                    </span>
                  ) : (
                    <p className="text-sm text-gray-500 mt-0.5">Colour: {item.colourName}</p>
                  )}
                </div>
              </div>

              {/* Bulk: Colours & Sizes */}
              {item.isBulkOrder && item.colours && item.colours.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {item.colours.map((col) => (
                    <div key={col.colourName} className="border rounded-lg overflow-hidden">
                      {/* Colour header */}
                      <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 border-b">
                        {col.colourHex && (
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: col.colourHex }}
                          />
                        )}
                        <span className="font-semibold text-sm text-gray-900">{col.colourName}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {col.variants.reduce((a, v) => a + v.quantity, 0)} units total
                        </span>
                      </div>
                      {/* Sizes */}
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50/50">
                            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Size</th>
                            <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Qty</th>
                            <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Unit Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {col.variants.filter((v) => v.quantity > 0).map((v) => (
                            <tr key={v.size} className="border-b border-gray-100">
                              <td className="px-4 py-2 font-mono text-xs">{v.size}</td>
                              <td className="text-right px-4 py-2">{v.quantity}</td>
                              <td className="text-right px-4 py-2">{v.unitPrice != null ? formatCurrency(v.unitPrice, order.currency) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                /* Standard single-colour item */
                <table className="w-full mt-4 text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs text-gray-500">Size</th>
                      <th className="text-right py-2 text-xs text-gray-500">Qty</th>
                      <th className="text-right py-2 text-xs text-gray-500">Unit</th>
                    </tr>
                  </thead>
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
              )}

              {/* Print Locations */}
              {item.printLocations && item.printLocations.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Print Locations</h4>
                  <ul className="text-sm space-y-1.5">
                    {item.printLocations.map((pl, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                          {pl.colourCount}
                        </span>
                        <span className="text-gray-700">{pl.locationName || pl.locationId || 'Position'}</span>
                        <span className="text-gray-400 text-xs">— {pl.colourCount} colour{pl.colourCount > 1 ? 's' : ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Uploaded Artworks */}
              {item.artworks && item.artworks.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Customer Artwork Files</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {item.artworks.map((art, k) => (
                      <a
                        key={k}
                        href={artworkUrl(art)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center border border-dashed rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
                      >
                        <svg className="w-7 h-7 text-gray-400 group-hover:text-blue-500 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        {art.colourName && (
                          <span className="text-[9px] font-bold uppercase text-purple-700 leading-none mb-0.5">
                            {art.colourName}
                          </span>
                        )}
                        {art.locationId && (
                          <span className="text-[9px] text-gray-500 uppercase leading-none mb-1">
                            {art.locationId.replace(/_/g, ' ')}
                          </span>
                        )}
                        <span className="text-[10px] text-blue-600 font-medium truncate max-w-full">
                          {art.filename}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5">Click to download</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}

          {order.customerNotes && (
            <section className="bg-white border rounded-xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wider">Customer Notes</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{order.customerNotes}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Pricing</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal, order.currency)}</dd></div>
              <div className="flex justify-between text-gray-600"><dt>Tax (VAT)</dt><dd>{formatCurrency(order.tax, order.currency)}</dd></div>
              <div className="flex justify-between text-gray-600"><dt>Shipping</dt><dd>{formatCurrency(order.shipping, order.currency)}</dd></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t text-gray-900"><dt>Total</dt><dd>{formatCurrency(order.total, order.currency)}</dd></div>
            </dl>
            <div className="mt-3 pt-3 border-t space-y-1">
              <p className="text-xs text-gray-500">Payment: <span className="font-medium capitalize">{order.paymentStatus}</span></p>
              <p className="text-xs text-gray-500">Ordered: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </section>

          <section className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Update Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <select name="orderStatus" defaultValue={order.orderStatus} className="input-field text-sm">
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <textarea
                name="adminNotes"
                defaultValue={order.adminNotes || ''}
                placeholder="Admin notes (internal, not shown to customer)..."
                rows={3}
                className="input-field text-sm"
              />
              <button type="submit" disabled={statusMutation.isPending} className="btn-primary w-full text-sm">
                {statusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiGet, apiPut } from '../../services/api';
import { formatCurrency } from '@printfection/shared';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  county: z.string().optional(),
  postcode: z.string().min(1, 'Postcode is required'),
  country: z.string().default('GB'),
  customerNotes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const LOCATION_NAMES: Record<string, string> = {
  FULL_FRONT: 'Full Front',
  LEFT_CHEST: 'Left Chest',
  RIGHT_CHEST: 'Right Chest',
  FULL_BACK: 'Full Back',
  UPPER_BACK: 'Upper Back',
  LEFT_SLEEVE: 'Left Sleeve',
  RIGHT_SLEEVE: 'Right Sleeve',
  NECK: 'Neck',
};

interface OrderResponse {
  _id: string;
  orderNumber: string;
  paymentStatus: string;
  total: number;
}

interface CartItem {
  productId: string;
  productName: string;
  colourName: string;
  colourHex?: string;
  variants: { variantId: string; size: string; quantity: number }[];
  printLocations?: { locationId: string; locationName?: string; colourCount: number; maximumColours?: number }[];
  designId?: string;
  pricingSnapshot?: { subtotal: number; tax: number; total: number; currency: string };
  isBulkOrder?: boolean;
  colours?: { colourName: string; colourHex?: string; colourImage?: string; variants: any[] }[];
  artworks?: { colourName?: string; locationId?: string; url: string; filename: string }[];
}

interface CartData {
  cart: { items: CartItem[] };
  totals: { subtotal: number; tax: number; total: number; currency: string; itemCount: number };
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const isQuote = searchParams.get('mode') === 'quote';
  const cancelled = searchParams.get('cancelled') === 'true';
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'invoice'>('online');

  // File uploading states
  const [uploadingState, setUploadingState] = useState<Record<string, { uploading: boolean; progress?: number; filename?: string; url?: string }>>({});

  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => apiGet<CartData>('/cart'),
  });

  const { data: paymentConfig } = useQuery({
    queryKey: ['payment-config'],
    queryFn: () => apiGet<{ stripeEnabled: boolean; publishableKey: string | null }>('/payments/config'),
    enabled: !isQuote,
  });

  const stripeEnabled = paymentConfig?.stripeEnabled ?? false;
  const items = cartData?.cart.items ?? [];
  const totals = cartData?.totals;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: 'GB' },
  });

  // Calculate required uploads dynamically (deduplicated by key)
  const requiredUploads: { itemIndex: number; itemName: string; colourName: string; locationId: string; locationName: string; key: string }[] = [];
  const seenKeys = new Set<string>();

  items.forEach((item, itemIdx) => {
    if (item.isBulkOrder && item.colours && item.printLocations) {
      item.colours.forEach((col) => {
        item.printLocations?.forEach((loc) => {
          const key = `${itemIdx}_${col.colourName}_${loc.locationId}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            requiredUploads.push({
              itemIndex: itemIdx,
              itemName: item.productName,
              colourName: col.colourName,
              locationId: loc.locationId,
              locationName: loc.locationName || LOCATION_NAMES[loc.locationId] || loc.locationId,
              key,
            });
          }
        });
      });
    }
  });

  // Initialise local uploads state when cart loads
  useEffect(() => {
    if (items.length > 0) {
      const initialUploads: typeof uploadingState = {};
      items.forEach((item, itemIdx) => {
        if (item.isBulkOrder && item.artworks) {
          item.artworks.forEach((art) => {
            const key = `${itemIdx}_${art.colourName}_${art.locationId}`;
            initialUploads[key] = {
              uploading: false,
              filename: art.filename,
              url: art.url,
            };
          });
        }
      });
      setUploadingState(initialUploads);
    }
  }, [cartData]);

  // Handle single artwork upload
  const handleUpload = async (key: string, file: File, itemIndex: number) => {
    setUploadingState((prev) => ({ ...prev, [key]: { uploading: true } }));
    try {
      const formData = new FormData();
      formData.append('artwork', file);

      const res = await apiPost<{ url: string; filename: string }>('/bulk-order/upload-artwork', formData);

      // Save locally
      setUploadingState((prev) => ({
        ...prev,
        [key]: { uploading: false, filename: res.filename, url: res.url },
      }));

      // Gather all artworks for this item
      const itemArtworks: CartItem['artworks'] = [];
      requiredUploads
        .filter((req) => req.itemIndex === itemIndex)
        .forEach((req) => {
          const up = key === req.key
            ? { colourName: req.colourName, locationId: req.locationId, url: res.url, filename: res.filename }
            : uploadingState[req.key]?.url
            ? { colourName: req.colourName, locationId: req.locationId, url: uploadingState[req.key].url!, filename: uploadingState[req.key].filename! }
            : null;

          if (up) itemArtworks.push(up);
        });

      // Update cart backend
      await apiPut(`/cart/items/${itemIndex}/artworks`, { artworks: itemArtworks });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File upload failed');
      setUploadingState((prev) => ({ ...prev, [key]: { uploading: false } }));
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      // Validate that all required artworks are uploaded
      const missing = requiredUploads.some((req) => !uploadingState[req.key]?.url);
      if (missing) {
        throw new Error('Please upload artwork files for all color and print position combinations before proceeding.');
      }

      const payload = {
        fromCart: true,
        customer: { name: data.name, email: data.email, phone: data.phone, company: data.company },
        billingAddress: {
          line1: data.line1, line2: data.line2, city: data.city,
          county: data.county, postcode: data.postcode, country: data.country,
        },
        shippingAddress: {
          line1: data.line1, line2: data.line2, city: data.city,
          county: data.county, postcode: data.postcode, country: data.country,
        },
        customerNotes: data.customerNotes,
        paymentMethod: stripeEnabled && paymentMethod === 'online' ? 'online' : 'invoice',
      };

      if (isQuote) {
        return { type: 'quote' as const, data: await apiPost<{ quoteReference: string }>('/quotes', payload) };
      }

      const order = await apiPost<OrderResponse>('/orders', payload);

      if (stripeEnabled && paymentMethod === 'online') {
        const session = await apiPost<{ url: string }>(`/payments/checkout/${order._id}`);
        return { type: 'stripe' as const, url: session.url, orderNumber: order.orderNumber };
      }

      return { type: 'order' as const, orderNumber: order.orderNumber };
    },
    onSuccess: (result) => {
      if (result.type === 'quote') {
        navigate(`/quote-success?ref=${result.data.quoteReference}`);
      } else if (result.type === 'stripe') {
        window.location.href = result.url;
      } else {
        navigate(`/order-success?ref=${result.orderNumber}`);
      }
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Submission failed'),
  });

  const isCheckoutDisabled = requiredUploads.some((req) => !uploadingState[req.key]?.url);

  if (isCartLoading) {
    return <LoadingSpinner label="Loading checkout..." />;
  }

  if (!isCartLoading && items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-on-surface-variant mb-6 font-mono text-sm">Your shopping cart is empty.</p>
        <Link to="/bulk-order" className="btn-accent font-display font-bold text-xs uppercase tracking-widest">
          Start Custom Order
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-[64px] py-12 lg:py-16">
      <div className="mb-10">
        <span className="section-label mb-2 block">Secure checkout</span>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-on-surface">
          {isQuote ? 'Request formal Quote' : 'Order Checkout'}
        </h1>
        <p className="text-on-surface-variant font-mono text-xs mt-2 uppercase tracking-widest">
          {isQuote ? 'Submit your configured order for price approval.' : 'Complete your shipping and delivery details below.'}
        </p>
      </div>

      {cancelled && (
        <p className="mb-6 p-4 bg-error/10 border border-error/20 text-error font-mono text-xs uppercase tracking-wide" role="alert">
          Payment was cancelled. Your order was not completed — you can try again below.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit((d) => submitMutation.mutate(d))} className="space-y-8" noValidate>
            {/* Step 1: Customer Contact Info */}
            <fieldset className="bg-white border border-outline-variant p-6 rounded-2xl shadow-step space-y-4">
              <legend className="font-display font-bold text-on-surface uppercase text-sm tracking-tight mb-2">
                1. Contact Details
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">
                    Full Name *
                  </label>
                  <input {...register('name')} className="input-field font-mono text-sm" />
                  {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">
                    Email Address *
                  </label>
                  <input type="email" {...register('email')} className="input-field font-mono text-sm" />
                  {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">
                    Phone Number
                  </label>
                  <input {...register('phone')} className="input-field font-mono text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">
                    Company / Organisation Name
                  </label>
                  <input {...register('company')} className="input-field font-mono text-sm" />
                </div>
              </div>
            </fieldset>

            {/* Step 2: Shipping address */}
            <fieldset className="bg-white border border-outline-variant p-6 rounded-2xl shadow-step space-y-4">
              <legend className="font-display font-bold text-on-surface uppercase text-sm tracking-tight mb-2">
                2. Shipping Address
              </legend>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">
                  Address Line 1 *
                </label>
                <input {...register('line1')} className="input-field font-mono text-sm" />
                {errors.line1 && <p className="text-error text-xs mt-1">{errors.line1.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">
                  Address Line 2
                </label>
                <input {...register('line2')} className="input-field font-mono text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">
                    City *
                  </label>
                  <input {...register('city')} className="input-field font-mono text-sm" />
                  {errors.city && <p className="text-error text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">
                    Postcode *
                  </label>
                  <input {...register('postcode')} className="input-field font-mono text-sm" />
                  {errors.postcode && <p className="text-error text-xs mt-1">{errors.postcode.message}</p>}
                </div>
              </div>
            </fieldset>

            {/* Step 3: Artwork Upload (Mandatory for bulk orders) */}
            {requiredUploads.length > 0 && (
              <fieldset className="bg-white border border-outline-variant p-6 rounded-2xl shadow-step space-y-5">
                <legend className="font-display font-bold text-on-surface uppercase text-sm tracking-tight mb-2">
                  3. Design Artwork Upload
                </legend>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
                  Upload print files (.png, .jpeg, .pdf, .ai) for each selected garment position:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredUploads.map((req) => {
                    const upState = uploadingState[req.key];
                    return (
                      <div
                        key={req.key}
                        className={`p-4 border rounded-xl flex flex-col gap-3 relative transition-all duration-200 ${
                          upState?.url
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-outline-variant hover:border-outline'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-xs uppercase text-on-surface truncate pr-1">
                            {req.colourName} · {req.locationName}
                          </span>
                          {upState?.url && (
                            <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-600 font-bold">
                              ✓ Uploaded
                            </span>
                          )}
                        </div>

                        {upState?.url ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] text-on-surface-variant truncate">
                              {upState.filename}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                // Clear file locally
                                setUploadingState((prev) => {
                                  const cpy = { ...prev };
                                  delete cpy[req.key];
                                  return cpy;
                                });
                              }}
                              className="font-mono text-[10px] uppercase text-error hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : upState?.uploading ? (
                          <div className="flex items-center gap-2 py-1">
                            <div className="w-4 h-4 border-2 border-magenta border-t-transparent rounded-full animate-spin" />
                            <span className="font-mono text-[10px] text-on-surface-variant">
                              Uploading file...
                            </span>
                          </div>
                        ) : (
                          <label className="border border-dashed border-outline rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-low transition-colors text-center">
                            <svg className="w-5 h-5 text-on-surface-variant mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
                              Choose Artwork File
                            </span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUpload(req.key, file, req.itemIndex);
                                }
                              }}
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Step 4: Payment */}
            {!isQuote && stripeEnabled && (
              <fieldset className="bg-white border border-outline-variant p-6 rounded-2xl shadow-step space-y-3">
                <legend className="font-display font-bold text-on-surface uppercase text-sm tracking-tight mb-2">
                  4. Payment Method
                </legend>
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="accent-magenta"
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface">
                    Pay by Card (Stripe secure gateway)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'invoice'}
                    onChange={() => setPaymentMethod('invoice')}
                    className="accent-magenta"
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface">
                    Invoice (payment before manufacturing)
                  </span>
                </label>
              </fieldset>
            )}

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">
                Special Delivery Notes / Design Requirements
              </label>
              <textarea
                {...register('customerNotes')}
                rows={3}
                className="input-field font-mono text-sm"
                placeholder="E.g. pantone color match refs, thread colors..."
              />
            </div>

            {error && <p className="font-mono text-[11px] text-error" role="alert">{error}</p>}

            <div className="flex gap-4">
              <Link to="/cart" className="btn-ghost-dark text-sm px-6">
                Back to Cart
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || submitMutation.isPending || isCheckoutDisabled}
                className="btn-accent text-sm flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitMutation.isPending
                  ? 'Processing...'
                  : isQuote
                  ? 'Submit Quote Request'
                  : stripeEnabled && paymentMethod === 'online'
                  ? 'Proceed to payment'
                  : 'Place Order'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border border-outline p-6 rounded-2xl shadow-card">
              <h2 className="font-display font-black text-on-surface text-base uppercase tracking-tight mb-4 border-b border-outline-variant/60 pb-3">
                Order Items
              </h2>

              <div className="divide-y divide-outline-variant/60 max-h-96 overflow-y-auto mb-4 pr-1">
                {items.map((item, index) => (
                  <div key={index} className="py-3 text-sm">
                    <div className="flex justify-between font-bold text-on-surface uppercase text-xs tracking-tight">
                      <span className="truncate pr-1">{item.productName}</span>
                      {item.pricingSnapshot && (
                        <span className="font-mono">{formatCurrency(item.pricingSnapshot.total, item.pricingSnapshot.currency)}</span>
                      )}
                    </div>

                    {item.isBulkOrder && item.colours ? (
                      <div className="mt-1 space-y-1">
                        {item.colours.map((c) => {
                          const totalQty = c.variants.reduce((acc, v) => acc + v.quantity, 0);
                          return (
                            <p key={c.colourName} className="text-on-surface-variant font-mono text-[10px] uppercase">
                              · {c.colourName}: {totalQty} units
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-on-surface-variant font-mono text-[10px] uppercase mt-0.5">
                        Colour: {item.colourName}
                      </p>
                    )}

                    <div className="text-[10px] font-mono text-on-surface-variant mt-2 flex flex-wrap gap-1">
                      {item.isBulkOrder && item.colours
                        ? item.colours.flatMap((c) =>
                            c.variants.filter((v: any) => v.quantity > 0).map((v: any) => (
                              <span key={`${c.colourName}_${v.size}`} className="bg-surface-container-low px-1.5 py-0.5 border border-outline-variant font-medium">
                                {c.colourName} {v.size}: {v.quantity}
                              </span>
                            ))
                          )
                        : item.variants.filter((v) => v.quantity > 0).map((v) => (
                            <span key={v.size} className="bg-surface-container-low px-1.5 py-0.5 border border-outline-variant font-medium">
                              {v.size}: {v.quantity}
                            </span>
                          ))}
                    </div>
                  </div>
                ))}
              </div>

              {totals && (
                <div className="border-t border-outline-variant pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totals.subtotal, totals.currency)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">
                    <span>VAT (20%)</span>
                    <span>{formatCurrency(totals.tax, totals.currency)}</span>
                  </div>
                  <div className="flex justify-between font-display font-black text-base pt-3 border-t border-outline text-on-surface uppercase tracking-tight">
                    <span>Total Cost</span>
                    <span className="text-magenta">{formatCurrency(totals.total, totals.currency)}</span>
                  </div>
                  <p className="text-[9px] font-mono uppercase text-on-surface-variant/80 mt-3 text-right">
                    Includes screen setup &amp; custom printing fees
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

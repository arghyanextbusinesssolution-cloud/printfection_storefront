import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiPost, apiGet } from '../../services/api';
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
  printLocations?: { locationId: string; colourCount: number }[];
  designId?: string;
  pricingSnapshot?: { subtotal: number; tax: number; total: number; currency: string };
}

interface CartData {
  cart: { items: CartItem[] };
  totals: { subtotal: number; tax: number; total: number; currency: string; itemCount: number };
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isQuote = searchParams.get('mode') === 'quote';
  const cancelled = searchParams.get('cancelled') === 'true';
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'invoice'>('online');

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

  const submitMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
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

  if (isCartLoading) {
    return <LoadingSpinner label="Loading checkout..." />;
  }

  if (!isCartLoading && items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-brand-gray mb-4">Your cart is empty.</p>
        <Link to="/bulk-order" className="btn-primary">Start an Order</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl font-bold mb-2">{isQuote ? 'Request a Quote' : 'Checkout'}</h1>
      <p className="text-brand-gray mb-8">
        {isQuote ? 'Submit your configured order for a formal quote.' : 'Complete your order details below.'}
      </p>

      {cancelled && (
        <p className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800" role="alert">
          Payment was cancelled. Your order was not completed — you can try again below.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit((d) => submitMutation.mutate(d))} className="space-y-6" noValidate>
            <fieldset className="card p-6 space-y-4">
              <legend className="font-semibold text-lg px-2">Contact Details</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input {...register('name')} className="input-field" />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input type="email" {...register('email')} className="input-field" />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input {...register('phone')} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input {...register('company')} className="input-field" />
                </div>
              </div>
            </fieldset>

            <fieldset className="card p-6 space-y-4">
              <legend className="font-semibold text-lg px-2">{isQuote ? 'Address' : 'Shipping Address'}</legend>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                <input {...register('line1')} className="input-field" />
                {errors.line1 && <p className="text-red-600 text-xs mt-1">{errors.line1.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                <input {...register('line2')} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input {...register('city')} className="input-field" />
                  {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postcode *</label>
                  <input {...register('postcode')} className="input-field" />
                  {errors.postcode && <p className="text-red-600 text-xs mt-1">{errors.postcode.message}</p>}
                </div>
              </div>
            </fieldset>

            {!isQuote && stripeEnabled && (
              <fieldset className="card p-6 space-y-3">
                <legend className="font-semibold text-lg px-2">Payment Method</legend>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="text-brand-dark animate-pulse"
                  />
                  <span className="text-sm">Pay by card (Stripe — secure checkout)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'invoice'}
                    onChange={() => setPaymentMethod('invoice')}
                    className="text-brand-dark"
                  />
                  <span className="text-sm">Pay by invoice (we will contact you)</span>
                </label>
              </fieldset>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea {...register('customerNotes')} rows={3} className="input-field" placeholder="Any special requirements..." />
            </div>

            {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

            <div className="flex gap-4">
              <Link to="/cart" className="btn-outline">Back to Cart</Link>
              <button type="submit" disabled={isSubmitting || submitMutation.isPending} className="btn-primary">
                {submitMutation.isPending
                  ? 'Processing...'
                  : isQuote
                  ? 'Submit Quote Request'
                  : stripeEnabled && paymentMethod === 'online'
                  ? 'Proceed to Payment'
                  : 'Place Order'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Container */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2">Order Summary</h2>
              
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto mb-4 pr-1">
                {items.map((item, index) => (
                  <div key={index} className="py-3 text-sm">
                    <div className="flex justify-between font-semibold text-brand-dark">
                      <span>{item.productName}</span>
                      {item.pricingSnapshot && (
                        <span>{formatCurrency(item.pricingSnapshot.total, item.pricingSnapshot.currency)}</span>
                      )}
                    </div>
                    <p className="text-brand-gray text-xs mt-0.5">Colour: {item.colourName}</p>
                    <div className="text-xs text-brand-gray mt-1 flex flex-wrap gap-x-2">
                      {item.variants.filter(v => v.quantity > 0).map(v => (
                        <span key={v.size} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                          {v.size}: {v.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {totals && (
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-brand-gray">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totals.subtotal, totals.currency)}</span>
                  </div>
                  <div className="flex justify-between text-brand-gray">
                    <span>Tax (VAT)</span>
                    <span>{formatCurrency(totals.tax, totals.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t text-brand-dark">
                    <span>Total</span>
                    <span>{formatCurrency(totals.total, totals.currency)}</span>
                  </div>
                  <p className="text-[10px] text-brand-gray mt-2 text-right">Includes pricing for setup & printing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

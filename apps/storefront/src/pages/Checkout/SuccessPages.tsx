import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function QuoteSuccessPage() {
  const [params] = useSearchParams();
  const ref = params.get('ref');
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }, [queryClient]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4">Quote Request Received</h1>
      {ref && <p className="text-lg mb-2">Reference: <strong>{ref}</strong></p>}
      <p className="text-brand-gray mb-8">
        Thank you! We have received your quote request and will contact you shortly with a formal quotation.
      </p>
      <Link to="/products" className="btn-primary">Continue Shopping</Link>
    </div>
  );
}

export function OrderSuccessPage() {
  const [params] = useSearchParams();
  const ref = params.get('ref');
  const sessionId = params.get('session_id');
  const queryClient = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ['verify-payment', sessionId],
    queryFn: () => apiGet<{ paid: boolean; orderNumber?: string }>('/payments/verify', { session_id: sessionId }),
    enabled: !!sessionId,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }, [queryClient]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {sessionId && isLoading ? (
        <LoadingSpinner label="Confirming payment..." />
      ) : (
        <>
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">{sessionId ? 'Payment Successful' : 'Order Confirmed'}</h1>
          {ref && <p className="text-lg mb-2">Order Number: <strong>{ref}</strong></p>}
          <p className="text-brand-gray mb-8">
            {sessionId
              ? 'Your payment has been received. We will be in touch regarding artwork review and production.'
              : 'Your order has been received. We will be in touch regarding artwork review and production.'}
          </p>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </>
      )}
    </div>
  );
}

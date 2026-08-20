import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';

interface SettingsStatus {
  emailConfigured: boolean;
  stripeConfigured: boolean;
  designProvider: string;
  designConfigured: boolean;
  productApiConfigured: boolean;
  environment: string;
}

export function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => apiGet<SettingsStatus>('/admin/settings'),
  });

  const items = [
    { label: 'Environment', value: data?.environment || '—', ok: true },
    { label: 'Email (SMTP)', value: data?.emailConfigured ? 'Configured' : 'Not configured', ok: data?.emailConfigured },
    { label: 'Stripe Payments', value: data?.stripeConfigured ? 'Configured' : 'Not configured', ok: data?.stripeConfigured },
    { label: 'Design Provider', value: data?.designProvider || 'placeholder', ok: data?.designConfigured },
    { label: 'External Product API', value: data?.productApiConfigured ? 'Configured' : 'Not configured', ok: data?.productApiConfigured },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <p className="text-sm text-brand-gray mb-6">
        Integration status is read from server environment variables. Update your <code className="bg-gray-100 px-1 rounded">.env</code> file and restart the API to change these.
      </p>

      {isLoading ? (
        <p className="text-brand-gray">Loading...</p>
      ) : (
        <div className="card divide-y max-w-2xl">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-brand-gray mt-0.5">{item.value}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${item.ok ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {item.ok ? 'Ready' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 card p-6 max-w-2xl">
        <h2 className="font-semibold mb-3">Environment Variables</h2>
        <ul className="text-sm text-brand-gray space-y-1 font-mono">
          <li>MONGODB_URI — Database connection</li>
          <li>JWT_SECRET / JWT_REFRESH_SECRET — Auth tokens</li>
          <li>SMTP_HOST, SMTP_USER, SMTP_PASSWORD — Email delivery</li>
          <li>STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET — Online payments</li>
          <li>DESIGN_PROVIDER, DESIGN_PROVIDER_LICENSE_KEY — Design studio</li>
          <li>PRODUCT_API_BASE_URL, PRODUCT_API_KEY — Supplier sync</li>
        </ul>
        <p className="text-xs text-brand-gray mt-4">See <code>.env.example</code> in the project root for full reference.</p>
      </div>
    </div>
  );
}

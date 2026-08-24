import { formatCurrency } from '@printfection/shared';
import type { PricingBreakdown } from '@printfection/types';

interface PricingSummaryProps {
  pricing: PricingBreakdown;
  title?: string;
}

export function PricingSummary({ pricing, title = 'Price Breakdown' }: PricingSummaryProps) {
  return (
    <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-card">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-magenta mb-1">Pricing Summary</p>
      <h3 className="font-display font-black text-on-surface uppercase tracking-tight text-lg mb-5">{title}</h3>
      <dl className="space-y-3.5 text-sm">
        <div className="flex justify-between">
          <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Garments Subtotal</dt>
          <dd className="font-mono text-[11px] text-on-surface font-semibold">{formatCurrency(pricing.garmentSubtotal, pricing.currency)}</dd>
        </div>
        {pricing.printingSubtotal > 0 && (
          <div className="flex justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Printing Customisation</dt>
            <dd className="font-mono text-[11px] text-on-surface font-semibold">{formatCurrency(pricing.printingSubtotal, pricing.currency)}</dd>
          </div>
        )}
        {pricing.setupCharges > 0 && (
          <div className="flex justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Screen Setup Charges</dt>
            <dd className="font-mono text-[11px] text-on-surface font-semibold">{formatCurrency(pricing.setupCharges, pricing.currency)}</dd>
          </div>
        )}
        {pricing.discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em]">Bulk discount</dt>
            <dd className="font-mono text-[11px] text-emerald-600">-{formatCurrency(pricing.discount, pricing.currency)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-outline-variant/60 pt-3">
          <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Subtotal</dt>
          <dd className="font-mono text-[11px] text-on-surface font-semibold">{formatCurrency(pricing.subtotal, pricing.currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">VAT (20%)</dt>
          <dd className="font-mono text-[11px] text-on-surface font-semibold">{formatCurrency(pricing.tax, pricing.currency)}</dd>
        </div>
        {pricing.shipping > 0 && (
          <div className="flex justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Shipping</dt>
            <dd className="font-mono text-[11px] text-on-surface font-semibold">{formatCurrency(pricing.shipping, pricing.currency)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-outline pt-4">
          <dt className="font-display font-black text-on-surface uppercase tracking-tight text-base">Estimated Total</dt>
          <dd className="font-display font-black text-magenta text-xl">{formatCurrency(pricing.total, pricing.currency)}</dd>
        </div>
      </dl>
    </div>
  );
}

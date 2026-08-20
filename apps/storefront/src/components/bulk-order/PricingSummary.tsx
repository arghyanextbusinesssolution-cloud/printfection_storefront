import { formatCurrency } from '@printfection/shared';
import type { PricingBreakdown } from '@printfection/types';

interface PricingSummaryProps {
  pricing: PricingBreakdown;
  title?: string;
}

export function PricingSummary({ pricing, title = 'Price Breakdown' }: PricingSummaryProps) {
  return (
    <div className="bg-[#111] border border-[#222] p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF007F] mb-1">Pricing</p>
      <h3 className="font-display font-black text-white uppercase tracking-tight text-lg mb-5">{title}</h3>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#666]">Garments</dt>
          <dd className="font-mono text-[11px] text-[#aaa]">{formatCurrency(pricing.garmentSubtotal, pricing.currency)}</dd>
        </div>
        {pricing.printingSubtotal > 0 && (
          <div className="flex justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#666]">Printing</dt>
            <dd className="font-mono text-[11px] text-[#aaa]">{formatCurrency(pricing.printingSubtotal, pricing.currency)}</dd>
          </div>
        )}
        {pricing.setupCharges > 0 && (
          <div className="flex justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#666]">Setup charges</dt>
            <dd className="font-mono text-[11px] text-[#aaa]">{formatCurrency(pricing.setupCharges, pricing.currency)}</dd>
          </div>
        )}
        {pricing.discount > 0 && (
          <div className="flex justify-between text-[#22c55e]">
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em]">Discount</dt>
            <dd className="font-mono text-[11px]">-{formatCurrency(pricing.discount, pricing.currency)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-[#333] pt-3">
          <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#666]">Subtotal</dt>
          <dd className="font-mono text-[11px] text-[#aaa]">{formatCurrency(pricing.subtotal, pricing.currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#666]">VAT (20%)</dt>
          <dd className="font-mono text-[11px] text-[#aaa]">{formatCurrency(pricing.tax, pricing.currency)}</dd>
        </div>
        {pricing.shipping > 0 && (
          <div className="flex justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#666]">Shipping</dt>
            <dd className="font-mono text-[11px] text-[#aaa]">{formatCurrency(pricing.shipping, pricing.currency)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-[#333] pt-4">
          <dt className="font-display font-black text-white uppercase tracking-tight text-base">Total</dt>
          <dd className="font-display font-black text-[#FF007F] text-xl">{formatCurrency(pricing.total, pricing.currency)}</dd>
        </div>
      </dl>
    </div>
  );
}


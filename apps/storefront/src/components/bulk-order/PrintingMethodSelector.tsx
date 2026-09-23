import type { FC, ReactNode } from 'react';

export interface PrintingMethodOption {
  id: string;
  name: string;
  badge?: string;
  description: string;
  minQtyText: string;
  recommendedFor: string;
  iconSvg: ReactNode;
}

const PRINTING_METHODS: PrintingMethodOption[] = [
  {
    id: 'SCREEN_PRINTING',
    name: 'Screen Printing',
    badge: 'Most Popular',
    description: 'Vibrant, durable prints using custom silk screens and premium plastisol/water-based inks.',
    minQtyText: '25+ items',
    recommendedFor: 'Large orders, bold vector graphics & solid colours',
    iconSvg: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
      </svg>
    ),
  },
  {
    id: 'DTG',
    name: 'Direct to Garment (DTG)',
    badge: 'No Min Order',
    description: 'High-definition digital printing straight onto fabric. Unlimited colours and soft hand-feel.',
    minQtyText: '1+ items',
    recommendedFor: 'Full-colour artwork, photos, gradients & small runs',
    iconSvg: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 14H8v-4h8v4zm4-6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
      </svg>
    ),
  },
  {
    id: 'EMBROIDERY',
    name: 'Premium Embroidery',
    badge: 'Premium Look',
    description: 'Stitched thread designs with rich texture. Long-lasting, professional corporate finish.',
    minQtyText: '12+ items',
    recommendedFor: 'Logos on chest, caps, jackets & polo shirts',
    iconSvg: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
  {
    id: 'DTF_TRANSFER',
    name: 'DTF / Heat Transfer',
    badge: 'Versatile',
    description: 'High-detail film transfers pressed onto fabric under high heat. Great for complex placements.',
    minQtyText: '10+ items',
    recommendedFor: 'Polyester, sportswear, high detail & multi-fabric',
    iconSvg: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
      </svg>
    ),
  },
];

interface PrintingMethodSelectorProps {
  selectedMethod: string;
  onSelectMethod: (methodId: string) => void;
}

export const PrintingMethodSelector: FC<PrintingMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PRINTING_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelectMethod(method.id)}
            className={`flex flex-col text-left p-5 rounded-xl border-2 transition-all duration-200 relative group cursor-pointer ${
              isSelected
                ? 'bg-magenta/5 border-magenta text-neutral-900 shadow-selected'
                : 'bg-white border-neutral-200 text-neutral-700 hover:border-black hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-start justify-between w-full mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-magenta text-white' : 'bg-neutral-100 text-neutral-600 group-hover:text-black group-hover:bg-neutral-200'}`}>
                  {method.iconSvg}
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-neutral-900 tracking-tight uppercase">{method.name}</h4>
                </div>
              </div>
              {method.badge && (
                <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded-full border ${
                  isSelected ? 'bg-magenta/10 text-magenta border-magenta/30' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}>
                  {method.badge}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-3">{method.description}</p>
            <div className="mt-auto pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <span>Recommended: <strong className="text-neutral-800 font-semibold">{method.recommendedFor}</strong></span>
              {isSelected && (
                <span className="flex items-center text-magenta font-bold gap-1">
                  ✓ Selected
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

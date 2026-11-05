import { useEffect } from 'react';
import type { BulkOrderSize, BulkColourState } from '../../types';

interface SizeQuantityGridProps {
  selectedColours: BulkColourState[];
  sizes: BulkOrderSize[];
  targetQuantity?: number;
  currency: string;
  onQuantityChange: (colourName: string, size: string, quantity: number, variantId: string) => void;
}

export function calculateDefaultSizeDistribution(
  targetQty: number,
  sizes: BulkOrderSize[]
): Record<string, number> {
  if (!sizes || sizes.length === 0 || targetQty <= 0) return {};

  const sizeNames = sizes.map((s) => s.size);
  // Default ratio weights (S:1, M:5, L:5, XL:1.5, 2XL:0.5, etc.)
  const weights: Record<string, number> = {
    XS: 0.5,
    S: 1.0,
    M: 5.0,
    L: 5.0,
    XL: 1.5,
    '2XL': 0.5,
    '3XL': 0.25,
  };

  const activeWeights = sizeNames.map((sz) => weights[sz.toUpperCase()] || 1.0);
  const totalWeight = activeWeights.reduce((a, b) => a + b, 0);

  const result: Record<string, number> = {};
  let sum = 0;

  sizeNames.forEach((sz, idx) => {
    const qty = Math.round((targetQty * activeWeights[idx]) / totalWeight);
    result[sz] = qty;
    sum += qty;
  });

  const delta = targetQty - sum;
  if (delta !== 0 && sizeNames.length > 0) {
    const primarySize = sizeNames.find((s) => s === 'M' || s === 'L') || sizeNames[0];
    result[primarySize] = Math.max(0, (result[primarySize] || 0) + delta);
  }

  return result;
}

export function SizeQuantityGrid({
  selectedColours,
  sizes,
  targetQuantity = 1,
  onQuantityChange,
}: SizeQuantityGridProps) {
  const totalAllColours = selectedColours.reduce((acc, c) => {
    return acc + Object.values(c.sizeQuantities).reduce((sum, q) => sum + q, 0);
  }, 0);

  // Auto-distribute by default if total configured quantity is 0
  useEffect(() => {
    if (totalAllColours === 0 && selectedColours.length > 0 && sizes.length > 0 && targetQuantity > 0) {
      autoDistributeRatio();
    }
  }, [selectedColours.length, sizes.length, targetQuantity]);

  const autoDistributeRatio = () => {
    if (selectedColours.length === 0 || sizes.length === 0) return;
    const perColourTarget = Math.max(1, Math.round(targetQuantity / selectedColours.length));

    selectedColours.forEach((colour) => {
      const breakdown = calculateDefaultSizeDistribution(perColourTarget, sizes);
      sizes.forEach((sz) => {
        const qty = breakdown[sz.size] || 0;
        onQuantityChange(colour.colourName, sz.size, qty, sz.variantId);
      });
    });
  };

  const splitEvenly = () => {
    if (selectedColours.length === 0 || sizes.length === 0) return;
    const perColourTarget = Math.max(1, Math.round(targetQuantity / selectedColours.length));
    const perSizeQty = Math.max(1, Math.floor(perColourTarget / sizes.length));

    selectedColours.forEach((colour) => {
      sizes.forEach((sz) => {
        onQuantityChange(colour.colourName, sz.size, perSizeQty, sz.variantId);
      });
    });
  };

  const clearAll = () => {
    selectedColours.forEach((colour) => {
      sizes.forEach((sz) => {
        onQuantityChange(colour.colourName, sz.size, 0, sz.variantId);
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Distribution Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-700">
          <span className="font-bold">Target Run:</span>
          <span className="bg-white px-2.5 py-1 rounded border border-neutral-300 font-bold text-neutral-900">{targetQuantity} units</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={autoDistributeRatio}
            className="font-mono text-xs font-bold uppercase tracking-wider text-magenta px-3.5 py-1.5 rounded-lg bg-magenta/10 border border-magenta/20 hover:bg-magenta hover:text-white transition-all cursor-pointer"
          >
            ⚡ Auto-Fill 1:5 Ratio
          </button>
          <button
            type="button"
            onClick={splitEvenly}
            className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-700 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:border-black transition-all cursor-pointer"
          >
            🔄 Split Evenly
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="font-mono text-xs text-neutral-500 hover:text-red-600 px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Horizontal Matrix Grid Container */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto p-4 md:p-6">
          <table className="w-full min-w-[650px] border-collapse" aria-label="Sizes and quantities matrix">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-mono text-xs uppercase tracking-widest pb-3">
                <th className="text-left py-3 px-3 font-bold">Colour</th>
                {sizes.map((sz) => (
                  <th key={sz.size} className="text-center py-3 px-2 font-bold w-16">
                    {sz.size}
                  </th>
                ))}
                <th className="text-center py-3 px-3 font-bold w-20">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {selectedColours.map((colour) => {
                const totalForColour = Object.values(colour.sizeQuantities).reduce((sum, q) => sum + q, 0);

                return (
                  <tr key={colour.colourName} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Colour Column */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full border border-neutral-300 shadow-xs flex-shrink-0"
                          style={{ backgroundColor: colour.colourHex || '#ddd' }}
                        />
                        <span className="font-display font-bold text-neutral-900 uppercase text-sm tracking-tight whitespace-nowrap">
                          {colour.colourName}
                        </span>
                      </div>
                    </td>

                    {/* Size Quantity Input Cells */}
                    {sizes.map((size) => {
                      const currentQty = colour.sizeQuantities[size.size] || 0;
                      return (
                        <td key={size.size} className="py-3 px-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={size.stock}
                            value={currentQty === 0 ? '' : currentQty}
                            placeholder="0"
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              onQuantityChange(colour.colourName, size.size, val, size.variantId);
                            }}
                            className={`w-14 h-12 text-center font-mono font-bold text-base rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-magenta/20 ${
                              currentQty > 0
                                ? 'bg-white border-neutral-900 text-neutral-900 shadow-sm'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-400 focus:border-magenta focus:bg-white'
                            }`}
                            aria-label={`${colour.colourName} size ${size.size} quantity`}
                          />
                        </td>
                      );
                    })}

                    {/* Colour Total Badge */}
                    <td className="py-3 px-3 text-center">
                      <div
                        className={`inline-flex items-center justify-center min-w-[50px] h-10 px-3 rounded-lg font-mono font-bold text-sm transition-all ${
                          totalForColour > 0
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                        }`}
                      >
                        {totalForColour}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Run Summary Bar */}
      <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-neutral-700">
          <span>Configured Total:</span>
          <strong className="text-neutral-900 font-bold text-lg">{totalAllColours} units</strong>
        </div>
        <div>
          <span
            className={`font-mono text-xs uppercase tracking-wider font-bold px-3.5 py-1.5 rounded-full border ${
              totalAllColours > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}
          >
            {totalAllColours > 0 ? '✓ Quantity configured' : 'Add at least 1 unit'}
          </span>
        </div>
      </div>
    </div>
  );
}

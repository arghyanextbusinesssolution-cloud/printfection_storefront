import { formatCurrency } from '@printfection/shared';
import type { BulkOrderSize, BulkColourState } from '../../types';

interface SizeQuantityGridProps {
  selectedColours: BulkColourState[];
  sizes: BulkOrderSize[];
  minimumOrderQuantity: number;
  currency: string;
  onQuantityChange: (colourName: string, size: string, quantity: number, variantId: string) => void;
}

export function SizeQuantityGrid({
  selectedColours,
  sizes,
  minimumOrderQuantity,
  currency,
  onQuantityChange,
}: SizeQuantityGridProps) {
  const totalAllColours = selectedColours.reduce((acc, c) => {
    return acc + Object.values(c.sizeQuantities).reduce((sum, q) => sum + q, 0);
  }, 0);

  const meetsMinimum = totalAllColours >= minimumOrderQuantity;

  return (
    <div className="space-y-8 animate-scale-in">
      {selectedColours.map((colour) => {
        const totalForColour = Object.values(colour.sizeQuantities).reduce((sum, q) => sum + q, 0);

        return (
          <div key={colour.colourName} className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-step">
            {/* Colour Header Banner */}
            <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full border border-outline"
                  style={{ backgroundColor: colour.colourHex || '#ddd' }}
                />
                <h3 className="font-display font-bold text-on-surface uppercase text-sm tracking-tight">
                  {colour.colourName}
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
                Total for colour: <strong className="text-on-surface">{totalForColour} units</strong>
              </span>
            </div>

            {/* Sizes Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]" aria-label={`Sizes and quantities for ${colour.colourName}`}>
                <thead>
                  <tr className="border-b border-outline-variant bg-surface">
                    <th className="text-left py-3 px-6 font-mono text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Size</th>
                    <th className="text-left py-3 px-6 font-mono text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Price</th>
                    <th className="text-left py-3 px-6 font-mono text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Stock</th>
                    <th className="text-center py-3 px-6 font-mono text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => {
                    const currentQty = colour.sizeQuantities[size.size] || 0;
                    return (
                      <tr key={size.size} className="border-b border-outline-variant/60 hover:bg-surface-container-low transition-colors">
                        <td className="py-4 px-6 font-display font-bold text-on-surface uppercase text-sm">{size.size}</td>
                        <td className="py-4 px-6 font-mono text-[11px] text-on-surface-variant">
                          {formatCurrency(size.price, currency)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-mono text-[11px] ${size.stock <= 10 ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
                            {size.stock} available
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => onQuantityChange(colour.colourName, size.size, currentQty - 1, size.variantId)}
                              disabled={currentQty <= 0}
                              className="w-8 h-8 rounded border border-outline-variant bg-surface flex items-center justify-center font-bold hover:bg-surface-container-low hover:border-outline disabled:opacity-40 transition-colors select-none"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={size.stock}
                              value={currentQty}
                              onChange={(e) =>
                                onQuantityChange(
                                  colour.colourName,
                                  size.size,
                                  parseInt(e.target.value, 10) || 0,
                                  size.variantId
                                )
                              }
                              className="w-16 text-center border border-outline rounded py-1 px-1 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-magenta focus:border-transparent"
                              aria-label={`Quantity for ${colour.colourName} size ${size.size}`}
                            />
                            <button
                              type="button"
                              onClick={() => onQuantityChange(colour.colourName, size.size, currentQty + 1, size.variantId)}
                              disabled={currentQty >= size.stock}
                              className="w-8 h-8 rounded border border-outline-variant bg-surface flex items-center justify-center font-bold hover:bg-surface-container-low hover:border-outline disabled:opacity-40 transition-colors select-none"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Global Summary & Validation */}
      <div className="p-6 bg-white border border-outline rounded-2xl shadow-card">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Combined Order Total</span>
          <span className={`text-3xl font-display font-black ${totalAllColours > 0 ? 'text-magenta' : 'text-on-surface-variant'}`}>
            {totalAllColours} <span className="text-xs font-mono font-medium text-on-surface-variant">units</span>
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Minimum Required</span>
          <span className={`font-mono text-[10px] uppercase tracking-[0.1em] font-semibold ${meetsMinimum ? 'text-emerald-600' : 'text-amber-600'}`}>
            {meetsMinimum ? '✓ Target Met' : `⚠️ Min Order ${minimumOrderQuantity} (${minimumOrderQuantity - totalAllColours} more needed)`}
          </span>
        </div>
      </div>
    </div>
  );
}

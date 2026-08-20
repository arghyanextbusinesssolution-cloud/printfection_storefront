import { formatCurrency } from '@printfection/shared';
import type { BulkOrderSize } from '../../types';

interface SizeQuantityGridProps {
  sizes: BulkOrderSize[];
  quantities: Record<string, number>;
  minimumOrderQuantity: number;
  currency: string;
  onQuantityChange: (size: string, quantity: number) => void;
}

export function SizeQuantityGrid({
  sizes,
  quantities,
  minimumOrderQuantity,
  currency,
  onQuantityChange,
}: SizeQuantityGridProps) {
  const total = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const meetsMinimum = total >= minimumOrderQuantity;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] border border-[#222]" aria-label="Size and quantity selection">
          <thead>
            <tr className="border-b border-[#333] bg-[#111]">
              <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">Size</th>
              <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">Price</th>
              <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">Stock</th>
              <th className="text-center py-3 px-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size.size} className="border-b border-[#222] hover:bg-[#111] transition-colors">
                <td className="py-4 px-4 font-display font-bold text-white uppercase text-sm">{size.size}</td>
                <td className="py-4 px-4 font-mono text-[11px] text-[#888]">
                  {formatCurrency(size.price, currency)}
                </td>
                <td className="py-4 px-4">
                  <span className={`font-mono text-[11px] ${size.stock <= 10 ? 'text-orange-400' : 'text-[#22c55e]'}`}>
                    {size.stock} available
                  </span>
                </td>
                <td className="py-4 px-4">
                  <input
                    type="number"
                    min={0}
                    max={size.stock}
                    value={quantities[size.size] || 0}
                    onChange={(e) => onQuantityChange(size.size, parseInt(e.target.value, 10) || 0)}
                    className="w-20 mx-auto block text-center bg-[#111] border border-[#333] text-white font-mono text-sm py-2 px-2 focus:outline-none focus:border-[#FF007F] transition-colors"
                    aria-label={`Quantity for size ${size.size}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-5 bg-[#111] border border-[#222]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#888]">Total Quantity</span>
          <span className={`text-2xl font-display font-black ${total > 0 ? 'text-white' : 'text-[#444]'}`}>{total}</span>
        </div>
        <p className={`mt-2 font-mono text-[10px] uppercase tracking-[0.1em] ${meetsMinimum ? 'text-[#22c55e]' : 'text-orange-400'}`}>
          {meetsMinimum ? '✓ ' : ''}Minimum order: {minimumOrderQuantity} units
          {!meetsMinimum && total > 0 && ` (${minimumOrderQuantity - total} more needed)`}
        </p>
      </div>
    </div>
  );
}


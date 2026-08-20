import type { FilterOptions } from '@printfection/types';

interface ProductFiltersProps {
  filters: FilterOptions;
  selected: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string | boolean | undefined) => void;
  onClear: () => void;
}

export function ProductFiltersPanel({ filters, selected, onChange, onClear }: ProductFiltersProps) {
  const hasFilters = Object.values(selected).some((v) => v !== undefined && v !== '');

  return (
    <aside className="space-y-6" aria-label="Product filters">
      <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-2">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">Filters</h2>
        {hasFilters && (
          <button onClick={onClear} className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#FF007F] hover:text-white transition-colors">
            Clear all
          </button>
        )}
      </div>

      {filters.brands.length > 0 && (
        <FilterSelect
          label="Brand"
          id="brand"
          value={selected.brand as string}
          options={filters.brands}
          onChange={(v) => onChange('brand', v || undefined)}
        />
      )}

      {filters.genders.length > 0 && (
        <FilterSelect
          label="Gender"
          id="gender"
          value={selected.gender as string}
          options={filters.genders}
          onChange={(v) => onChange('gender', v || undefined)}
        />
      )}

      {filters.fabrics.length > 0 && (
        <FilterSelect
          label="Fabric"
          id="fabric"
          value={selected.fabric as string}
          options={filters.fabrics}
          onChange={(v) => onChange('fabric', v || undefined)}
        />
      )}

      <div>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={!!selected.organic}
            onChange={(e) => onChange('organic', e.target.checked || undefined)}
            className="rounded border-[#333] bg-[#111] text-[#FF007F] focus:ring-0 focus:ring-offset-0"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#e5bcc5] group-hover:text-white transition-colors">Organic only</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={!!selected.plusSizeAvailable}
            onChange={(e) => onChange('plusSizeAvailable', e.target.checked || undefined)}
            className="rounded border-[#333] bg-[#111] text-[#FF007F] focus:ring-0 focus:ring-offset-0"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#e5bcc5] group-hover:text-white transition-colors">Plus sizes available</span>
        </label>
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  id,
  value,
  options,
  onChange,
}: {
  label: string;
  id: string;
  value?: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#555] mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#111] border border-[#333] text-[#e5e2e1] text-xs px-4 py-2.5 focus:outline-none focus:border-[#FF007F] font-mono appearance-none cursor-pointer"
        >
          <option value="" className="bg-[#111] text-[#e5e2e1]">All</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#111] text-[#e5e2e1]">{opt}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">▼</span>
      </div>
    </div>
  );
}

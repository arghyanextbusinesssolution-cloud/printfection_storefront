import type { PrintLocation } from '../../types';
import { useBulkOrderStore } from '../../store/bulkOrderStore';

interface PrintLocationSelectorProps {
  locations: PrintLocation[];
}

export function PrintLocationSelector({ locations }: PrintLocationSelectorProps) {
  const { printLocations, togglePrintLocation, setPrintColourCount } = useBulkOrderStore();

  return (
    <div className="space-y-3">
      {locations.map((location) => {
        const selected = printLocations.find((l) => l.locationId === location._id);
        return (
          <div
            key={location._id}
            className={`border transition-all duration-200 p-5 ${
              selected
                ? 'border-[#FF007F] bg-[#111] shadow-[0_0_15px_rgba(255,0,127,0.1)]'
                : 'border-[#333] bg-[#0d0d0d] hover:border-[#444]'
            }`}
          >
            <label className="flex items-center gap-4 cursor-pointer">
              {/* Custom checkbox */}
              <span className={`w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                selected ? 'border-[#FF007F] bg-[#FF007F]' : 'border-[#444]'
              }`}>
                {selected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={!!selected}
                onChange={() =>
                  togglePrintLocation({
                    locationId: location._id,
                    locationName: location.name,
                    colourCount: 1,
                    maximumColours: location.maximumColours,
                  })
                }
                className="sr-only"
              />
              <span className="font-display font-bold text-white uppercase tracking-tight text-sm">{location.name}</span>
            </label>

            {selected && (
              <div className="mt-4 pl-9">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#666] mb-3">
                  Number of print colours (max {location.maximumColours})
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: location.maximumColours }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPrintColourCount(location._id, n)}
                      className={`w-10 h-10 font-display font-bold text-sm border-2 transition-all duration-150 ${
                        selected.colourCount === n
                          ? 'bg-[#FF007F] text-white border-[#FF007F]'
                          : 'bg-transparent text-[#888] border-[#333] hover:border-[#FF007F] hover:text-white'
                      }`}
                      aria-pressed={selected.colourCount === n}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


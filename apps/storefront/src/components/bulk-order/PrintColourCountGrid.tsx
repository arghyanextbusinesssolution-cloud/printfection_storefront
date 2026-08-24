import { useBulkOrderStore } from '../../store/bulkOrderStore';

export function PrintColourCountGrid() {
  const { selectedLocations, setPrintColourCount } = useBulkOrderStore();

  return (
    <div className="space-y-6 animate-scale-in">
      {selectedLocations.map((location) => (
        <div key={location.locationId} className="bg-white border border-outline-variant p-6 rounded-2xl shadow-step">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant/60 pb-4 mb-4 gap-2">
            <div>
              <h3 className="font-display font-black text-on-surface uppercase text-base tracking-tight">
                {location.locationName}
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/80 mt-1">
                Configure colors for this print position (Max {location.maximumColours})
              </p>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-magenta font-bold">
              Currently Selected: {location.colourCount} Col
            </span>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-on-surface-variant mb-3">
            Select print colors count:
          </p>

          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: location.maximumColours }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPrintColourCount(location.locationId, n)}
                className={`w-12 h-12 rounded-xl font-display font-black text-sm border-2 transition-all duration-200 ${
                  location.colourCount === n
                    ? 'bg-magenta text-white border-magenta shadow-selected scale-105'
                    : 'bg-white text-on-surface-variant border-outline-variant hover:border-outline hover:text-on-surface'
                }`}
                aria-pressed={location.colourCount === n}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

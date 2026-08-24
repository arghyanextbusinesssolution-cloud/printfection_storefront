import type { PrintLocation } from '../../types';
import { useBulkOrderStore } from '../../store/bulkOrderStore';

interface PrintLocationSelectorProps {
  locations: PrintLocation[];
}

export function PrintLocationSelector({ locations }: PrintLocationSelectorProps) {
  const { selectedLocations, togglePrintLocation } = useBulkOrderStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-scale-in">
      {locations.map((location) => {
        const isSelected = selectedLocations.some((l) => l.locationId === location._id);

        return (
          <button
            key={location._id}
            type="button"
            onClick={() =>
              togglePrintLocation({
                locationId: location._id,
                locationName: location.name,
                code: location.code,
                iconSvg: location.iconSvg,
                maximumColours: location.maximumColours,
              })
            }
            className={`flex flex-col items-center justify-center p-6 border-2 transition-all duration-300 rounded-2xl outline-none select-none relative group ${
              isSelected
                ? 'border-magenta bg-white shadow-selected scale-[1.02]'
                : 'border-outline-variant bg-white hover:border-outline hover:shadow-card'
            }`}
          >
            {/* SVG Visual Icon */}
            <div
              className={`w-20 h-20 mb-4 transition-colors duration-300 ${
                isSelected ? 'text-magenta' : 'text-on-surface-variant group-hover:text-on-surface'
              }`}
              dangerouslySetInnerHTML={{
                __html:
                  location.iconSvg ||
                  `<svg viewBox="0 0 100 100" class="w-full h-full stroke-current fill-none" stroke-width="1.5"><rect x="20" y="20" width="60" height="60" rx="4" stroke-dasharray="3,3" /></svg>`,
              }}
            />

            {/* Label */}
            <span
              className={`font-display font-bold text-xs uppercase tracking-tight transition-colors ${
                isSelected ? 'text-magenta' : 'text-on-surface'
              }`}
            >
              {location.name}
            </span>

            {/* Max colours hint */}
            <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/70 mt-1">
              Max {location.maximumColours} colours
            </span>

            {/* Top-right checkbox indicator */}
            <span
              className={`absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                isSelected ? 'border-magenta bg-magenta' : 'border-outline-variant bg-white'
              }`}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white animate-scale-in" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

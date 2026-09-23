import { useBulkOrderStore } from '../../store/bulkOrderStore';

const LOCATION_PRINT_METHODS = [
  {
    id: 'SCREEN_PRINTING',
    name: 'Screen Printing',
    desc: 'Custom silk screens',
    badge: 'Popular',
  },
  {
    id: 'DTG',
    name: 'DTG Digital',
    desc: 'Full-colour digital',
    badge: 'Soft feel',
  },
  {
    id: 'EMBROIDERY',
    name: 'Embroidery',
    desc: 'Stitched thread',
    badge: 'Premium',
  },
  {
    id: 'DTF_TRANSFER',
    name: 'DTF Transfer',
    desc: 'Heat film press',
    badge: 'Versatile',
  },
];

const LOCATION_PRINT_SIZES = [
  { id: 'Standard (A4 - up to 30cm)', name: 'Standard A4', desc: 'Up to 30cm x 30cm', badge: 'Standard' },
  { id: 'Large (A3 - up to 40cm)', name: 'Large A3', desc: 'Up to 40cm x 40cm', badge: 'Popular' },
  { id: 'Pocket / Badge (10cm x 10cm)', name: 'Pocket / Badge', desc: 'Up to 10cm x 10cm', badge: 'Chest' },
  { id: 'Full Oversized (Max 45cm)', name: 'Max Oversized', desc: 'Up to 45cm x 50cm', badge: 'Maximum' },
];

export function PrintColourCountGrid() {
  const { selectedLocations, setPrintColourCount, setLocationPrintingMethod, setPrintSize } = useBulkOrderStore();

  return (
    <div className="space-y-6 animate-scale-in">
      {selectedLocations.map((location) => {
        const currentMethod = location.printingMethod || 'SCREEN_PRINTING';
        const currentSize = location.printSize || 'Standard (A4 - up to 30cm)';

        return (
          <div key={location.locationId} className="bg-white border-2 border-neutral-200 p-6 rounded-2xl shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-4 gap-2">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-magenta font-bold block mb-1">
                  Location Customisation
                </span>
                <h3 className="font-display font-black text-neutral-900 uppercase text-lg tracking-tight">
                  {location.locationName}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full font-bold">
                  {location.colourCount} Ink Colour{location.colourCount > 1 ? 's' : ''}
                </span>
                <span className="font-mono text-xs text-magenta bg-magenta/10 px-3 py-1 rounded-full font-bold uppercase">
                  {currentMethod.replace('_', ' ')}
                </span>
                <span className="font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full font-bold uppercase">
                  {currentSize.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* 1. NUMBER OF INK COLOURS */}
            <div>
              <p className="font-mono text-xs uppercase tracking-wider font-bold text-neutral-800 mb-3">
                1. Select Number of Ink Colours:
              </p>

              <div className="flex flex-wrap gap-2.5">
                {Array.from({ length: location.maximumColours }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPrintColourCount(location.locationId, n)}
                    className={`w-12 h-12 rounded-xl font-display font-black text-sm border-2 transition-all duration-200 cursor-pointer ${
                      location.colourCount === n
                        ? 'bg-magenta text-white border-magenta shadow-selected scale-105'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                    aria-pressed={location.colourCount === n}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. PRINTING METHOD FOR THIS LOCATION */}
            <div className="pt-4 border-t border-neutral-100">
              <p className="font-mono text-xs uppercase tracking-wider font-bold text-neutral-800 mb-3">
                2. Select Printing Method for {location.locationName}:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LOCATION_PRINT_METHODS.map((method) => {
                  const isSelected = currentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setLocationPrintingMethod(location.locationId, method.id)}
                      className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? 'bg-magenta/5 border-magenta text-neutral-900 shadow-sm'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:border-black'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-display font-bold text-xs uppercase tracking-tight text-neutral-900">
                          {method.name}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 bg-magenta text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {method.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. PRINT SIZE FOR THIS LOCATION (MANDATORY) */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs uppercase tracking-wider font-bold text-neutral-800 flex items-center gap-1.5">
                  3. Select Print Location Size:
                </p>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-magenta bg-magenta/10 px-2.5 py-0.5 rounded">
                  Mandatory Field *
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LOCATION_PRINT_SIZES.map((sz) => {
                  const isSelected = currentSize === sz.id;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setPrintSize(location.locationId, sz.id)}
                      className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-600 text-neutral-900 shadow-sm ring-1 ring-emerald-600/30'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:border-black'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-display font-bold text-xs uppercase tracking-tight text-neutral-900">
                          {sz.name}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {sz.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

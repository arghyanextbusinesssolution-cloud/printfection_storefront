import type { PrintLocation } from '../../types';
import { useBulkOrderStore } from '../../store/bulkOrderStore';

interface PrintLocationSelectorProps {
  locations: PrintLocation[];
}

function getGarmentSvg(code?: string, name?: string, isSelected?: boolean) {
  const lc = (code || name || '').toLowerCase();
  const strokeColor = '#171717';
  const spotColor = isSelected ? '#FF007F' : '#b8860b';

  // Base T-shirt path matching Monster Press style
  const tShirtPath = (
    <path
      d="M30 18 C38 24 62 24 70 18 L88 30 L78 44 L72 38 L72 84 L28 84 L28 38 L22 44 L12 30 Z"
      fill="#ffffff"
      stroke={strokeColor}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  const collarPath = (
    <path
      d="M38 18 C44 24 56 24 62 18"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
    />
  );

  if (lc.includes('back')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {tShirtPath}
        <path d="M38 18 C44 20 56 20 62 18" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="2 2" />
        {/* Large Back Spot */}
        <ellipse cx="50" cy="48" rx="16" ry="20" fill={spotColor} />
      </svg>
    );
  }

  if (lc.includes('left_chest') || lc.includes('left chest')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {tShirtPath}
        {collarPath}
        {/* Left chest spot (viewer's right side) */}
        <circle cx="60" cy="40" r="7" fill={spotColor} />
      </svg>
    );
  }

  if (lc.includes('right_chest') || lc.includes('right chest')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {tShirtPath}
        {collarPath}
        {/* Right chest spot (viewer's left side) */}
        <circle cx="40" cy="40" r="7" fill={spotColor} />
      </svg>
    );
  }

  if (lc.includes('left_sleeve') || lc.includes('left sleeve')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {tShirtPath}
        {collarPath}
        {/* Left sleeve spot (viewer's right) */}
        <circle cx="76" cy="42" r="6" fill={spotColor} />
      </svg>
    );
  }

  if (lc.includes('right_sleeve') || lc.includes('right sleeve')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {tShirtPath}
        {collarPath}
        {/* Right sleeve spot (viewer's left) */}
        <circle cx="24" cy="42" r="6" fill={spotColor} />
      </svg>
    );
  }

  if (lc.includes('neck') || lc.includes('tag')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {tShirtPath}
        {collarPath}
        {/* Inside Neck Tag Spot */}
        <ellipse cx="50" cy="24" rx="7" ry="4" fill={spotColor} />
      </svg>
    );
  }

  // Default Front Center Chest Spot
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {tShirtPath}
      {collarPath}
      {/* Front Center Spot */}
      <ellipse cx="50" cy="50" rx="16" ry="20" fill={spotColor} />
    </svg>
  );
}

export function PrintLocationSelector({ locations }: PrintLocationSelectorProps) {
  const { selectedLocations, togglePrintLocation } = useBulkOrderStore();

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Location Banner Subtitle */}
      <div className="text-center mb-6 max-w-xl mx-auto">
        <h3 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight text-neutral-900 flex items-center justify-center gap-2">
          <span className="w-7 h-7 rounded-full border-2 border-neutral-900 inline-flex items-center justify-center text-sm font-serif italic">i</span>
          CHOOSE YOUR PRINT LOCATIONS
        </h3>
        <p className="text-xs text-neutral-600 font-sans mt-1.5 leading-relaxed">
          We will send you a digital proof to approve before printing your order. Artwork can be uploaded after checkout.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
              className={`flex flex-col items-center justify-center p-4 border-3 transition-all duration-200 rounded-2xl outline-none select-none relative group cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-neutral-200 bg-white hover:border-black hover:shadow-sm'
              }`}
            >
              {/* T-Shirt SVG Graphic */}
              <div className="w-24 h-24 mb-2 transition-transform duration-200 group-hover:scale-105">
                {getGarmentSvg(location.code, location.name, isSelected)}
              </div>

              {/* Location Label */}
              <span
                className={`font-display font-black text-xs uppercase tracking-tight text-center transition-colors ${
                  isSelected ? 'text-emerald-700' : 'text-neutral-900'
                }`}
              >
                {location.name}
              </span>

              {/* Checkmark circle badge top-right */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

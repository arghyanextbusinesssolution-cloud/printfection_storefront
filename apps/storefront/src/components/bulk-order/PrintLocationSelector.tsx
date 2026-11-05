import type { PrintLocation } from '../../types';
import { useBulkOrderStore } from '../../store/bulkOrderStore';

interface PrintLocationSelectorProps {
  locations: PrintLocation[];
}

/* ─── Front-facing T-shirt outline ─── */
function ShirtFront({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      {/* Body + sleeves */}
      <path
        d="M62 38 C80 52 120 52 138 38 L178 68 L162 96 L144 78 L144 200 L56 200 L56 78 L38 96 L22 68 Z"
        fill="#ffffff"
        stroke="#333333"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Collar */}
      <path
        d="M76 38 C88 54 112 54 124 38"
        fill="none"
        stroke="#333333"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {children}
    </svg>
  );
}

/* ─── Back-facing T-shirt outline ─── */
function ShirtBack({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      {/* Body + sleeves */}
      <path
        d="M62 38 C80 52 120 52 138 38 L178 68 L162 96 L144 78 L144 200 L56 200 L56 78 L38 96 L22 68 Z"
        fill="#ffffff"
        stroke="#333333"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Back collar (flat line) */}
      <path
        d="M76 38 C88 44 112 44 124 38"
        fill="none"
        stroke="#333333"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {children}
    </svg>
  );
}

/* ─── Sleeve outline for sleeve placements ─── */
function SleeveOutline({ children, flip }: { children?: React.ReactNode; flip?: boolean }) {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <g transform={flip ? 'translate(200,0) scale(-1,1)' : undefined}>
        <path
          d="M76 24 C96 28 124 44 140 76 L156 176 L44 176 L60 76 C68 48 68 28 76 24 Z"
          fill="#ffffff"
          stroke="#333333"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M64 76 L136 76" fill="none" stroke="#333333" strokeWidth="1.5" />
        {children}
      </g>
    </svg>
  );
}

const SPOT = '#c9c9c9';
const SPOT_STROKE = '#b0b0b0';

function PlacementArt({ code, name }: { code?: string; name?: string }) {
  const key = `${code || ''} ${name || ''}`.toLowerCase().replace(/[_-]/g, ' ');

  /* ── FRONT ── Large centre block */
  if (key.includes('lower front')) {
    return (
      <ShirtFront>
        <rect x="68" y="120" width="64" height="64" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtFront>
    );
  }
  if (key.includes('left chest')) {
    return (
      <ShirtFront>
        <rect x="100" y="66" width="30" height="30" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtFront>
    );
  }
  if (key.includes('right chest')) {
    return (
      <ShirtFront>
        <rect x="70" y="66" width="30" height="30" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtFront>
    );
  }
  if (key.includes('left vert')) {
    return (
      <ShirtFront>
        <rect x="62" y="62" width="26" height="120" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtFront>
    );
  }
  if (key.includes('right vert')) {
    return (
      <ShirtFront>
        <rect x="112" y="62" width="26" height="120" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtFront>
    );
  }
  if (key.includes('left bottom')) {
    return (
      <ShirtFront>
        <rect x="100" y="152" width="30" height="30" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtFront>
    );
  }
  if (key.includes('right bottom')) {
    return (
      <ShirtFront>
        <rect x="70" y="152" width="30" height="30" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtFront>
    );
  }
  if (key.includes('inside neck') || (key.includes('neck') && !key.includes('nape'))) {
    return (
      <ShirtFront>
        <rect x="82" y="42" width="36" height="16" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtFront>
    );
  }

  /* ── BACK views ── */
  if (key.includes('nape') || key.includes('outer nape') || key.includes('upper back')) {
    return (
      <ShirtBack>
        <rect x="78" y="48" width="44" height="26" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtBack>
    );
  }
  if (key.includes('lower back')) {
    return (
      <ShirtBack>
        <rect x="64" y="120" width="72" height="68" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtBack>
    );
  }
  if (key.includes('full back') || (key.includes('back') && !key.includes('lower') && !key.includes('upper'))) {
    return (
      <ShirtBack>
        <rect x="66" y="62" width="68" height="80" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </ShirtBack>
    );
  }

  /* ── SLEEVES ── */
  if (key.includes('left sleeve')) {
    return (
      <SleeveOutline>
        <rect x="76" y="88" width="48" height="44" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </SleeveOutline>
    );
  }
  if (key.includes('right sleeve')) {
    return (
      <SleeveOutline flip>
        <rect x="76" y="88" width="48" height="44" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
      </SleeveOutline>
    );
  }

  /* ── FRONT (default / centre front) ── */
  return (
    <ShirtFront>
      <rect x="68" y="60" width="64" height="72" rx="2" fill={SPOT} stroke={SPOT_STROKE} strokeWidth="1" />
    </ShirtFront>
  );
}

export function PrintLocationSelector({ locations }: PrintLocationSelectorProps) {
  const { selectedLocations, togglePrintLocation } = useBulkOrderStore();

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Header */}
      <div className="text-center mb-4 max-w-2xl mx-auto">
        <h3 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-neutral-900">
          Print Placements
        </h3>
        <p className="text-xs md:text-sm text-neutral-600 mt-2 leading-relaxed uppercase tracking-wide font-display font-bold">
          There are a number of positions on a garment you can print and we have
          the facilities to do them all. Below you can find a wide range of
          positions for printing to give you an idea.
        </p>
      </div>

      {/* Grid of placement cards - 4 columns like the reference */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8 bg-white border border-neutral-200 rounded-2xl p-6 md:p-10">
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
              className={`group flex flex-col items-center justify-start transition-all duration-200 rounded-xl outline-none select-none relative cursor-pointer p-3 ${
                isSelected
                  ? 'bg-magenta/5 ring-2 ring-magenta shadow-md'
                  : 'hover:bg-neutral-50 hover:shadow-sm'
              }`}
            >
              {/* T-shirt illustration */}
              <div className="w-full aspect-square max-w-[160px]">
                <PlacementArt code={location.code} name={location.name} />
              </div>

              {/* Label */}
              <span className="mt-2 font-display font-black text-[11px] md:text-xs uppercase tracking-wider text-center text-neutral-900 leading-tight">
                {location.name}
              </span>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-magenta rounded-full flex items-center justify-center shadow">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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

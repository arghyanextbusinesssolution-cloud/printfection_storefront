import type { GarmentCategory } from '../../types';

interface GarmentTypeSelectorProps {
  categories: GarmentCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string, name: string) => void;
  isLoading?: boolean;
}

function GarmentIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();

  if (lower.includes('polo')) {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
        <path d="M18 14 C26 20 38 20 46 14 L56 22 L50 32 L46 28 L46 54 L18 54 L18 28 L14 32 L8 22 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 14 L26 24 L32 14 L38 24 L46 14" stroke="#111" strokeWidth="2" fill="none" />
        <path d="M32 14 L32 28" stroke="#FF007F" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="2" fill="#FF007F" />
      </svg>
    );
  }

  if (lower.includes('sweat')) {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
        <path d="M16 16 C24 22 40 22 48 16 L60 30 L52 38 L46 30 L46 54 L18 54 L18 30 L12 38 L4 30 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 54 H46" stroke="#111" strokeWidth="3" />
        <path d="M26 16 C28 22 36 22 38 16" stroke="#FF007F" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  if (lower.includes('hoodie')) {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
        <path d="M16 20 C24 24 40 24 48 20 L60 34 L52 42 L46 34 L46 56 L18 56 L18 34 L12 42 L4 34 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
        <path d="M22 20 C22 8 42 8 42 20" stroke="#111" strokeWidth="2" fill="#fff" />
        <path d="M24 40 H40 V52 H24 Z" stroke="#FF007F" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  if (lower.includes('jersey')) {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
        <path d="M20 14 C26 20 38 20 44 14 L54 24 L48 32 L44 28 L44 54 L20 54 L20 28 L16 32 L10 24 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
        <text x="32" y="42" textAnchor="middle" fontSize="14" fontWeight="800" fill="#FF007F" fontFamily="Arial, sans-serif">23</text>
      </svg>
    );
  }

  if (lower.includes('cap') || lower.includes('hat')) {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
        <path d="M14 36 C14 18 50 18 50 36 Z" fill="#fff" stroke="#111" strokeWidth="2" />
        <path d="M14 36 L56 40 C56 46 48 48 40 46 L14 36" fill="#fff" stroke="#111" strokeWidth="2" />
        <circle cx="32" cy="28" r="3" fill="#FF007F" />
      </svg>
    );
  }

  if (lower.includes('bag') || lower.includes('tote')) {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
        <rect x="16" y="24" width="32" height="28" rx="3" fill="#fff" stroke="#111" strokeWidth="2" />
        <path d="M24 24 C24 14 40 14 40 24" stroke="#111" strokeWidth="2" fill="none" />
        <rect x="26" y="32" width="12" height="10" rx="1" fill="#FF007F" opacity="0.85" />
      </svg>
    );
  }

  if (lower.includes('fabric') || lower.includes('print')) {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="22" width="40" height="10" rx="2" fill="#fff" stroke="#111" strokeWidth="2" />
        <rect x="12" y="32" width="40" height="10" rx="2" fill="#fff" stroke="#111" strokeWidth="2" />
        <rect x="12" y="42" width="40" height="10" rx="2" fill="#FF007F" stroke="#111" strokeWidth="2" />
      </svg>
    );
  }

  // T-shirt default
  return (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
      <path d="M18 14 C26 20 38 20 46 14 L56 22 L50 32 L46 28 L46 54 L18 54 L18 28 L14 32 L8 22 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
      <path d="M26 14 C30 20 34 20 38 14" stroke="#111" strokeWidth="2" fill="none" />
      <rect x="26" y="30" width="12" height="14" rx="1" fill="#FF007F" opacity="0.9" />
    </svg>
  );
}

export function GarmentTypeSelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isLoading = false,
}: GarmentTypeSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="h-28 w-28 shrink-0 bg-neutral-100 border border-neutral-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat._id;
        return (
          <button
            key={cat._id}
            type="button"
            onClick={() => onSelectCategory(cat._id, cat.name)}
            className={`flex flex-col items-center justify-center shrink-0 w-[108px] sm:w-[118px] py-4 px-3 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer ${
              isSelected
                ? 'bg-white border-magenta shadow-[0_0_0_4px_rgba(255,0,127,0.12)]'
                : 'bg-white border-neutral-200 hover:border-magenta/50'
            }`}
          >
            <div className="relative mb-2 w-16 h-16 rounded-full bg-magenta/10 flex items-center justify-center">
              <GarmentIcon name={cat.name} />
            </div>
            <span className="font-display font-black text-[10px] tracking-tight uppercase leading-tight text-neutral-900">
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

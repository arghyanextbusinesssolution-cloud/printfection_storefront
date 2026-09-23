import type { GarmentCategory } from '../../types';

interface GarmentTypeSelectorProps {
  categories: GarmentCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string, name: string) => void;
  isLoading?: boolean;
}

const GarmentIcon = ({ name }: { name: string }) => {
  const lower = name.toLowerCase();

  if (lower.includes('longsleeve') || lower.includes('long sleeve')) {
    return (
      <svg className="w-7 h-7 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 100 100">
        <path d="M30 18 C38 24 62 24 70 18 L92 48 L80 58 L72 46 L72 84 L28 84 L28 46 L20 58 L8 48 Z" />
        <path d="M38 18 C44 24 56 24 62 18" />
      </svg>
    );
  }

  if (lower.includes('sweat') || lower.includes('jumper') || lower.includes('sweater')) {
    return (
      <svg className="w-7 h-7 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 100 100">
        <path d="M30 20 C38 26 62 26 70 20 L92 46 L80 56 L72 44 L72 82 L28 82 L28 44 L20 56 L8 46 Z" />
        <path d="M28 82 L72 82" strokeWidth="4" />
      </svg>
    );
  }

  if (lower.includes('hoodie') || lower.includes('hooded')) {
    return (
      <svg className="w-7 h-7 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 100 100">
        <path d="M30 24 C38 28 62 28 70 24 L92 48 L80 58 L72 46 L72 84 L28 84 L28 46 L20 58 L8 48 Z" />
        <path d="M36 24 C36 12 64 12 64 24" />
        <path d="M46 30 L46 42 M54 30 L54 42" strokeWidth="2.5" />
      </svg>
    );
  }

  if (lower.includes('jacket') || lower.includes('outerwear') || lower.includes('fleece')) {
    return (
      <svg className="w-7 h-7 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 100 100">
        <path d="M30 18 L44 26 L50 20 L56 26 L70 18 L90 44 L80 54 L72 44 L72 84 L28 84 L28 44 L20 54 L10 44 Z" />
        <path d="M50 20 L50 84" />
        <path d="M30 18 L44 26 M70 18 L56 26" />
      </svg>
    );
  }

  if (lower.includes('polo')) {
    return (
      <svg className="w-7 h-7 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 100 100">
        <path d="M30 18 C38 22 62 22 70 18 L88 30 L78 44 L72 38 L72 84 L28 84 L28 38 L22 44 L12 30 Z" />
        <path d="M30 18 L42 28 L50 18 L58 28 L70 18" />
        <path d="M50 18 L50 42" />
      </svg>
    );
  }

  if (lower.includes('bag') || lower.includes('tote')) {
    return (
      <svg className="w-7 h-7 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 100 100">
        <rect x="25" y="35" width="50" height="50" rx="2" />
        <path d="M38 35 C38 18 62 18 62 35" />
      </svg>
    );
  }

  if (lower.includes('beanie') || lower.includes('knit')) {
    return (
      <svg className="w-7 h-7 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 100 100">
        <path d="M22 65 C22 30 78 30 78 65 Z" />
        <rect x="20" y="65" width="60" height="15" rx="3" strokeWidth="3" />
      </svg>
    );
  }

  if (lower.includes('cap') || lower.includes('hat') || lower.includes('headwear')) {
    return (
      <svg className="w-7 h-7 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 100 100">
        <path d="M20 55 C20 30 80 30 80 55 Z" />
        <path d="M20 55 L85 58 C85 64 75 66 65 65 L20 55" strokeWidth="3" />
      </svg>
    );
  }

  // T-Shirt default
  return (
    <svg className="w-7 h-7 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 100 100">
      <path d="M30 18 C38 24 62 24 70 18 L88 30 L78 44 L72 38 L72 84 L28 84 L28 38 L22 44 L12 30 Z" />
      <path d="M38 18 C44 24 56 24 62 18" />
    </svg>
  );
};

export const GarmentTypeSelector: React.FC<GarmentTypeSelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div key={n} className="h-28 bg-neutral-100 border border-neutral-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat._id;
        return (
          <button
            key={cat._id}
            type="button"
            onClick={() => onSelectCategory(cat._id, cat.name)}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all duration-200 text-center group cursor-pointer relative ${
              isSelected
                ? 'bg-magenta/5 border-magenta text-neutral-900 shadow-selected scale-[1.02]'
                : 'bg-white border-neutral-200 text-neutral-700 hover:border-black hover:text-black hover:bg-neutral-50'
            }`}
          >
            <div
              className={`mb-2 p-2.5 rounded-lg transition-colors relative ${
                isSelected
                  ? 'bg-magenta text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 group-hover:text-black group-hover:bg-neutral-200'
              }`}
            >
              <GarmentIcon name={cat.name} />
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <span className="font-bold text-xs tracking-tight uppercase font-display leading-tight text-center">
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

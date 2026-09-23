import type { GarmentCategory } from '../../types';

interface GarmentTypeSelectorProps {
  categories: GarmentCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string, name: string) => void;
  isLoading?: boolean;
}

const GarmentIcon = ({ name }: { name: string }) => {
  const lower = name.toLowerCase();

  if (lower.includes('hoodie') || lower.includes('hooded')) {
    return (
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C9.5 2 7 3.5 7 6v2H4v7l2 1v6h12v-6l2-1V8h-3V6c0-2.5-2.5-4-5-4zm0 2c1.8 0 3 1.1 3 2.5V8H9V6.5C9 5.1 10.2 4 12 4zm-4 6h8v9H8v-9z" />
      </svg>
    );
  }

  if (lower.includes('sweatshirt') || lower.includes('jumper') || lower.includes('fleece')) {
    return (
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M8 2l-4 4v5l3-1v12h10V10l3 1V6l-4-4-4 2-4-2zm-1 8.5L5 11V7l2-2v5.5zm10 0V5l2 2v4l-2-.5zM9 4.2L12 5.7l3-1.5V7H9V4.2z" />
      </svg>
    );
  }

  if (lower.includes('bag') || lower.includes('tote')) {
    return (
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M18 6h-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v1H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-1c0-.55.45-1 1-1s1 .45 1 1v1h-2V5zm7 15H6V8h2v2h2V8h4v2h2V8h2v12z" />
      </svg>
    );
  }

  if (lower.includes('jacket') || lower.includes('outerwear') || lower.includes('vest')) {
    return (
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M12 2L4 5v6l3-1v10h10V10l3 1V5l-8-3zm-1 18H6V10.5l5.5-1.5V20zm7 0h-5V9l5.5 1.5V20z" />
      </svg>
    );
  }

  if (lower.includes('cap') || lower.includes('hat') || lower.includes('headwear')) {
    return (
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M12 4C7.5 4 3.8 7.3 3.1 11.5L1 13v2h22v-2l-2.1-1.5C20.2 7.3 16.5 4 12 4zm0 2c3.3 0 6.1 2.3 6.8 5.5H5.2C5.9 8.3 8.7 6 12 6z" />
      </svg>
    );
  }

  return (
    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
      <path d="M16 2l4 4-2 3-3-1.5V21H9V7.5L6 9 4 6l4-4h8zm-4 0c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2z" />
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-28 bg-neutral-100 border border-neutral-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat._id;
        return (
          <button
            key={cat._id}
            type="button"
            onClick={() => onSelectCategory(cat._id, cat.name)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center group cursor-pointer ${
              isSelected
                ? 'bg-magenta/5 border-magenta text-neutral-900 shadow-selected scale-[1.02]'
                : 'bg-white border-neutral-200 text-neutral-700 hover:border-black hover:text-black hover:bg-neutral-50'
            }`}
          >
            <div className={`mb-3 p-2.5 rounded-lg transition-colors ${isSelected ? 'bg-magenta text-white' : 'bg-neutral-100 text-neutral-600 group-hover:text-black group-hover:bg-neutral-200'}`}>
              <GarmentIcon name={cat.name} />
            </div>
            <span className="font-bold text-sm tracking-tight uppercase font-display">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};

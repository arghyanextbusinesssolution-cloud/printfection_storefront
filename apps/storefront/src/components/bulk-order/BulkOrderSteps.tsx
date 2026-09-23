import { useBulkOrderStore } from '../../store/bulkOrderStore';

export const STEPS = [
  { number: 1, label: 'Quantity' },
  { number: 2, label: 'Garment' },
  { number: 3, label: 'Product' },
  { number: 4, label: 'Colour' },
  { number: 5, label: 'Sizes' },
  { number: 6, label: 'Branding' },
  { number: 7, label: 'Review' },
  { number: 8, label: 'Checkout' },
];

export function BulkOrderSteps() {
  const step = useBulkOrderStore((s) => s.step);
  const garmentCategoryId = useBulkOrderStore((s) => s.garmentCategoryId);
  const productId = useBulkOrderStore((s) => s.productId);
  const setStep = useBulkOrderStore((s) => s.setStep);

  const totalQuantity = useBulkOrderStore((s) => s.getTotalQuantity());
  const selectedColours = useBulkOrderStore((s) => s.selectedColours);

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }

    if (targetStep >= 3 && !garmentCategoryId) return;
    if (targetStep >= 4 && !productId) return;
    if (targetStep >= 5 && selectedColours.length === 0) return;
    if (targetStep >= 6 && totalQuantity === 0) return;

    setStep(targetStep);
  };

  return (
    <nav aria-label="Quick order progress" className="mb-8 overflow-x-auto py-3 no-scrollbar">
      <ol className="flex items-center min-w-[850px] justify-between max-w-5xl mx-auto px-2">
        {STEPS.map((s, index) => {
          const isActive = step === s.number;
          const isDone = step > s.number;
          const isAccessible = s.number <= step || (s.number === 2 && true) || (s.number === 3 && !!garmentCategoryId) || (s.number === 4 && !!productId);

          return (
            <li key={s.number} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => handleStepClick(s.number)}
                disabled={!isAccessible}
                className={`flex flex-col items-center focus:outline-none transition-all cursor-pointer group ${
                  !isAccessible ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-100'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full font-mono text-xs font-bold flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-magenta text-white border-magenta shadow-selected scale-110 ring-4 ring-magenta/15'
                      : isDone
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-300 group-hover:border-neutral-500'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isDone ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.number
                  )}
                </div>
                <span
                  className={`mt-2 font-mono text-[10px] uppercase tracking-[0.1em] font-bold hidden sm:block ${
                    isActive ? 'text-magenta font-black' : isDone ? 'text-neutral-900' : 'text-neutral-400'
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2 transition-colors duration-300 ${
                    isDone ? 'bg-magenta' : 'bg-neutral-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import { useBulkOrderStore } from '../../store/bulkOrderStore';

const STEPS = [
  { number: 1, label: 'Category' },
  { number: 2, label: 'Product' },
  { number: 3, label: 'Colours' },
  { number: 4, label: 'Sizes' },
  { number: 5, label: 'Locations' },
  { number: 6, label: 'Print Colours' },
  { number: 7, label: 'Summary' },
];

export function BulkOrderSteps() {
  const step = useBulkOrderStore((s) => s.step);
  const garmentCategoryId = useBulkOrderStore((s) => s.garmentCategoryId);
  const productId = useBulkOrderStore((s) => s.productId);
  const setStep = useBulkOrderStore((s) => s.setStep);
  const showAlert = useBulkOrderStore((s) => s.showAlert);

  const totalQuantity = useBulkOrderStore((s) => s.getTotalQuantity());
  const selectedColours = useBulkOrderStore((s) => s.selectedColours);

  const handleStepClick = (targetStep: number) => {
    if (targetStep === 1) {
      setStep(1);
      return;
    }

    if (targetStep >= 2 && !garmentCategoryId) {
      showAlert("Please select a garment category to proceed.", "Category Required");
      return;
    }

    if (targetStep >= 3 && !productId) {
      showAlert("Please select a product template to proceed.", "Product Required");
      return;
    }

    if (targetStep >= 4 && selectedColours.length === 0) {
      showAlert("Please select at least one garment fabric colour to proceed.", "Colour Required");
      return;
    }

    if (targetStep >= 5 && totalQuantity < 25) {
      showAlert(`Minimum order quantity is 25 units. Your current total is ${totalQuantity} units. Please adjust your size quantities before continuing.`, "Minimum Quantity Required");
      return;
    }

    setStep(targetStep);
  };

  return (
    <nav aria-label="Bulk order progress" className="mb-10 overflow-x-auto py-2">
      <ol className="flex items-center min-w-[700px] justify-between max-w-4xl mx-auto">
        {STEPS.map((s, index) => {
          const isActive = step === s.number;
          const isDone = step > s.number;
          const isPlayable = s.number === 1 || (s.number === 2 && !!garmentCategoryId) || (s.number > 2 && !!productId);

          return (
            <li key={s.number} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => handleStepClick(s.number)}
                className={`flex flex-col items-center focus:outline-none transition-opacity cursor-pointer hover:opacity-80 ${
                  !isPlayable ? 'opacity-40' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full font-mono text-[13px] font-bold flex items-center justify-center border transition-all duration-300 ${
                    isActive
                      ? 'bg-magenta text-white border-magenta shadow-selected scale-105'
                      : isDone
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.number
                  )}
                </div>
                <span className={`mt-2 font-mono text-[10px] uppercase tracking-[0.1em] font-semibold hidden md:block ${
                  isActive ? 'text-magenta' : isDone ? 'text-black' : 'text-black/60'
                }`}>
                  {s.label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-3 transition-colors duration-300 ${
                  isDone ? 'bg-magenta' : 'bg-black'
                }`} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

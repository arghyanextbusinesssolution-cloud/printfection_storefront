import { useBulkOrderStore } from '../../store/bulkOrderStore';

const STEPS = [
  { number: 1, label: 'Product' },
  { number: 2, label: 'Colour' },
  { number: 3, label: 'Sizes' },
  { number: 4, label: 'Printing' },
  { number: 5, label: 'Design' },
  { number: 6, label: 'Summary' },
];

export function BulkOrderSteps() {
  const step = useBulkOrderStore((s) => s.step);

  return (
    <nav aria-label="Bulk order progress" className="mb-8 overflow-x-auto">
      <ol className="flex items-center min-w-[600px] justify-between max-w-3xl mx-auto">
        {STEPS.map((s, index) => (
          <li key={s.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  step >= s.number
                    ? 'bg-brand-dark text-white border-brand-dark'
                    : 'bg-white text-brand-gray border-gray-300'
                }`}
                aria-current={step === s.number ? 'step' : undefined}
              >
                {s.number}
              </div>
              <span className={`mt-1.5 text-xs font-medium hidden sm:block ${
                step >= s.number ? 'text-brand-dark' : 'text-brand-gray'
              }`}>
                {s.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1.5 ${
                step > s.number ? 'bg-brand-dark' : 'bg-gray-200'
              }`} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

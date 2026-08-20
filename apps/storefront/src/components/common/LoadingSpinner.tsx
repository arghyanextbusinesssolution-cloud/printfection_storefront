interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function LoadingSpinner({ size = 'md', label = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center py-12" role="status" aria-label={label}>
      <div
        className={`${sizeClasses[size]} border-2 border-gray-200 border-t-brand-dark rounded-full animate-spin`}
      />
      <span className="mt-3 text-sm text-brand-gray">{label}</span>
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4" role="alert">
      <p className="text-red-600 text-center mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline text-sm">
          Try Again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold text-brand-dark mb-2">{title}</h3>
      {description && <p className="text-brand-gray mb-6 max-w-md">{description}</p>}
      {action}
    </div>
  );
}

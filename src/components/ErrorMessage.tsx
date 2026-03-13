import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
      <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-700">Something went wrong</p>
        <p className="text-xs text-red-600 mt-0.5 break-words">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
        >
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

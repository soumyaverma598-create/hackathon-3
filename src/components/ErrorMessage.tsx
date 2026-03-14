import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`flex items-start gap-3 bg-gradient-to-b from-red-50 to-rose-50/80 border border-red-200 rounded-xl p-4 ${className}`}>
      <AlertTriangle className="text-red-600 w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wide font-extrabold text-red-500">Action Required</p>
        <p className="text-sm font-bold text-red-800 mt-0.5">Something went wrong</p>
        <p className="text-xs text-red-700 mt-1 break-words">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 transition-colors flex-shrink-0"
        >
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

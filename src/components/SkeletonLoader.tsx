export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-10 bg-gray-50 border-b border-gray-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50">
          <div className="h-3 w-32 bg-gray-200 rounded" />
          <div className="h-3 flex-1 bg-gray-100 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="h-20 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function SkeletonLoader({ variant = 'card' }: { variant?: 'card' | 'table' | 'detail' }) {
  if (variant === 'table') return <SkeletonTable />;
  if (variant === 'detail') return <SkeletonDetail />;
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

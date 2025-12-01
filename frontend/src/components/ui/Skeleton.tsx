/**
 * Skeleton loading component.
 */
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className = '', width, height, rounded = false }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`bg-slate-200 animate-pulse ${rounded ? 'rounded' : ''} ${className}`}
      style={style}
    />
  );
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={16} rounded className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}>
      <Skeleton height={24} width="60%" rounded className="mb-4" />
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <Skeleton height={24} width="200px" />
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-6 flex items-center space-x-4">
            <Skeleton height={40} width={40} rounded />
            <div className="flex-1 space-y-2">
              <Skeleton height={16} width="60%" />
              <Skeleton height={14} width="40%" />
            </div>
            <Skeleton height={32} width={100} />
          </div>
        ))}
      </div>
    </div>
  );
}


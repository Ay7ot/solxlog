export function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      {/* Transaction Info Skeleton */}
      <div className="card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-24" />
            </div>
          </div>
          <div className="skeleton h-8 w-24" />
        </div>
        
        <div className="grid grid-cols-4 gap-4 p-4 bg-[var(--bg-secondary)]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-3 w-12" />
              <div className="skeleton h-4 w-20" />
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-[var(--bg-secondary)]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-9 w-16" />
          ))}
        </div>
        <div className="skeleton h-9 w-24" />
      </div>

      {/* Log Entries Skeleton */}
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => {
          const depth = i % 3;
          return (
            <div 
              key={i} 
              className="card p-3 border-l-2 border-[var(--border-bright)]"
              style={{ marginLeft: `${depth * 20}px` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="skeleton h-5 w-16" />
                    <div className="skeleton h-4 w-32" />
                  </div>
                  <div className="skeleton h-4 w-3/4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call Hierarchy Skeleton */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-3 w-36" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 py-2" style={{ marginLeft: `${(i % 2) * 16}px` }}>
              <div className="skeleton h-3 w-3" />
              <div className="skeleton h-2 w-2" />
              <div className="skeleton h-4 w-36" />
              <div className="skeleton h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

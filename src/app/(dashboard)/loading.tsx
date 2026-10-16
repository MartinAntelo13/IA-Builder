import { SkeletonLine } from '@/components/shared/skeleton-line';

export default function DashboardLoading() {
  return (
    <div className="page-wrap">
      <section className="hero">
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-border animate-pulse" />
          <div className="h-8 w-56 rounded bg-border animate-pulse" />
          <div className="h-3 w-72 rounded bg-border animate-pulse" />
        </div>
        <div className="hero-actions">
          <div className="h-9 w-36 rounded-md bg-border animate-pulse" />
          <div className="h-9 w-36 rounded-md bg-border animate-pulse" />
        </div>
      </section>

      <section className="metric-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg shadow-sm p-5 animate-pulse space-y-2">
            <SkeletonLine w="w-12" h="h-7" />
            <SkeletonLine w="w-28" />
            <SkeletonLine w="w-20" />
          </div>
        ))}
      </section>

      <section>
        <div className="bg-card border border-border rounded-lg shadow-sm animate-pulse">
          <div className="px-6 py-5 border-b border-border">
            <SkeletonLine w="w-36" h="h-4" />
          </div>
          <div className="divide-y divide-border">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <SkeletonLine w="w-1/2" />
                  <SkeletonLine w="w-3/4" h="h-2.5" />
                </div>
                <SkeletonLine w="w-24" h="h-4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

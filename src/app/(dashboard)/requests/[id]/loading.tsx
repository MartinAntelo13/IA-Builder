import { SkeletonLine } from '@/components/shared/skeleton-line';

export default function RequestDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-10 pt-6 pb-16 max-md:px-4 max-md:pt-5 max-md:pb-12">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-3 w-32 rounded bg-border animate-pulse" />
        <div className="h-3 w-2 rounded bg-border animate-pulse" />
        <div className="h-3 w-20 rounded bg-border animate-pulse" />
      </div>

      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="flex-1 space-y-2">
          <div className="h-7 w-2/3 rounded bg-border animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-border animate-pulse" />
        </div>
        <div className="h-6 w-20 rounded bg-border animate-pulse shrink-0" />
      </div>

      <section className="flex flex-col lg:flex-row gap-5 items-start w-full">
        <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg shadow-sm px-6 py-5 animate-pulse">
            <div className="pb-4 mb-4 border-b border-border">
              <SkeletonLine w="w-44" h="h-4" />
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-12 max-md:grid-cols-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <SkeletonLine w="w-20" h="h-2.5" />
                  <SkeletonLine w="w-32" />
                  <SkeletonLine w="w-24" h="h-2.5" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg shadow-sm px-6 py-5 animate-pulse">
            <div className="pb-4 mb-4 border-b border-border">
              <SkeletonLine w="w-24" h="h-4" />
            </div>
            <div className="space-y-2">
              <SkeletonLine />
              <SkeletonLine w="w-5/6" />
              <SkeletonLine w="w-2/3" />
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
          <div className="bg-card border border-border rounded-lg shadow-sm px-6 py-5 animate-pulse">
            <div className="pb-4 mb-4 border-b border-border">
              <SkeletonLine w="w-40" h="h-4" />
            </div>
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-border shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonLine w="w-24" />
                    <SkeletonLine w="w-32" h="h-2.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg shadow-sm px-6 py-5 animate-pulse">
            <div className="pb-4 mb-4 border-b border-border">
              <SkeletonLine w="w-32" h="h-4" />
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-md bg-border shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonLine w="w-24" />
                    <SkeletonLine w="w-36" h="h-2.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

const CARD = 'bg-white border border-border rounded-lg shadow-sm p-5 animate-pulse';

function SkeletonLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-border`} />;
}

export default function TeamLoading() {
  return (
    <div className="max-w-6xl mx-auto px-10 pt-6 pb-16 max-md:px-4 max-md:pt-5 max-md:pb-12">
      <div className="mb-6 space-y-2">
        <div className="h-3 w-40 rounded bg-border animate-pulse" />
        <div className="h-7 w-24 rounded bg-border animate-pulse" />
        <div className="h-3 w-64 rounded bg-border animate-pulse" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={CARD}>
            <SkeletonLine w="w-12" h="h-7" />
            <SkeletonLine w="w-28" h="h-3" />
            <SkeletonLine w="w-20" h="h-3" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm animate-pulse">
        <div className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-border" />
            <div className="h-3 w-36 rounded bg-border" />
          </div>
          <div className="h-8 w-64 rounded bg-border" />
        </div>
        <div className="border-t border-border divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-6">
              <div className="w-9 h-9 rounded-full bg-border shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonLine w="w-40" />
                <SkeletonLine w="w-56" h="h-2.5" />
              </div>
              <SkeletonLine w="w-32" h="h-4" />
              <SkeletonLine w="w-24" h="h-4" />
              <SkeletonLine w="w-28" h="h-4" />
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-border">
          <SkeletonLine w="w-48" h="h-4" />
        </div>
      </div>
    </div>
  );
}

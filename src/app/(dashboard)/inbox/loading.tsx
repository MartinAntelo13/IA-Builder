const CARD = 'bg-white border border-border rounded-lg shadow-sm p-5 animate-pulse';

function SkeletonLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-border`} />;
}

export default function InboxLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 max-md:px-3 max-md:py-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-border animate-pulse shrink-0" />
        <div className="h-6 w-48 rounded bg-border animate-pulse" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6 max-md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={CARD}>
            <SkeletonLine w="w-10" h="h-6" />
            <SkeletonLine w="w-28" h="h-3" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm animate-pulse">
        <div className="flex gap-6 px-4 pt-4 pb-0 border-b border-border">
          <div className="h-4 w-24 rounded bg-border mb-3" />
          <div className="h-4 w-24 rounded bg-border mb-3" />
        </div>
        <div className="px-4 py-3 flex gap-3">
          <div className="h-8 flex-1 rounded bg-border" />
          <div className="h-8 w-36 rounded bg-border" />
        </div>
        <div className="divide-y divide-border">
          {[0, 1, 2].map((i) => (
            <div key={i} className="px-4 py-4 flex gap-3">
              <div className="w-9 h-9 rounded-md bg-border shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonLine w="w-1/2" />
                <SkeletonLine w="w-3/4" h="h-2.5" />
                <SkeletonLine w="w-40" h="h-2.5" />
              </div>
              <div className="w-20 flex flex-col items-end gap-2">
                <SkeletonLine w="w-16" h="h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

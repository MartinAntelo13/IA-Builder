const CARD = 'bg-white border border-border rounded-lg shadow-sm p-5 animate-pulse';

function SkeletonLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-border`} />;
}

export default function WorkflowsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-10 pt-6 pb-16 max-md:px-4 max-md:pt-5 max-md:pb-12">
      <div className="mb-6">
        <div className="h-2.5 w-48 rounded bg-border animate-pulse mb-2" />
        <div className="h-7 w-36 rounded bg-border animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        <div className="w-full lg:w-72 shrink-0 bg-white border border-border rounded-lg shadow-sm animate-pulse">
          <div className="px-4 py-4 border-b border-border flex items-center justify-between">
            <SkeletonLine w="w-36" h="h-4" />
            <div className="w-5 h-5 rounded-full bg-border" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="px-4 py-4 border-b border-border last:border-b-0 flex gap-3">
              <div className="w-8 h-8 rounded-md bg-border shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonLine w="w-3/4" />
                <SkeletonLine w="w-full" h="h-2.5" />
                <SkeletonLine w="w-2/3" h="h-2.5" />
              </div>
            </div>
          ))}
        </div>

        <div className={`w-full lg:flex-1 min-w-0 ${CARD}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <SkeletonLine w="w-32" h="h-2.5" />
              <SkeletonLine w="w-48" h="h-6" />
              <SkeletonLine w="w-64" h="h-2.5" />
            </div>
            <div className="flex gap-2">
              <div className="w-20 h-7 rounded-md bg-border" />
              <div className="w-20 h-7 rounded-md bg-border" />
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-border space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3 p-3 bg-surface border border-border rounded-lg">
                <div className="w-6 h-6 rounded-full bg-border shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine w="w-1/2" />
                  <SkeletonLine w="w-24" h="h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

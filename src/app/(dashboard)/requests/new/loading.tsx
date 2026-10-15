function SkeletonLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-border`} />;
}

export default function NewRequestLoading() {
  return (
    <div className="request-page-wrap">
      <div className="request-breadcrumb animate-pulse">
        <div className="h-3 w-24 rounded bg-border" />
        <div className="h-3 w-3 rounded bg-border" />
        <div className="h-3 w-28 rounded bg-border" />
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm p-6 animate-pulse">
        <div className="pb-4 mb-6 border-b border-border">
          <SkeletonLine w="w-40" h="h-5" />
        </div>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <SkeletonLine w="w-24" />
              <div className="h-10 rounded-md bg-border" />
            </div>
          ))}
          <div className="col-span-2 space-y-2 max-md:col-span-1">
            <SkeletonLine w="w-24" />
            <div className="h-24 rounded-md bg-border" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <div className="h-9 w-24 rounded-md bg-border" />
          <div className="h-9 w-32 rounded-md bg-border" />
        </div>
      </div>
    </div>
  );
}

// Esqueleto de /settings: header + sidebar de tabs + card de contenido.
function Line({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-border`} />;
}

export default function SettingsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-10 pt-6 pb-16 max-md:px-4 max-md:pt-5 max-md:pb-12 animate-pulse">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <Line w="w-40" h="h-3" />
          <Line w="w-52" h="h-7" />
          <Line w="w-80" h="h-3" />
        </div>
        <div className="h-9 w-36 rounded-md bg-border" />
      </div>

      <div className="flex gap-5 max-md:flex-col">
        <aside className="w-56 shrink-0 bg-white border border-border rounded-lg shadow-sm p-3 space-y-2 max-md:w-full">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-9 rounded-md bg-border" />
          ))}
        </aside>
        <section className="flex-1 min-w-0 bg-white border border-border rounded-lg shadow-sm p-6 space-y-4">
          <Line w="w-48" h="h-5" />
          <Line w="w-72" h="h-3" />
          <div className="h-px bg-border my-4" />
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div className="space-y-2">
              <Line w="w-24" />
              <div className="h-9 rounded-md bg-border" />
            </div>
            <div className="space-y-2">
              <Line w="w-24" />
              <div className="h-9 rounded-md bg-border" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

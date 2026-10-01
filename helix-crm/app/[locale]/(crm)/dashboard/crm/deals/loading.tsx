/**
 * The Deals screen's shape while it loads: title and action, the figures line, and
 * six stage columns. A loading file gets no route params, so it says nothing in a
 * language it can't know. See DESIGN.md §8 Empty state, loading, gate.
 */
export default function Loading() {
  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16" role="status" aria-busy="true">
      <span className="sr-only">טוענים… Loading…</span>
      <div className="flex items-center justify-between gap-3" aria-hidden="true">
        <div className="h-7 w-28 bg-surface border border-border rounded-xl animate-pulse" />
        <div className="h-11 w-32 bg-surface border border-border rounded-[10px] animate-pulse" />
      </div>
      <div className="h-4 w-64 max-w-full mt-4 bg-surface border border-border rounded-xl animate-pulse" aria-hidden="true" />
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-40 bg-surface border border-border rounded-xl animate-pulse" />)}
      </div>
    </div>
  );
}

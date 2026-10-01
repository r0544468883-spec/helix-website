/**
 * The Companies screen's shape while it loads: title and action, the filter field,
 * and company rows. A loading file gets no route params, so it says nothing in a
 * language it can't know. See DESIGN.md §8 Empty state, loading, gate.
 */
export default function Loading() {
  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16" role="status" aria-busy="true">
      <span className="sr-only">טוענים… Loading…</span>
      <div className="flex items-center justify-between gap-3" aria-hidden="true">
        <div className="h-7 w-24 bg-surface border border-border rounded-xl animate-pulse" />
        <div className="h-11 w-32 bg-surface border border-border rounded-[10px] animate-pulse" />
      </div>
      <div className="h-11 mt-6 mb-3 bg-surface border border-border rounded-[10px] animate-pulse" aria-hidden="true" />
      <div className="flex flex-col gap-2" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-surface border border-border rounded-xl animate-pulse" />)}
      </div>
    </div>
  );
}

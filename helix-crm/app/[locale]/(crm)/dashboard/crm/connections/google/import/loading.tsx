/**
 * Google can take a few seconds to list the contacts. A loading file gets no route
 * params, so this shows the list's shape rather than words in the wrong language.
 */
export default function Loading() {
  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-16" role="status" aria-busy="true">
      <span className="sr-only">טוענים… Loading…</span>
      <div className="h-9 w-2/3 bg-surface border border-border rounded-xl animate-pulse" aria-hidden="true" />
      <div className="mt-6 flex flex-col gap-2" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-surface border border-border rounded-xl animate-pulse" />)}
      </div>
    </div>
  );
}

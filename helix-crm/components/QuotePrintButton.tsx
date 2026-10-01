'use client';

/** "שמירה כ-PDF": the browser's print, which the page's print rules turn into an A4 quote. */
export default function QuotePrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 rounded-[10px] text-[14px] min-h-[44px] transition-colors"
    >
      {label}
    </button>
  );
}

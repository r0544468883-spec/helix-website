'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Dict } from '@/lib/i18n/he';
import type { ImportRow } from '@/lib/crm-google-map';
import { crmImportGoogleContacts } from '@/app/crm-actions';
import { withTimeout } from '@/lib/use-status-change';

const IMPORT_MAX = 500;

/**
 * The Google import picker: search, a checkbox per importable contact, "select the
 * shown", and one import button with the count. Anyone already in the CRM is listed
 * as "כבר ב-CRM" with no checkbox. After an import the page refreshes, so the
 * imported people turn "כבר ב-CRM" too. See DESIGN.md §8 — Google import list.
 */
export default function CrmGoogleImport({
  locale,
  rows,
  truncated,
  t,
}: {
  locale: string;
  rows: ImportRow[];
  truncated: boolean;
  t: Dict['crm'];
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [line, setLine] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);

  const known = rows.filter((r) => r.known).length;
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.phone, r.company].some((v) => (v ?? '').toLowerCase().includes(needle)),
    );
  }, [rows, q]);

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function selectShown() {
    setPicked((prev) => {
      const next = new Set(prev);
      for (const r of shown) if (!r.known) next.add(r.resourceName);
      return next;
    });
  }

  function importPicked() {
    if (picked.size === 0) { setLine({ kind: 'err', text: t.gImpNothing }); return; }
    if (picked.size > IMPORT_MAX) { setLine({ kind: 'err', text: t.gImpTooMany }); return; }
    // One import at a time: a double press must not create anyone twice.
    if (inFlight.current) return;
    inFlight.current = true;
    setLine(null);
    startTransition(async () => {
      try {
        const res = await withTimeout(crmImportGoogleContacts({ locale, resourceNames: [...picked] }), 30_000);
        if (res && 'error' in res && res.error === 'timeout') { setLine({ kind: 'err', text: t.gImpTimeout }); return; }
        if (res && 'ok' in res && res.ok) {
          const done = t.gImpDone.replace('{n}', String(res.created));
          setLine({ kind: 'ok', text: res.skipped > 0 ? `${done} ${t.gImpSkipped.replace('{m}', String(res.skipped))}` : done });
          setPicked(new Set());
          router.refresh();
          return;
        }
        const msg = res && 'message' in res && typeof res.message === 'string' ? res.message : t.gImpFailed;
        setLine({ kind: 'err', text: msg });
      } finally {
        inFlight.current = false;
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-secondary text-[13px]">
        {t.gImpCounts.replace('{total}', String(rows.length)).replace('{known}', String(known))}
        {truncated && <> · {t.gImpTruncated}</>}
      </p>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.gImpSearch}
        aria-label={t.gImpSearch}
        className="w-full bg-bg border border-border rounded-[10px] px-3 py-2 text-[15px] outline-none focus:border-brand min-h-[44px]"
      />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={selectShown} className="inline-flex items-center border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px]">
          {t.gImpSelectVisible}
        </button>
        {picked.size > 0 && (
          <button type="button" onClick={() => setPicked(new Set())} className="text-ink-secondary hover:text-ink text-[13px] px-3 min-h-[44px]">
            {t.gImpClear}
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-1.5">
        {shown.map((r) => (
          <li key={r.resourceName}>
            {r.known ? (
              <div className="flex items-center gap-3 bg-bg border border-border rounded-xl px-3 py-2 min-h-[44px] opacity-70">
                <span className="w-5 shrink-0" aria-hidden="true" />
                <Person r={r} />
                <span className="text-[12px] text-ink-muted shrink-0">{t.gImpKnown}</span>
              </div>
            ) : (
              <label className="flex items-center gap-3 bg-surface border border-border hover:border-brand rounded-xl px-3 py-2 min-h-[44px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={picked.has(r.resourceName)}
                  onChange={() => toggle(r.resourceName)}
                  className="w-5 h-5 shrink-0 accent-[var(--color-brand)]"
                />
                <Person r={r} />
              </label>
            )}
          </li>
        ))}
      </ul>

      {/* The import button stays reachable at the bottom of the screen while scrolling. */}
      <div className="sticky bottom-0 bg-bg/95 backdrop-blur border-t border-border -mx-5 md:-mx-10 px-5 md:px-10 py-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={importPicked}
          disabled={isPending || picked.size === 0}
          className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-semibold px-5 rounded-[10px] text-[14px] min-h-[44px]"
        >
          {t.gImpButton.replace('{n}', String(picked.size))}
        </button>
        {line && (
          <p role={line.kind === 'err' ? 'alert' : 'status'} className={`text-[13px] ${line.kind === 'err' ? 'text-danger' : 'text-ink-secondary'}`}>
            {line.text}
          </p>
        )}
      </div>
    </div>
  );
}

function Person({ r }: { r: ImportRow }) {
  return (
    <span className="flex-1 min-w-0">
      <span className="block text-[14px] font-semibold truncate" dir="auto">
        {r.name}
        {r.company && <span className="font-normal text-ink-muted"> · <span dir="auto">{r.company}</span></span>}
      </span>
      {(r.email || r.phone) && (
        <span className="block text-[12px] text-ink-secondary truncate" dir="ltr">
          {[r.email, r.phone].filter(Boolean).join(' · ')}
        </span>
      )}
    </span>
  );
}

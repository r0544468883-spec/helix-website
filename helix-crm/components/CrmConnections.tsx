'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Dict } from '@/lib/i18n/he';
import { crmCreateMakeKey, crmDisconnectGoogle } from '@/app/crm-actions';
import { withTimeout } from '@/lib/use-status-change';
import { Dialog } from '@/lib/motion/Dialog';

export type GoogleState =
  | { kind: 'none' }
  | { kind: 'connected'; email: string; since: string }
  | { kind: 'lapsed'; email: string };

type Message = 'connected' | 'failed' | 'denied' | 'admin' | 'partial';

const card = 'bg-surface border border-border rounded-2xl p-5';
const codeBox = 'block text-[13px] font-mono text-ink bg-bg border border-border rounded-lg px-3 py-2 overflow-x-auto whitespace-pre';
const secondary = 'inline-flex items-center justify-center border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 rounded-[10px] text-[14px] min-h-[44px] transition-colors disabled:opacity-50';
const primary = 'inline-flex items-center justify-center bg-brand hover:bg-brand-hover text-on-brand font-semibold px-5 rounded-[10px] text-[14px] min-h-[44px] disabled:opacity-50';
const quiet = 'text-ink-muted hover:text-danger text-[14px] min-h-[44px] px-2 disabled:opacity-50';
const GOOGLE_PERMISSIONS = 'https://myaccount.google.com/permissions';

const FIELDS = `{
  "full_name": "…",
  "email": "…",
  "phone": "…",
  "notes": "…",
  "source": "facebook_lead_ads",
  "match": "email_or_phone"
}`;

/** A code box with a copy control; a refused clipboard selects the text instead. */
function CopyBox({ text, label, t }: { text: string; label: string; t: Dict['crm'] }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLElement>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = ref.current;
      if (el) window.getSelection()?.selectAllChildren(el);
    }
  }
  return (
    <div>
      <div className="text-[12px] text-ink-muted mb-1">{label}</div>
      <div className="flex items-start gap-2">
        <code ref={ref} className={`flex-1 min-w-0 ${codeBox}`} dir="ltr">{text}</code>
        <button type="button" onClick={copy} className={`shrink-0 ${secondary}`}>{copied ? t.copied : t.copy}</button>
      </div>
    </div>
  );
}

/**
 * The two sections of the Connections screen. Google: its state and, for an admin,
 * connect / reconnect / disconnect; anyone who can write imports contacts. Facebook
 * leads through Make: the steps, the address and fields, the scenario file and, for
 * an admin, the Make key, shown once. See DESIGN.md §8 — Connections screen.
 */
export default function CrmConnections({
  locale,
  isAdmin,
  canWrite,
  google,
  googleConfigured,
  message,
  makeKeyPrefix,
  apiUrl,
  t,
}: {
  locale: string;
  isAdmin: boolean;
  canWrite: boolean;
  google: GoogleState;
  googleConfigured: boolean;
  message: Message | null;
  makeKeyPrefix: string | null;
  apiUrl: string;
  t: Dict['crm'];
}) {
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [keyErr, setKeyErr] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  // After a disconnect: done (and whether Google confirmed the revoke), or why not.
  const [after, setAfter] = useState<{ revoked: boolean } | { err: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);

  const note: { text: string; err: boolean } | null =
    message === 'connected' ? { text: t.gMsgConnected, err: false }
    : message === 'failed' ? { text: t.gMsgFailed, err: true }
    : message === 'denied' ? { text: t.gMsgDenied, err: true }
    : message === 'admin' ? { text: t.gMsgAdminOnly, err: true }
    : message === 'partial' ? { text: t.gMsgPartial, err: true }
    : null;

  function disconnect() {
    setAsking(false);
    if (inFlight.current) return;
    inFlight.current = true;
    setAfter(null);
    startTransition(async () => {
      try {
        const res = await withTimeout(crmDisconnectGoogle({ locale }));
        if (res && 'ok' in res && res.ok) setAfter({ revoked: res.revoked });
        else setAfter({ err: res && 'message' in res && typeof res.message === 'string' ? res.message : t.gDisconnectFailed });
      } finally {
        inFlight.current = false;
      }
    });
  }

  function createKey() {
    if (inFlight.current) return;
    inFlight.current = true;
    setKeyErr(null);
    startTransition(async () => {
      try {
        const res = await withTimeout(crmCreateMakeKey({ locale }));
        if (res && 'ok' in res && res.ok && 'key' in res && typeof res.key === 'string') setFreshKey(res.key);
        else setKeyErr(t.mkKeyFailed);
      } finally {
        inFlight.current = false;
      }
    });
  }

  const connectHref = `/api/connections/google/start?locale=${locale}`;

  return (
    <div className="flex flex-col gap-8">
      {after && 'revoked' in after && (
        <p role="status" className="text-[13px] bg-surface border border-border rounded-xl px-4 py-3 text-ink-secondary">
          {after.revoked ? t.gMsgDisconnected : (
            <>{t.gMsgNotRevoked}<a href={GOOGLE_PERMISSIONS} target="_blank" rel="noopener noreferrer" className="text-brand-ink underline">{t.gPermissionsLink}</a>.</>
          )}
        </p>
      )}
      {after && 'err' in after && <p role="alert" className="text-[13px] text-danger">{after.err}</p>}

      {note && !after && (
        <p role={note.err ? 'alert' : 'status'} className={`text-[13px] bg-surface border border-border rounded-xl px-4 py-3 ${note.err ? 'text-danger' : 'text-ink-secondary'}`}>
          {note.text}
        </p>
      )}

      {/* Google */}
      <section aria-labelledby="conn-google" className={card}>
        <h2 id="conn-google" className="font-bold text-[16px]">{t.gTitle}</h2>
        <p className="text-ink-secondary text-[14px] mt-1 mb-4">{t.gSub}</p>

        {!googleConfigured ? (
          <p className="text-ink-muted text-[13px]">{isAdmin ? t.gNotConfiguredAdmin : t.gNotConfigured}</p>
        ) : (
          <>
            <p className="text-[14px]">
              {google.kind === 'none' && <span className="text-ink-secondary">{t.gNotConnected}</span>}
              {google.kind === 'connected' && (
                <>
                  <span className="font-semibold">{t.gConnected.split('{email}')[0]}</span>
                  <span dir="ltr" className="font-semibold">{google.email}</span>
                  <span className="text-ink-muted"> · {t.gSince.replace('{date}', google.since)}</span>
                </>
              )}
              {google.kind === 'lapsed' && (
                <>
                  <span className="font-semibold text-danger">{t.gLapsed}</span>
                  <span className="text-ink-muted"> · </span>
                  <span dir="ltr" className="text-ink-muted">{google.email}</span>
                </>
              )}
            </p>
            {google.kind === 'lapsed' && isAdmin && <p className="text-ink-muted text-[12px] mt-1">{t.gLapsedHint}</p>}

            <div className="flex flex-wrap gap-2 mt-4">
              {isAdmin && google.kind === 'none' && <a href={connectHref} className={primary}>{t.gConnect}</a>}
              {isAdmin && google.kind === 'lapsed' && <a href={connectHref} className={primary}>{t.gReconnect}</a>}
              {canWrite && google.kind === 'connected' && (
                <Link href={`/${locale}/dashboard/crm/connections/google/import`} className={secondary}>{t.gImport}</Link>
              )}
              {isAdmin && google.kind !== 'none' && (
                <button type="button" onClick={() => setAsking(true)} disabled={isPending} className={`ms-auto ${quiet}`}>{t.gDisconnect}</button>
              )}
            </div>
            {!isAdmin && <p className="text-ink-muted text-[12px] mt-3">{t.gAdminOnlyNote}</p>}
          </>
        )}
      </section>

      {/* Disconnecting asks first: meetings stop showing, imported contacts stay. */}
      <Dialog open={asking} onClose={() => setAsking(false)} width={420}>
        <div className="text-ink">
          <p className="font-bold text-[16px] mb-2">{t.gDisconnectAsk}</p>
          <p className="text-ink-secondary text-[14px] mb-4">{t.gDisconnectBody}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={disconnect} className="bg-danger hover:bg-danger/90 text-on-danger font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]">
              {t.gDisconnectYes}
            </button>
            <button type="button" onClick={() => setAsking(false)} className="border border-border text-ink-secondary hover:text-ink px-5 py-2.5 rounded-[10px] min-h-[44px]">
              {t.promptDismiss}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Facebook leads through Make */}
      <section aria-labelledby="conn-make" className={card}>
        <h2 id="conn-make" className="font-bold text-[16px]">{t.mkTitle}</h2>
        <p className="text-ink-secondary text-[14px] mt-1 mb-4">{t.mkIntro}</p>

        <ol className="list-decimal ps-5 flex flex-col gap-1.5 text-[14px] text-ink mb-4">
          <li>{t.mkStep1}</li>
          <li>{t.mkStep2}</li>
          <li>{t.mkStep3}</li>
          <li>{t.mkStep4}</li>
          <li>{t.mkStep5}</li>
        </ol>
        <p className="text-ink-muted text-[12px] mb-4">{t.mkMoreQuestions}</p>

        <div className="flex flex-col gap-4">
          <a href="/integrations/make-facebook-lead-ads.json" download className={`self-start ${secondary}`}>{t.mkDownload}</a>
          <CopyBox text={apiUrl} label={t.mkAddress} t={t} />
          <CopyBox text={FIELDS} label={t.mkFields} t={t} />

          {isAdmin ? (
            <div>
              {makeKeyPrefix && !freshKey && (
                <p className="text-[13px] text-ink-secondary mb-2">
                  {t.mkKeyExisting.split('{prefix}')[0]}<span dir="ltr" className="font-mono">{makeKeyPrefix}</span>{t.mkKeyExisting.split('{prefix}')[1] ?? ''}
                </p>
              )}
              {freshKey ? (
                <div className="border-2 border-brand/60 bg-brand/5 rounded-2xl p-4">
                  <p className="text-[13px] text-ink-secondary mb-2">{t.mkKeyOnce}</p>
                  <CopyBox text={freshKey} label={t.mkCreateKey} t={t} />
                </div>
              ) : (
                <button type="button" onClick={createKey} disabled={isPending} className={primary}>{t.mkCreateKey}</button>
              )}
              {keyErr && <p role="alert" className="text-danger text-[13px] mt-2">{keyErr}</p>}
            </div>
          ) : (
            <p className="text-ink-muted text-[12px]">{t.mkKeyAdminOnly}</p>
          )}
        </div>
      </section>
    </div>
  );
}

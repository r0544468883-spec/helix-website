'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

// Track A — HELIX self-growth share-to-earn widget for the marketing site.
// A visitor enters their email, gets a personal share link + QR, and a progress
// bar to the discount reward. Self-contained inline styles (emerald accent) so it
// drops onto any page without depending on the site's CSS classes.

interface ReferrerState {
  email: string;
  refCode: string;
  points: number;
  referralsConfirmed: number;
  couponCode: string | null;
  discountPercent: number;
}

const ACCENT = '#10b981';
const THRESHOLD = 3;

export default function ReferralWidget({ siteUrl }: { siteUrl?: string }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState<ReferrerState | null>(null);
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);

  const origin = siteUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://www.helix.co.il');
  const inviteLink = state ? `${origin}/invite/${state.refCode}` : '';
  const awardedRef = useRef(false);

  useEffect(() => {
    if (!inviteLink) return;
    const withCh = `${inviteLink}?ch=qr`;
    QRCode.toDataURL(withCh, { width: 512, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [inviteLink]);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email }),
      });
      const data = await res.json();
      if (data.ok && data.referrer) setState(data.referrer);
      else setError('לא הצלחנו כרגע, נסו שוב עוד רגע.');
    } catch {
      setError('לא הצלחנו כרגע, נסו שוב עוד רגע.');
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = `גיליתי את HELIX, סוכני AI שמריצים שיווק ותפעול לעסק. שווה לבדוק:\n${inviteLink}?ch=whatsapp`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  function shareLinkedIn() {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink + '?ch=linkedin')}`, '_blank');
  }

  function downloadQR() {
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr;
    a.download = `helix-invite-${state?.refCode || 'qr'}.png`;
    a.click();
  }

  const box: React.CSSProperties = {
    maxWidth: 460,
    margin: '0 auto',
    padding: 24,
    borderRadius: 16,
    background: 'rgba(16,185,129,0.06)',
    border: `1px solid ${ACCENT}33`,
    color: '#e5e7eb',
    fontFamily: 'inherit',
    direction: 'rtl',
    textAlign: 'right',
  };
  const btn: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: 10,
    border: `1px solid ${ACCENT}55`,
    background: 'transparent',
    color: ACCENT,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  };

  // Pre-registration: capture email.
  if (!state) {
    return (
      <div style={box}>
        <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
          שתפו את HELIX, קבלו הנחה
        </h3>
        <p style={{ fontSize: 14, opacity: 0.8, margin: '0 0 16px' }}>
          כל {THRESHOLD} חברים שמצטרפים דרך הלינק שלכם = קוד הנחה אוטומטי על מוצר בתשלום.
        </p>
        <form onSubmit={register} style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="האימייל שלכם"
            aria-label="כתובת אימייל"
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #ffffff22',
              background: '#0f172a',
              color: '#fff',
              fontSize: 14,
            }}
          />
          <button type="submit" disabled={busy} style={{ ...btn, background: ACCENT, color: '#04150e', opacity: busy ? 0.6 : 1 }}>
            {busy ? '...' : 'קבלו לינק'}
          </button>
        </form>
        {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 10 }}>{error}</p>}
      </div>
    );
  }

  // Post-registration dashboard.
  const remaining = Math.max(0, THRESHOLD - state.referralsConfirmed);
  const pct = Math.min(100, (state.referralsConfirmed / THRESHOLD) * 100);

  return (
    <div style={box}>
      {state.couponCode ? (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 28 }}>🎉</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0', color: '#fff' }}>
            הרווחתם {state.discountPercent}% הנחה!
          </h3>
          <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 8px' }}>הזינו את הקוד בצ׳ק-אאוט:</p>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: 10,
              border: `1px dashed ${ACCENT}`,
              color: ACCENT,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            {state.couponCode}
          </div>
        </div>
      ) : (
        <>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>
            עוד {remaining} {remaining === 1 ? 'חבר' : 'חברים'} עד ההנחה
          </h3>
          <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 10px' }}>
            {state.referralsConfirmed}/{THRESHOLD} הצטרפו · {state.points} נקודות
          </p>
          <div style={{ height: 8, background: '#ffffff14', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: ACCENT, borderRadius: 99, transition: 'width .4s' }} />
          </div>
        </>
      )}

      {/* Share link */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          readOnly
          value={inviteLink}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: 10,
            border: '1px solid #ffffff22',
            background: '#0f172a',
            color: '#9ca3af',
            fontSize: 12,
            fontFamily: 'monospace',
            direction: 'ltr',
            textAlign: 'left',
          }}
        />
        <button onClick={copyLink} style={btn}>{copied ? '✓' : 'העתק'}</button>
      </div>

      {/* Share buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={shareWhatsApp} style={{ ...btn, flex: 1 }}>📱 WhatsApp</button>
        <button onClick={shareLinkedIn} style={{ ...btn, flex: 1 }}>💼 LinkedIn</button>
      </div>

      {/* QR — offline bridge */}
      {qr && (
        <div style={{ textAlign: 'center' }}>
          <img
            src={qr}
            alt="קוד QR להזמנה ל-HELIX"
            width={150}
            height={150}
            style={{ width: 150, height: 150, borderRadius: 12, background: '#fff', padding: 8 }}
          />
          <div>
            <button onClick={downloadQR} style={{ ...btn, marginTop: 10, fontSize: 13 }}>הורדת QR</button>
          </div>
        </div>
      )}
    </div>
  );
}

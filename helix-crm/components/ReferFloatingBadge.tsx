'use client';

import { useEffect, useState } from 'react';

// Small floating, dismissible "refer & earn" pill. Links to the HELIX share-to-earn
// hub on the marketing site (/refer). Mirrors the component on the marketing site so
// the loop is reachable from every HELIX app. Remembers dismissal for 14 days.

const DISMISS_KEY = 'helix_refer_badge_dismissed_at';
const DISMISS_DAYS = 14;
const ACCENT = '#10b981';
const REFER_URL = 'https://www.helix.co.il/refer';

export default function ReferFloatingBadge({ href = REFER_URL }: { href?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const at = localStorage.getItem(DISMISS_KEY);
      if (at) {
        const days = (Date.now() - Number(at)) / 86_400_000;
        if (days < DISMISS_DAYS) return;
      }
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <a
      href={href}
      aria-label="שתפו את HELIX וקבלו הנחה"
      style={{
        position: 'fixed',
        bottom: 92,
        insetInlineEnd: 24,
        zIndex: 998,
        maxWidth: 'calc(100vw - 48px)',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 12px 9px 14px',
        borderRadius: 999,
        background: 'rgba(10,31,22,0.92)',
        border: `1px solid ${ACCENT}66`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        color: '#e8fff5',
        textDecoration: 'none',
        fontSize: 13.5,
        fontWeight: 600,
        backdropFilter: 'blur(6px)',
        animation: 'helixReferIn .35s ease-out',
        direction: 'rtl',
      }}
    >
      <style>{`@keyframes helixReferIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
      <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>💚</span>
      <span>שתפו את HELIX, קבלו הנחה</span>
      <button
        onClick={dismiss}
        aria-label="סגירה"
        style={{
          marginInlineStart: 4,
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.1)',
          color: '#e8fff5',
          cursor: 'pointer',
          fontSize: 13,
          lineHeight: '20px',
          padding: 0,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </a>
  );
}

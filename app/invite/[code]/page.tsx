import type { Metadata } from 'next';
import InviteClient from './InviteClient';

// A friend shared HELIX with you. Marketing-site landing that pitches HELIX and
// captures the referred visitor — their join credits the referrer's share-to-earn loop.
//
// Static export note: this route is dynamic per share-code, but codes cannot be
// enumerated at build time. We emit a single template page and a Firebase
// rewrite (/invite/** -> this page) serves every code; InviteClient reads the
// real code + channel from the URL client-side. Backend tracking is best-effort
// and only fires where /api is available (it is stripped from the static build).

export const metadata: Metadata = {
  title: 'הצטרפו ל-HELIX',
  description: 'סוכני AI שמריצים שיווק ותפעול לעסק. חבר המליץ לכם, הצטרפו ותהנו.',
  robots: { index: false, follow: false },
};

// Required for `output: export` on a dynamic route. One template; the Firebase
// rewrite maps all /invite/<code> paths to it.
export function generateStaticParams() {
  return [{ code: 'join' }];
}

const ACCENT = '#10b981';

export default function InvitePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(180deg,#04150e 0%,#0a1f16 100%)',
        direction: 'rtl',
      }}
    >
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', color: '#e5e7eb' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💚</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
          חבר המליץ לכם על HELIX
        </h1>
        <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 24px', lineHeight: 1.6 }}>
          צוות סוכני AI שמריצים לכם שיווק, תפעול ומכירות. השאירו אימייל ונראה לכם איך זה עובד
          על העסק שלכם.
        </p>

        <div
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <InviteClient />
        </div>

        <p style={{ fontSize: 13, opacity: 0.6 }}>
          חינם להתחיל · בלי כרטיס אשראי
        </p>
      </div>
    </main>
  );
}

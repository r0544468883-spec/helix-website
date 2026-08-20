import type { Metadata } from 'next';
import InviteClient from './InviteClient';

// A friend shared HELIX with you. Marketing-site landing that pitches HELIX and
// captures the referred visitor — their join credits the referrer's share-to-earn loop.

export const metadata: Metadata = {
  title: 'הצטרפו ל-HELIX',
  description: 'סוכני AI שמריצים שיווק ותפעול לעסק. חבר המליץ לכם, הצטרפו ותהנו.',
  robots: { index: false, follow: false },
};

const ACCENT = '#10b981';

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ ch?: string }>;
}) {
  const { code } = await params;
  const { ch } = await searchParams;
  const channel = (ch || 'direct').slice(0, 20);

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
          <InviteClient code={code} channel={channel} />
        </div>

        <p style={{ fontSize: 13, opacity: 0.6 }}>
          חינם להתחיל · בלי כרטיס אשראי
        </p>
      </div>
    </main>
  );
}

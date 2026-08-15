// A rendered mockup of the HELIX CHIEF chat interface — pure markup, no image
// files, no screenshot needed. Shows a real request, CHIEF's action trace, and
// the autonomy pills. Used on the CHIEF product page and the homepage band.
import { EmojiIcon } from '@/lib/emoji-icon';

export default function ProductChiefMockup({
  accent = '#6366F1',
  compact = false,
}: {
  accent?: string;
  compact?: boolean;
}) {
  return (
    <div
      dir="rtl"
      style={{
        maxWidth: compact ? 380 : 560,
        width: '100%',
        margin: '0 auto',
        borderRadius: 16,
        border: '1px solid var(--border, rgba(255,255,255,0.12))',
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
        boxShadow: `0 24px 60px -24px ${accent}55`,
      }}
    >
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))' }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: '#ff5f57' }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: '#febc2e' }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: '#28c840' }} />
        <span style={{ marginInlineStart: 8, fontWeight: 800, fontSize: 13, color: accent }}><EmojiIcon e="🧠" /> HELIX CHIEF</span>
      </div>

      {/* chat body */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* user bubble */}
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: accent, color: '#fff', borderRadius: '14px 14px 4px 14px', padding: '9px 12px', fontSize: 14, lineHeight: 1.5 }}>
          מצא לי את 3 הלידים הכי חמים, תכין להם פולואפ ותתאם פגישה
        </div>

        {/* chief bubble */}
        <div style={{ alignSelf: 'flex-end', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border, rgba(255,255,255,0.1))', borderRadius: '14px 14px 14px 4px', padding: '12px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8 }}>HELIX CHIEF</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink, #e8eaed)', marginBottom: 10 }}>
            מצאתי 3 לידים חמים והכנתי פולואפ לכל אחד. הפגישה מחכה לאישורך:
          </div>
          {[
            { icon: '✅', label: 'CRM · list_leads', note: '3 לידים חמים', tone: '#34d399' },
            { icon: '✅', label: 'Outreach · draft_followup', note: 'טיוטה מוכנה', tone: '#34d399' },
            { icon: '⏳', label: 'Scheduling · book_meeting', note: 'ממתין לאישור', tone: '#fbbf24' },
          ].map((a) => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, padding: '6px 0', borderTop: '1px solid var(--border, rgba(255,255,255,0.07))' }}>
              <span><EmojiIcon e={a.icon} /></span>
              <span style={{ color: 'var(--ink-secondary, #9aa0a6)', flex: 1 }}>{a.label}</span>
              <span style={{ color: a.tone, fontWeight: 700, fontSize: 11 }}>{a.note}</span>
            </div>
          ))}
        </div>

        {/* autonomy pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: 'var(--ink-secondary, #9aa0a6)' }}>מתג אוטונומיה:</span>
          <span style={{ padding: '3px 9px', borderRadius: 999, border: '1px solid var(--border, rgba(255,255,255,0.15))', color: 'var(--ink-secondary, #9aa0a6)' }}><EmojiIcon e="💡" /> מציע</span>
          <span style={{ padding: '3px 9px', borderRadius: 999, border: `1px solid ${accent}`, background: `${accent}22`, color: accent, fontWeight: 700 }}><EmojiIcon e="📩" /> מאשר</span>
          <span style={{ padding: '3px 9px', borderRadius: 999, border: '1px solid var(--border, rgba(255,255,255,0.15))', color: 'var(--ink-secondary, #9aa0a6)' }}><EmojiIcon e="🤖" /> אוטופיילוט</span>
        </div>
      </div>

      {/* input bar */}
      <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border, rgba(255,255,255,0.1))' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '9px 12px', color: 'var(--ink-secondary, #9aa0a6)', fontSize: 13 }}>
          בקש מ-HELIX CHIEF…
        </div>
        <div style={{ background: accent, color: '#fff', borderRadius: 10, padding: '9px 16px', fontWeight: 700, fontSize: 13 }}>שליחה</div>
      </div>
    </div>
  );
}

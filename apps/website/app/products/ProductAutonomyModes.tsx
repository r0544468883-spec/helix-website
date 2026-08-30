// The 3 autonomy modes, shown high on the CHIEF page so visitors immediately
// grasp that one mode is full autonomous decision-making.

import { EmojiIcon } from '@/lib/emoji-icon';

type Mode = { icon: string; name: string; desc: string };

export default function ProductAutonomyModes({ accent = '#6366F1', modes }: { accent?: string; modes: Mode[] }) {
  return (
    <section className="sp2-section" id="autonomy" aria-label="מתג האוטונומיה">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: accent, textTransform: 'uppercase', marginBottom: 8 }}>
            מתג האוטונומיה
          </div>
          <h2 style={{ fontSize: 'clamp(22px,3.4vw,32px)', fontWeight: 800, lineHeight: 1.2 }}>
            אתה קובע כמה חופש לתת לו. שלושה מצבים, לכל פעולה בנפרד.
          </h2>
        </div>
        <div className="sp-modes-grid">
          {modes.map((m, i) => {
            const hot = i === modes.length - 1; // המצב האחרון (אוטופיילוט) מודגש
            return (
              <div
                key={m.name}
                className="sp-mode-card"
                style={{
                  ['--acc' as string]: accent,
                  borderColor: hot ? accent : 'var(--border, rgba(255,255,255,0.12))',
                  background: hot ? `${accent}14` : 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 8 }}><EmojiIcon e={m.icon} /></div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{m.name}</div>
                <p style={{ color: 'var(--ink-secondary, #9aa0a6)', lineHeight: 1.6, fontSize: 14.5 }}>{m.desc}</p>
                {hot && (
                  <div style={{ marginTop: 10, display: 'inline-block', fontSize: 11, fontWeight: 700, color: accent, border: `1px solid ${accent}`, borderRadius: 999, padding: '3px 10px' }}>
                    החלטות אוטונומיות מלאות
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

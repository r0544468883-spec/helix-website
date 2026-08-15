import ScrollReveal from '../components/ScrollReveal';
import { EmojiIcon } from '@/lib/emoji-icon';
import type { TeamMember } from './product-teams';

/**
 * "Meet the team" roster — the HELIX cast as illustrated, accent-tinted avatars.
 * Framing: a team that works FOR you (never "replace humans"); אלון the Critic is
 * the trust anchor. Deliberately abstract avatars (role emoji in an accent orb),
 * not fake human photos — see PRODUCTS/HELIX-AGENT-CAST.md §principles.
 */
export default function ProductTeamRoster({ accent, team }: { accent: string; team: TeamMember[] }) {
  return (
    <section className="ptr" style={{ ['--pac' as string]: accent }}>
      <style>{`
        .ptr { padding: 56px 0 44px; }
        .ptr-head { text-align: center; max-width: 640px; margin: 0 auto 34px; padding: 0 20px; }
        .ptr-eyebrow { font-size: 13px; font-weight: 800; letter-spacing: .02em; color: var(--pac); text-transform: uppercase; margin-bottom: 8px; }
        .ptr-title { font-family: 'Rubik', sans-serif; font-weight: 900; font-size: clamp(22px, 2.8vw, 32px); letter-spacing: -.02em; color: var(--ink); }
        .ptr-sub { color: var(--ink-muted); font-size: 15px; margin-top: 10px; line-height: 1.6; }
        .ptr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; max-width: 1080px; margin: 0 auto; padding: 0 20px; }
        .ptr-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 24px 18px; border-radius: 18px;
          background: rgba(255,255,255,.025); border: 1px solid var(--border, rgba(255,255,255,.08)); transition: border-color .2s, transform .2s, box-shadow .2s; }
        .ptr-card:hover { border-color: color-mix(in srgb, var(--pac) 55%, transparent); transform: translateY(-3px); box-shadow: 0 12px 34px color-mix(in srgb, var(--pac) 20%, transparent); }
        .ptr-orb { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; color: var(--pac); line-height: 1;
          background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--pac) 40%, transparent), color-mix(in srgb, var(--pac) 12%, transparent));
          border: 1px solid color-mix(in srgb, var(--pac) 45%, transparent); box-shadow: 0 6px 20px color-mix(in srgb, var(--pac) 22%, transparent); }
        .ptr-name { font-weight: 800; font-size: 17px; color: var(--ink); }
        .ptr-role { font-size: 12.5px; font-weight: 700; color: var(--pac); }
        .ptr-line { font-size: 13px; color: var(--ink-muted); line-height: 1.55; }
        .ptr-foot { text-align: center; color: var(--ink-muted); font-size: 13px; margin: 26px auto 0; max-width: 620px; padding: 0 20px; }
        .ptr-foot strong { color: var(--ink); }
      `}</style>
      <div className="ptr-head">
        <div className="ptr-eyebrow">הצוות שלכם</div>
        <h2 className="ptr-title">הכירו את הצוות שעובד <em style={{ fontStyle: 'normal', color: accent }}>בשבילכם</em></h2>
        <p className="ptr-sub">לא בוט אחד — מחלקה של סוכנים, כל אחד עם תפקיד, שחושב עצמאית ומעביר לבא בתור.</p>
      </div>
      <ScrollReveal stagger staggerDelay={0.08} className="ptr-grid">
        {team.map((m) => (
          <div className="ptr-card" key={m.name + m.role}>
            <span className="ptr-orb" aria-hidden="true"><EmojiIcon e={m.emoji} size={30} /></span>
            <span className="ptr-name">{m.name}</span>
            <span className="ptr-role">{m.role}</span>
            <span className="ptr-line">{m.line}</span>
          </div>
        ))}
      </ScrollReveal>
      <p className="ptr-foot">
        וכמו בכל צוות טוב — יש <strong>מבקר שבודק את העבודה לפני שהיא יוצאת</strong>. לא רק מבטיחים, בודקים.
      </p>
    </section>
  );
}

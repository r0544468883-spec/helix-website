// DEMO landing page for the "first month free" offer (spec: PRODUCTS/FIRST-MONTH-FREE-FUNNEL-SPEC.md §2.1).
// Example built on HELIX Marketing OPS. Route: /first-month-free
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "חודש ראשון חינם — HELIX Marketing OPS",
  description:
    "נסו את HELIX Marketing OPS חודש שלם בחינם. בלי התחייבות, ביטול בקליק. צוות סוכני שיווק שעובד לכם מהיום הראשון.",
};

const ACCENT = "#A78BFA"; // OPS accent (per-product); global CTA stays brand-green.

export default function FirstMonthFreePage() {
  return (
    <main dir="rtl" className="fmf">
      {/* ---------- HERO ---------- */}
      <section className="fmf-hero">
        <span className="fmf-eyebrow">HELIX Marketing OPS</span>
        <h1 className="fmf-h1">
          חודש ראשון <span className="fmf-grad">חינם</span>.<br />
          בלי התחייבות, ביטול בקליק.
        </h1>
        <p className="fmf-sub">
          צוות סוכני שיווק שכותב, מתזמן ומפיץ ל-9 ערוצים, בעברית מלאה.
          נסו חודש שלם, בלי לדבר עם אף אחד. תחליטו רק בסוף.
        </p>
        <div className="fmf-cta-row">
          <a href="/signup?plan=marketing-ops-pro" className="fmf-btn-primary">
            התחילו חודש חינם ←
          </a>
          <span className="fmf-cta-note">₪0 עכשיו · לא תחויבו עד סוף החודש</span>
        </div>
        <div className="fmf-trust">
          <span>ביטול בקליק</span>
          <span>·</span>
          <span>עברית מלאה</span>
          <span>·</span>
          <span>בלי חוזה</span>
        </div>
      </section>

      {/* ---------- 3 STEPS ---------- */}
      <section className="fmf-steps">
        <h2 className="fmf-h2">איך זה עובד</h2>
        <div className="fmf-steps-grid">
          {[
            { n: "1", t: "נרשמים ב-2 דקות", d: "אימייל או Google. מכניסים כרטיס, מחויבים ₪0. החודש הראשון עלינו." },
            { n: "2", t: "משתמשים חודש שלם", d: "המערכת טעונה מראש בדוגמה חיה, אתם רואים ערך מהרגע הראשון. בלי מסך ריק." },
            { n: "3", t: "מחליטים בסוף", d: "אהבתם? לא עושים כלום, ממשיכים אוטומטית. לא? מבטלים בקליק, לפני חיוב." },
          ].map((s) => (
            <div key={s.n} className="fmf-step">
              <div className="fmf-step-num">{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CARD OBJECTION FAQ (the make-or-break section) ---------- */}
      <section className="fmf-faq">
        <h2 className="fmf-h2">שאלות על הכרטיס</h2>
        <p className="fmf-faq-lead">שקיפות מלאה. בלי אותיות קטנות.</p>
        <div className="fmf-faq-list">
          {[
            {
              q: "למה צריך כרטיס אם זה חינם?",
              a: "כדי שהמעבר בסוף החודש יהיה חלק, בלי להזין שוב פרטים. לא תחויבו עד סוף החודש, ונשלח תזכורת 3 ימים לפני.",
            },
            {
              q: "מתי בדיוק אחויב?",
              a: "רק בתום 30 יום, ורק אם לא ביטלתם. עד אז ₪0. התשלום הראשון הוא ₪449 לחודש (מסלול Pro).",
            },
            {
              q: "איך מבטלים?",
              a: "כפתור אחד בהגדרות החשבון, בכל רגע במהלך החודש. בלי טלפונים, בלי שיחת שימור.",
            },
            {
              q: "מה קורה לדאטה שלי אם לא ממשיכים?",
              a: "נשמרת במצב קריאה-בלבד, לא נמחקת. אם תחזרו, הכל מחכה לכם.",
            },
          ].map((f) => (
            <details key={f.q} className="fmf-faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- SOCIAL PROOF ---------- */}
      <section className="fmf-proof">
        <div className="fmf-proof-stat">
          <strong>80%</strong>
          <span>פחות זמן על תיאום שיווק</span>
        </div>
        <div className="fmf-proof-quote">
          <p>"תוך שבוע היינו מפיצים תוכן ל-9 ערוצים בלי צוות. החודש החינם שכנע אותנו."</p>
          <span>— מיכל ל., מנהלת שיווק, חברת SaaS</span>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="fmf-final">
        <h2 className="fmf-h2">מוכנים לחודש חינם?</h2>
        <p>מסלול Pro מלא. ₪0 החודש הראשון. ₪449/חודש אחר כך, או ביטול בקליק.</p>
        <a href="/signup?plan=marketing-ops-pro" className="fmf-btn-primary fmf-btn-lg">
          התחילו עכשיו ←
        </a>
      </section>

      {/* ---------- STICKY OFFER BAR (mobile-friendly) ---------- */}
      <div className="fmf-sticky">
        <span>חודש ראשון ₪0 · ביטול בקליק</span>
        <a href="/signup?plan=marketing-ops-pro">התחילו חינם</a>
      </div>

      <style>{`
        .fmf {
          --acc: ${ACCENT};
          --brand: #10B981;
          --bg: #121413; --surface: #1A1C1B;
          --ink: #E2E3E1; --ink-2: #BBCABE; --ink-muted: #869489;
          --border: rgba(255,255,255,0.08);
          background: var(--bg); color: var(--ink);
          font-family: var(--font-heebo, system-ui, sans-serif);
          padding-bottom: 96px;
          overflow-x: clip;
        }
        .fmf section { max-width: 900px; margin: 0 auto; padding: 72px 24px; }
        .fmf-h1 { font-size: clamp(32px, 6vw, 56px); font-weight: 900; line-height: 1.1; letter-spacing: -0.03em; margin: 0 0 20px; }
        .fmf-h2 { font-size: clamp(24px, 4vw, 34px); font-weight: 800; letter-spacing: -0.02em; margin: 0 0 12px; }
        .fmf-grad { background: linear-gradient(120deg, var(--acc), var(--brand)); -webkit-background-clip: text; background-clip: text; color: transparent; }

        /* HERO */
        .fmf-hero { text-align: center; padding-top: 96px; }
        .fmf-eyebrow { display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: 0.04em; color: var(--acc); background: color-mix(in srgb, var(--acc) 14%, transparent); padding: 6px 14px; border-radius: 999px; margin-bottom: 24px; }
        .fmf-sub { font-size: clamp(16px, 2.4vw, 19px); color: var(--ink-2); max-width: 620px; margin: 0 auto 32px; line-height: 1.6; }
        .fmf-cta-row { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .fmf-btn-primary { display: inline-block; background: var(--brand); color: #06231A; font-weight: 800; font-size: 17px; padding: 16px 34px; border-radius: 14px; text-decoration: none; transition: transform .15s ease, box-shadow .15s ease; min-height: 44px; }
        .fmf-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px color-mix(in srgb, var(--brand) 35%, transparent); }
        .fmf-btn-lg { font-size: 19px; padding: 18px 44px; }
        .fmf-cta-note { font-size: 14px; color: var(--ink-muted); }
        .fmf-trust { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 28px; font-size: 14px; color: var(--ink-muted); }

        /* STEPS */
        .fmf-steps { text-align: center; }
        .fmf-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 32px; }
        .fmf-step { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 28px 22px; text-align: right; }
        .fmf-step-num { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px; background: color-mix(in srgb, var(--acc) 16%, transparent); color: var(--acc); font-weight: 900; font-size: 18px; margin-bottom: 16px; }
        .fmf-step h3 { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
        .fmf-step p { font-size: 15px; color: var(--ink-2); line-height: 1.55; margin: 0; }

        /* FAQ */
        .fmf-faq { text-align: center; }
        .fmf-faq-lead { color: var(--ink-muted); margin: 0 0 28px; }
        .fmf-faq-list { display: flex; flex-direction: column; gap: 12px; text-align: right; }
        .fmf-faq-item { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 4px 20px; }
        .fmf-faq-item summary { cursor: pointer; font-weight: 700; font-size: 16px; padding: 16px 0; list-style: none; display: flex; justify-content: space-between; align-items: center; }
        .fmf-faq-item summary::after { content: "+"; color: var(--acc); font-size: 22px; font-weight: 400; }
        .fmf-faq-item[open] summary::after { content: "−"; }
        .fmf-faq-item p { color: var(--ink-2); line-height: 1.6; margin: 0 0 16px; font-size: 15px; }

        /* PROOF */
        .fmf-proof { display: flex; gap: 32px; align-items: center; flex-wrap: wrap; justify-content: center; background: var(--surface); border-radius: 24px; border: 1px solid var(--border); }
        .fmf-proof-stat { text-align: center; }
        .fmf-proof-stat strong { display: block; font-size: 52px; font-weight: 900; color: var(--brand); line-height: 1; }
        .fmf-proof-stat span { font-size: 14px; color: var(--ink-muted); }
        .fmf-proof-quote { max-width: 420px; }
        .fmf-proof-quote p { font-size: 17px; line-height: 1.5; margin: 0 0 8px; }
        .fmf-proof-quote span { font-size: 14px; color: var(--ink-muted); }

        /* FINAL */
        .fmf-final { text-align: center; }
        .fmf-final p { color: var(--ink-2); margin: 0 0 28px; font-size: 17px; }

        /* STICKY */
        .fmf-sticky { position: fixed; bottom: 0; inset-inline: 0; z-index: 50; background: rgba(18,20,19,0.92); backdrop-filter: blur(12px); border-top: 1px solid var(--border); display: flex; justify-content: center; align-items: center; gap: 18px; padding: 14px 20px; flex-wrap: wrap; }
        .fmf-sticky span { font-size: 14px; color: var(--ink-2); font-weight: 600; }
        .fmf-sticky a { background: var(--brand); color: #06231A; font-weight: 800; padding: 10px 22px; border-radius: 10px; text-decoration: none; font-size: 15px; min-height: 44px; display: inline-flex; align-items: center; }

        /* MOBILE */
        @media (max-width: 720px) {
          .fmf-steps-grid { grid-template-columns: 1fr; }
          .fmf section { padding: 52px 20px; }
          .fmf-proof { flex-direction: column; text-align: center; }
        }
      `}</style>
    </main>
  );
}

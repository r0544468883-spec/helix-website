// Homepage band introducing HELIX CHIEF — the general management layer.
// Reuses the .sp-chief-* styles (globals.css) with an indigo accent.

export default function ChiefBand() {
  return (
    <section className="sp2-section" id="chief-intro" aria-label="HELIX CHIEF">
      <div className="container">
        <div className="sp-chief-band" style={{ ['--acc' as string]: '#6366F1' }}>
          <div className="sp-chief-emoji">🧠</div>
          <div className="sp-chief-copy">
            <div className="sp-chief-eyebrow">מערכת הניהול הכללית</div>
            <h2 className="sp-chief-title">HELIX CHIEF, המנהל שמפעיל את כל הכלים שלך</h2>
            <p className="sp-chief-text">
              לא עוד כלי על השולחן. CHIEF הוא שכבת ה-AI שיושבת מעל כל המערכות שכבר יש לך,
              ה-CRM, Slack, Jira, חשבשבת, גוגל ווואטסאפ, ומנהלת אותן בעברית. אתה מבקש, הוא מבצע,
              בשליטת מתג האוטונומיה. עובד עם הכלים שלך, או מגיע עם CRM חינם משלנו.
            </p>
            <a href="/products/chief" className="sp-chief-cta">
              להכיר את HELIX CHIEF ←
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

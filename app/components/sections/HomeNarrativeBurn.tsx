// Homepage narrative band with the burning-money video, mirroring the
// "Narrative #1" section used across the service pages (sp-narrative +
// sp-burn-video). General HELIX money-waste framing for the homepage.

import ScrollTextHighlight from '../ScrollTextHighlight';

export default function HomeNarrativeBurn() {
  return (
    <section className="sp-narrative" aria-label="הכסף שנשרף">
      <div className="container">
        <div className="sp-narrative-with-video">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>אתה שורף כסף, ואפילו לא מרגיש.</h2>
            <p>
              עוד ספק שהבטיח הרים, גבה מחיר מופרך, ובסוף לא עמד בהסכם. ותכל'ס, כולם כבר
              עובדים עם AI שחתך את העבודה בחצי, אבל המחיר שאתה משלם לא ירד. זה לא תקציב
              שחסר לך, זה כסף שנשרף.
            </p>
            <p>
              אנחנו עושים את ההפך. אותה מקצועיות, אותן תוצאות, בחצי מהמחיר של כל ספק אחר.
              כי את החיסכון שה-AI נותן לנו, אנחנו מגלגלים ישר אליך. בלי חוזה.
            </p>
            <p className="sp-narrative-highlight">
              שיחת היכרות ראשונה חינם, בלי התחייבות. בוא נדבר חמש דקות.
            </p>
          </ScrollTextHighlight>
          <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
        </div>
      </div>
    </section>
  );
}

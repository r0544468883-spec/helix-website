'use client';

import dynamic from 'next/dynamic';
import SectionHeader from '../SectionHeader';

const StepsLottie = dynamic(() => import('../StepsLottie'), { ssr: false });

const steps = [
  {
    n: '01',
    title: 'שיחת וואטסאפ',
    text: 'שולחים לנו הודעה. בלי טפסים, בלי תורים. ערן או רון חוזרים אליכם תוך כמה שעות.',
  },
  {
    n: '02',
    title: 'בחירת שירות',
    text: 'יחד מבינים מה אתם צריכים: אתר? שיווק? אוטומציה? פיתוח? אולי כמה דברים ביחד.',
  },
  {
    n: '03',
    title: 'מתחילים לעבוד',
    text: 'בלי אפיון של חודשיים. מתחילים תוך ימים, מספקים תוצאות ראשונות תוך שבועות. עדכון שבועי קבוע.',
  },
  {
    n: '04',
    title: 'רואים תוצאות',
    text: 'דוחות שקופים, מספרים אמיתיים. אם משהו לא עובד, משנים כיוון. בלי עלויות מוסתרות.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="method">
      <div className="container">
        <SectionHeader
          eyebrow="התהליך"
          titleHtml="מהודעה אחת בוואטסאפ ללידים אמיתיים."
          description="ארבעה שלבים. בלי ישיבות אפיון של חודשיים."
        />

        <div className="hiw-body">
          {/* Lottie — left side */}
          <div className="hiw-lottie-wrap" aria-hidden="true">
            <StepsLottie />
          </div>

          {/* Steps — 2×2 grid */}
          <div className="hiw-grid">
            {steps.map((step) => (
              <div key={step.n} className="hiw-step">
                <div className="hiw-number">{step.n}</div>
                <h3 className="hiw-title">{step.title}</h3>
                <p className="hiw-text">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

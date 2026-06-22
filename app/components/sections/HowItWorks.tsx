'use client';

import SectionHeader from '../SectionHeader';

const steps = [
  {
    n: '01',
    title: 'מכירים את העסק שלכם',
    text: 'לפני שפותחים מחשב או חושבים על עיצוב, אנחנו צריכים להבין בכלל מה אתם צריכים. נשב לשיחה קצרה כדי להבין את העסק שלכם, הקהל שלכם והמטרות שהנוכחות הדיגיטלית חייבת להשיג — לידים? פניות? מכירות? ומשם נבנה תוכנית עבודה מסודרת שתוודא שהתוצאה הסופית אשכרה תייצר תוצאות.',
  },
  {
    n: '02',
    title: 'מקבלים הצעת מחיר',
    text: 'תוך זמן קצר מהשיחה שלנו, תקבלו הצעת מחיר מסודרת. תדעו בדיוק מה כלול, מה לא, ומתי הפרויקט מסתיים. ככה שאתם יודעים מראש על מה אתם משלמים, בלי שום הפתעות בדרך.',
  },
  {
    n: '03',
    title: 'יוצאים לדרך',
    text: 'שלב הביצוע מתחיל ואנחנו מטפלים בהכל — מהעיצוב הויזואלי, דרך הפיתוח ועד אוטומציות AI מותאמות אישית. אתם לא הולכים לחכות חודש בערפל; אתם שותפים מלאים לאורך כל התהליך, רואים את ההתקדמות ומאשרים כל שלב.',
  },
  {
    n: '04',
    title: 'חוגגים השקה!',
    text: 'הפרויקט עולה לאוויר, פותחים שמפניה! אבל אנחנו לא מאלה שבונים ונעלמים. כל פרויקט נבנה מראש עם תשתית שמוכנה לצמיחה — SEO, אנליטיקס, אוטומציות — ואנחנו נשארים איתכם ברקע לטובת תחזוקה שוטפת, עדכונים וכל עזרה שתצטרכו.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="method">
      <div className="container">
        <SectionHeader
          eyebrow="הדרך שלנו"
          titleHtml="מהודעה אחת בוואטסאפ<br/>לתוצאות אמיתיות."
          description="בניית נוכחות דיגיטלית חזקה לא קורית במקרה. אנחנו עובדים בצורה מסודרת, שקופה ובלי קיצורי דרך — ככה שהתוצאה הסופית באמת מזיזה את העסק שלכם."
        />

        {/* Vertical Timeline */}
        <div className="relative mt-16 max-w-3xl mx-auto" dir="rtl">
          {/* Vertical line */}
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{
              right: '23px',
              background: 'linear-gradient(to bottom, transparent, #10B981 10%, #10B981 90%, transparent)',
              opacity: 0.3,
            }}
          />

          <div className="flex flex-col gap-12">
            {steps.map((step, i) => (
              <div key={step.n} className="relative flex items-start gap-6 group">
                {/* Number circle */}
                <div
                  className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1.5px solid rgba(16, 185, 129, 0.3)',
                    color: '#10B981',
                  }}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">
                    {step.n}
                  </span>
                </div>

                {/* Content card */}
                <div
                  className="flex-1 rounded-2xl p-6 sm:p-8 transition-all duration-300"
                  style={{
                    background: 'rgba(16, 185, 129, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.07)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.04)';
                  }}
                >
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: 'var(--ink-secondary)', lineHeight: '1.7' }}
                  >
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom glow dot */}
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              right: '18px',
              bottom: '-6px',
              background: '#10B981',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)',
            }}
          />
        </div>
      </div>
    </section>
  );
}

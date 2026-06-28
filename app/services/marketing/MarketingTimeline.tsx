'use client';

import { useEffect, useRef } from 'react';
import SectionHeader from '../../components/SectionHeader';

const steps = [
  {
    n: '01',
    title: 'שיחה',
    text: 'לא פגישת מכירה. שיחה אמיתית כדי להבין מה המצב, מה עבד ומה לא, ומה בדיוק אתה צריך. אם אנחנו לא יכולים לעזור — נגיד את זה.',
  },
  {
    n: '02',
    title: 'אסטרטגיה',
    text: 'מחקר קהלים, מיפוי מתחרים, בחירת ערוצים ומסרים. לא תבנית שעובדת לכולם — תוכנית שנבנית בשבילך.',
  },
  {
    n: '03',
    title: 'ביצוע ומדידה',
    text: 'קמפיינים עולים לאוויר. כל שבוע אנחנו בודקים מה עובד ומה לא. מה שעובד — מקבל יותר תקציב. מה שלא — נעצר.',
  },
  {
    n: '04',
    title: 'שקיפות מלאה',
    text: 'פגישה שבועית של 30 דקות + דוח חודשי עם מספרים אמיתיים. לידים, עלות לליד, מכירות. אתה תמיד יודע מה קורה עם הכסף שלך.',
  },
];

export default function MarketingTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const el = timelineRef.current;
      if (!el) return;

      const line = el.querySelector('.timeline-line-fill') as HTMLElement;
      const cards = el.querySelectorAll('.timeline-card');

      if (line) {
        gsap.fromTo(line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 70%',
              end: 'bottom 60%',
              scrub: 0.8,
            },
          }
        );
      }

      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          x: 40,
          duration: 0.7,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (el.contains(t.trigger as Node)) t.kill();
        });
      };
    })();

    return () => cleanup?.();
  }, []);

  return (
    <section className="how-it-works" id="method">
      <div className="container">
        <SectionHeader
          eyebrow="התהליך שלנו"
          titleHtml="איך שיווק דיגיטלי<br/>עובד אצלנו."
          description="ארבעה שלבים. בלי ישיבות אפיון של חודשיים."
        />

        <div className="timeline-layout" dir="rtl">
          <div ref={timelineRef} className="timeline">
            <div className="timeline-line">
              <div className="timeline-line-fill" />
            </div>

            {steps.map((step) => (
              <div key={step.n} className="timeline-card">
                <div className="timeline-dot">
                  <span className="timeline-dot-inner" />
                </div>
                <span className="timeline-number">{step.n}</span>
                <div className="timeline-content">
                  <h3 className="timeline-title">{step.title}</h3>
                  <p className="timeline-text">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

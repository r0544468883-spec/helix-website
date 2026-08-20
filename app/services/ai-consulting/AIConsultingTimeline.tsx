'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../../components/SectionHeader';

const StepsLottie = dynamic(() => import('../../components/StepsLottie'), { ssr: false });

const steps = [
  {
    n: '01',
    title: 'אבחון ומיפוי',
    text: 'יושבים עם ההנהלה והצוותים, מבינים את התהליכים, ומזהים איפה AI ייצר את הערך הכי גדול הכי מהר. מפה של הזדמנויות מדורגת לפי אימפקט מול מאמץ.',
  },
  {
    n: '02',
    title: 'Quick Wins',
    text: 'בוחרים 2-3 שימושים שמחזירים ערך תוך שבועות, לא חודשים. מטמיעים כלי, בונים פרומפטים, ומראים לצוות ניצחון מהיר, כדי לייצר אמון ומומנטום.',
  },
  {
    n: '03',
    title: 'הטמעה והכשרה',
    text: 'סדנאות מעשיות לצוותים, ספריית פרומפטים, GPTs ייעודיים, ומדיניות שימוש ואבטחת מידע ברורה. כל אחד יודע מה מותר, מה אסור, ואיך עובדים.',
  },
  {
    n: '04',
    title: 'הרחבה ומדידה',
    text: 'פגישת ליווי שוטפת + דוח תוצאות. מודדים שעות שנחסכו וערך שנוצר, מרחיבים לתהליכים נוספים, ומעדכנים כשהכלים משתנים. AI זז מהר, אנחנו זזים איתו.',
  },
];

export default function AIConsultingTimeline() {
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
          titleHtml="איך הטמעת AI<br/>עובדת אצלנו."
          description="ארבעה שלבים. מהאבחון ועד שהארגון עובד עם AI בביטחון."
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

          <div className="timeline-lottie" aria-hidden="true">
            <StepsLottie />
          </div>
        </div>
      </div>
    </section>
  );
}

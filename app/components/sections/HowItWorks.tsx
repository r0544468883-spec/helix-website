'use client';

import { useEffect, useRef } from 'react';
import SectionHeader from '../SectionHeader';

const steps = [
  {
    n: '01',
    title: 'מבינים מה צריך',
    text: 'שיחה קצרה כדי להבין מה המצב היום ומה חסר. בלי טפסים, בלי תורים.',
  },
  {
    n: '02',
    title: 'בוחרים חבילה',
    text: 'בוחרים את החבילה שמתאימה לכם. יודעים בדיוק מה כלול ומה עולה.',
  },
  {
    n: '03',
    title: 'אפיון ותוכנית עבודה',
    text: 'מגדירים ביחד מה נבנה, איך ומתי. תוכנית ברורה לפני שמתחילים.',
  },
  {
    n: '04',
    title: 'עובדים ומעדכנים',
    text: 'יוצאים לדרך. פגישת סטטוס שבועית וזמינות יומיומית לכל שאלה.',
  },
];

export default function HowItWorks() {
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

      // Animate the line filling
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

      // Stagger cards
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
          eyebrow="הדרך שלנו"
          titleHtml="מהודעה אחת בוואטסאפ<br/>לתוצאות אמיתיות."
          description="ארבעה שלבים. בלי ישיבות אפיון של חודשיים."
        />

        <div ref={timelineRef} className="timeline" dir="rtl">
          {/* Vertical line */}
          <div className="timeline-line">
            <div className="timeline-line-fill" />
          </div>

          {steps.map((step) => (
            <div key={step.n} className="timeline-card">
              {/* Dot on the line */}
              <div className="timeline-dot">
                <span className="timeline-dot-inner" />
              </div>

              {/* Number */}
              <span className="timeline-number">{step.n}</span>

              {/* Content */}
              <div className="timeline-content">
                <h3 className="timeline-title">{step.title}</h3>
                <p className="timeline-text">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

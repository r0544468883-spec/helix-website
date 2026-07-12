'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../components/SectionHeader';

const StepsLottie = dynamic(() => import('../components/StepsLottie'), { ssr: false });

const steps = [
  { n: '01', title: 'מכניסים כתובת אתר', text: 'בלי הרשמה, בלי חיבור חשבונות. רק הכתובת שלך.' },
  { n: '02', title: 'סורקים ושואלים את ה-AI', text: 'בודקים את האתר ושואלים את ChatGPT, Claude, Gemini ו-Perplexity ישירות.' },
  { n: '03', title: 'מקבלים ציון + פער מול המתחרים', text: 'סולם GEO מ-1 עד 10, ומי מהמתחרים כבר מופיע במקומך.' },
  { n: '04', title: 'מקבלים תוכנית פעולה', text: 'בדיוק מה לתקן, לפי סדר עדיפויות — בשפה פשוטה.' },
  { n: '05', title: 'HELIX סוגרת את הפער', text: 'אם תרצה — אבחון ראשוני חינם ואנחנו מטפלים בזה.' },
];

/** Mirrors HELIX's homepage HowItWorks timeline (line-fill scrub + staggered cards) + steps Lottie. */
export default function GeoSteps() {
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
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: 0.8 },
          },
        );
      }

      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          x: 40,
          duration: 0.7,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
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
    <section className="how-it-works geo-how" id="how">
      <div className="container">
        <SectionHeader
          eyebrow="איך זה עובד"
          titleHtml="מכתובת אתר<br/>לתוכנית פעולה."
          description="חמישה שלבים. משתי דקות ועד לדעת בדיוק מה לתקן."
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

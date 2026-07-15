'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../../components/SectionHeader';

const StepsLottie = dynamic(() => import('../../components/StepsLottie'), { ssr: false });

const steps = [
  {
    n: '01',
    title: 'שיחת אפיון',
    text: 'מבינים מה צריך, למה, ומה ההצלחה נראית. שיחה אמיתית — לא מסמך אפיון של 50 עמודים. אם אנחנו לא מתאימים — נגיד.',
  },
  {
    n: '02',
    title: 'הצעה ותוכנית עבודה',
    text: 'מחזירים הצעה מפורטת: מה ייבנה, כמה שעות, באיזה stack, ובאיזה סדר. אתה מאשר לפני שמתחילים.',
  },
  {
    n: '03',
    title: 'ספרינטים + שקיפות מלאה',
    text: 'עובדים בספרינטים של שבוע-שבועיים. בכל סוף ספרינט אתה רואה מוצר עובד, לא מצגת. פגישה שבועית עם דמו חי.',
  },
  {
    n: '04',
    title: 'השקה ותמיכה',
    text: 'המוצר עולה לאוויר. אנחנו נשארים — באגים, שיפורים, פיצ׳רים חדשים. בנק השעות תמיד פתוח.',
  },
];

export default function DevelopmentTimeline() {
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
        gsap.fromTo(line, { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: 0.8 },
        });
      }

      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0, x: 40, duration: 0.7, delay: i * 0.1, ease: 'power3.out',
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
    <section className="how-it-works" id="method">
      <div className="container">
        <SectionHeader
          eyebrow="איך עובדים"
          titleHtml="מהשיחה הראשונה<br/>למוצר באוויר."
          description="ארבעה שלבים. ספרינטים קצרים. שקיפות מלאה."
        />
        <div className="timeline-layout" dir="rtl">
          <div ref={timelineRef} className="timeline">
            <div className="timeline-line"><div className="timeline-line-fill" /></div>
            {steps.map((step) => (
              <div key={step.n} className="timeline-card">
                <div className="timeline-dot"><span className="timeline-dot-inner" /></div>
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

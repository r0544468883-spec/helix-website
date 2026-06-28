'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../../components/SectionHeader';

const StepsLottie = dynamic(() => import('../../components/StepsLottie'), { ssr: false });

const steps = [
  {
    n: '01',
    title: 'פגישת אפיון והגדרת מטרות',
    text: 'מבינים ביחד מה האתר צריך לעשות, מי קהל היעד, ומה ההצלחה נראית. בלי מסמכי אפיון של 40 עמודים — שיחה ברורה שמסתיימת בתוכנית עבודה.',
  },
  {
    n: '02',
    title: 'בניית שלד וחווית משתמש',
    text: 'מעצבים את המבנה, הניווט וההיררכיה של התוכן. אתה רואה wireframe ומאשר לפני שמתחילים לעצב. בלי הפתעות.',
  },
  {
    n: '03',
    title: 'פיתוח ועיצוב בהתאמה אישית',
    text: 'עיצוב ייחודי שמתאים ל-DNA של העסק שלך. פיתוח בקוד נקי, מהיר, ורספונסיבי לכל מכשיר. SEO בסיסי כבר מהשורה הראשונה.',
  },
  {
    n: '04',
    title: 'בקרת איכות, בדיקות והשקה',
    text: 'בודקים הכל — מהירות, מובייל, טפסים, פיקסלים. מתקנים מה שצריך. משיקים. ומשם — תחזוקה שוטפת, גיבויים ועדכונים כלולים.',
  },
];

export default function WebsitesTimeline() {
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
          eyebrow="הדרך שלנו"
          titleHtml="מהשיחה הראשונה<br/>לנכס דיגיטלי מנצח."
          description="ארבעה שלבים. שקיפות מלאה ודיוק טכני."
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

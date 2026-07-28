'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../../components/SectionHeader';

const StepsLottie = dynamic(() => import('../../components/StepsLottie'), { ssr: false });

const steps = [
  {
    n: '01',
    title: 'אבחון מכירות ופיתוח עסקי',
    text: 'יושבים על התהליך הקיים — מאיפה מגיעים לידים, איך מטפלים בהם, איפה מפסידים. מזהים את נקודות הדליפה ואת ההזדמנויות לצמיחה, ומסכמים בתוכנית עבודה.',
  },
  {
    n: '02',
    title: 'אסטרטגיה, תמחור ותהליך',
    text: 'בונים אסטרטגיית מכירות, מודל תמחור ותהליך מכירה מסודר — מהפנייה הראשונה ועד הסגירה. כולל תסריטי שיחה, טיפול בהתנגדויות ומסרים.',
  },
  {
    n: '03',
    title: 'הקמת CRM, דשבורד והכשרה',
    text: 'מקימים CRM ודשבורד מכירות עם יעדים ברורים לכל נציג, ומכשירים את הצוות לעבוד לפי השיטה. אם צריך — מלווים גם את גיוס אנשי המכירות.',
  },
  {
    n: '04',
    title: 'ליווי שוטף ואופטימיזציה',
    text: 'פגישה שבועית, מעקב אחרי המספרים, וכיוונון מתמיד. משם — פיתוח עסקי: שווקים חדשים, שותפויות וערוצי הכנסה נוספים.',
  },
];

export default function SalesConsultingTimeline() {
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
          titleHtml="מאבחון<br/>למכונת מכירות."
          description="ארבעה שלבים. שקיפות מלאה ומספרים אמיתיים."
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

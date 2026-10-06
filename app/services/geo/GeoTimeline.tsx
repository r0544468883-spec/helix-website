'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../../components/SectionHeader';

const StepsLottie = dynamic(() => import('../../components/StepsLottie'), { ssr: false });

const steps = [
  {
    n: '01',
    title: 'בדיקת פתיחה',
    text: 'בודקים איפה אתה עומד היום ב-ChatGPT, Gemini ו-Claude. זה המספר שממנו נמדוד.',
  },
  {
    n: '02',
    title: 'מסדרים את התוכן שלך',
    text: 'לוקחים את העמודים שכבר יש לך ומסדרים אותם מחדש כך שה-AI יבין ויצטט, ומוסיפים כתבות חדשות במבנה הנכון.',
  },
  {
    n: '03',
    title: 'מבססים אותך כמקור אמין',
    text: 'דואגים שהבינה המלאכותית תכיר אותך כגורם מוביל בתחום. כל הסימונים הטכניים נעשים מאחורי הקלעים, בלי שתצטרך להתעסק.',
  },
  {
    n: '04',
    title: 'מודדים ומכווננים',
    text: 'פגישה חודשית, דוח כמה פעמים הוזכרת מול המתחרים, ומחליטים יחד מה הצעד הבא.',
  },
];

export default function GeoTimeline() {
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
          titleHtml="איך זה עובד,<br/>שלב אחרי שלב."
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

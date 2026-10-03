'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../../components/SectionHeader';

const StepsLottie = dynamic(() => import('../../components/StepsLottie'), { ssr: false });

const steps = [
  {
    n: '01',
    title: 'אבחון נראות ב-AI',
    text: 'בודקים איך ChatGPT, Gemini ו-Perplexity עונים על השאלות שהלקוחות שלכם שואלים, מי מצוטט היום, איפה אתם מופיעים ואיפה המתחרה תופס את מקומכם. מסכמים במפת הזדמנויות.',
  },
  {
    n: '02',
    title: 'ארכיטקטורת תוכן ו-Schema',
    text: 'בונים מבנה Hub-and-Spoke: עמוד-על ומאמרי לוויין מקושרים, כל אחד במבנה Answer-first עם Schema ו-FAQ (JSON-LD) שה-AI אוהב לצטט. זה השלד, לא עוד מאמר בודד.',
  },
  {
    n: '03',
    title: 'ביסוס ישויות ואמון',
    text: 'מקימים עמוד-ישויות, מחברים Wikidata ו-Knowledge Graph, מוסיפים עמוד-סטטיסטיקות מתוארך וקובץ llms.txt. ככה מנועי ה-AI לומדים מי אתם וסומכים עליכם.',
  },
  {
    n: '04',
    title: 'מדידה, Citation Share וכיוונון',
    text: 'דוח חודשי: כמה פעמים אתם מצוטטים ב-AI מול המתחרים, על אילו שאלות, ואיפה הפער. פגישה שבועית, כיוונון מתמיד, ותוכן חדש שסוגר פערים.',
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
          titleHtml="מאבחון<br/>לתשובה שה-AI מצטט."
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

'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../../components/SectionHeader';

const StepsLottie = dynamic(() => import('../../components/StepsLottie'), { ssr: false });

const steps = [
  { n: '01', title: 'מיפוי ICP', text: 'מגדירים את הלקוח האידיאלי — תפקיד, תעשייה, גודל חברה, כאבים. בלי זה אין outreach אפקטיבי.' },
  { n: '02', title: 'בניית רשימות', text: 'Data enrichment + LinkedIn Sales Navigator. מוצאים את האנשים הנכונים עם מיילים, טלפונים ונתונים רלוונטיים.' },
  { n: '03', title: 'Outreach אוטומטי', text: 'סדרות הודעות מותאמות — לינקדין, אימייל או שניהם. A/B testing על מסרים. המערכת שולחת, אתה סוגר.' },
  { n: '04', title: 'מעקב ואופטימיזציה', text: 'דשבורד CRM + דוח שבועי. רואים מה עובד, מה לא, ומשפרים כל שבוע. פגישה שבועית של 30 דקות.' },
];

export default function SalesTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
        gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: 0.8 } });
      }
      cards.forEach((card, i) => {
        gsap.from(card, { opacity: 0, x: 40, duration: 0.7, delay: i * 0.1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' } });
      });
      cleanup = () => { ScrollTrigger.getAll().forEach((t) => { if (el.contains(t.trigger as Node)) t.kill(); }); };
    })();
    return () => cleanup?.();
  }, []);

  return (
    <section className="how-it-works" id="method">
      <div className="container">
        <SectionHeader eyebrow="התהליך שלנו" titleHtml="איך SDR אוטומטי<br/>עובד אצלנו." description="ארבעה שלבים. מהמיפוי ועד שהלידים מגיעים." />
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
          <div className="timeline-lottie" aria-hidden="true"><StepsLottie /></div>
        </div>
      </div>
    </section>
  );
}

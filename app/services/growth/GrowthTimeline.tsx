'use client';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../../components/SectionHeader';
const StepsLottie = dynamic(() => import('../../components/StepsLottie'), { ssr: false });

const steps = [
  { n: '01', title: 'אבחון צמיחה', text: 'מנתחים את המשפך, המספרים, המתחרים וההזדמנויות. מזהים את נקודות הצמיחה הגדולות ביותר.' },
  { n: '02', title: 'תוכנית ניסויים', text: 'בונים רשימת ניסויים ממוקדת — A/B tests, שינויי UX, מסרים חדשים, viral loops. מתעדפים לפי impact.' },
  { n: '03', title: 'ביצוע + מדידה', text: 'כל שבוע ניסוי חדש. AI מנתח תוצאות בזמן אמת. מה שעובד — מקבל יותר. מה שלא — נעצר.' },
  { n: '04', title: 'צמיחה מתמשכת', text: 'פגישה שבועית + דוח חודשי. דשבורד growth שמראה ROI אמיתי. המנגנונים עובדים לבד.' },
];

export default function GrowthTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cleanup: (() => void) | undefined;
    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      const el = ref.current; if (!el) return;
      const line = el.querySelector('.timeline-line-fill') as HTMLElement;
      if (line) gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: 0.8 } });
      el.querySelectorAll('.timeline-card').forEach((card, i) => {
        gsap.from(card, { opacity: 0, x: 40, duration: 0.7, delay: i * 0.1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' } });
      });
      cleanup = () => { ScrollTrigger.getAll().forEach((t) => { if (el.contains(t.trigger as Node)) t.kill(); }); };
    })();
    return () => cleanup?.();
  }, []);

  return (
    <section className="how-it-works" id="method">
      <div className="container">
        <SectionHeader eyebrow="התהליך שלנו" titleHtml="איך Growth Hacking<br/>עובד אצלנו." description="ארבעה שלבים. מהאבחון ועד שהמנגנונים רצים לבד." />
        <div className="timeline-layout" dir="rtl">
          <div ref={ref} className="timeline">
            <div className="timeline-line"><div className="timeline-line-fill" /></div>
            {steps.map((s) => (
              <div key={s.n} className="timeline-card">
                <div className="timeline-dot"><span className="timeline-dot-inner" /></div>
                <span className="timeline-number">{s.n}</span>
                <div className="timeline-content"><h3 className="timeline-title">{s.title}</h3><p className="timeline-text">{s.text}</p></div>
              </div>
            ))}
          </div>
          <div className="timeline-lottie" aria-hidden="true"><StepsLottie /></div>
        </div>
      </div>
    </section>
  );
}

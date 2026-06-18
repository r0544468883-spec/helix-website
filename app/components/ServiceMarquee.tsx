'use client';

import { useRef, useEffect } from 'react';

const services = [
  'בניית אתרים',
  'שיווק דיגיטלי',
  'אוטומציה שיווקית',
  'פיתוח עסקי',
  'פיתוח תוכנה',
  'AI Chatbots',
  'SEO',
  'Google Ads',
  'Meta Ads',
  'CRM',
  'Email Automation',
  'Landing Pages',
  'eCommerce',
  'Data Enrichment',
  'LinkedIn Sales Navigator',
];

const NUM_COPIES = 2;
const doubled = [...services, ...services];
const SPEED = 0.3; // px per frame

export default function ServiceMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let xPos = 0;
    let paused = false;
    let rafId: number;

    const step = () => {
      if (!paused) {
        xPos -= SPEED;
        const singleSetWidth = track.scrollWidth / NUM_COPIES;
        if (-xPos >= singleSetWidth) {
          xPos += singleSetWidth;
        }
        track.style.transform = `translateX(${xPos}px)`;
      }
      rafId = requestAnimationFrame(step);
    };

    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };

    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener('mouseenter', onEnter);
      track.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="marquee-wrapper">
      <div className="marquee-track" ref={trackRef}>
        {doubled.map((s, i) => (
          <span key={i} className="service-pill">{s}</span>
        ))}
      </div>
    </div>
  );
}

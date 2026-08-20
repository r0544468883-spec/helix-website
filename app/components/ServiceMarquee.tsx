'use client';

import { useRef, useEffect } from 'react';

const services = [
  'אוטומציות עסקיות',
  'סוכני AI',
  'בוטים מבוססי AI',
  'פיתוח תוכנה',
  'אפליקציות ומערכות',
  'Growth Hacking',
  'n8n',
  'Make',
  'אינטגרציות API',
  'WhatsApp API',
  'CRM',
  'Email Automation',
  'Data Enrichment',
  'LinkedIn Sales Navigator',
  'פיתוח עסקי',
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

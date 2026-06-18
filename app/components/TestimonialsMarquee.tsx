'use client';

import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';

const images = [
  '/testimonials/anon_2.png',
  '/testimonials/anon_3.png',
  '/testimonials/anon_4.png',
  '/testimonials/anon_5.png',
  '/testimonials/anon_6.png',
];

const NUM_COPIES = 4;
const quadrupled = [...images, ...images, ...images, ...images];
const SPEED = 0.5; // px per frame

export default function TestimonialsMarquee() {
  const [lightbox, setLightbox] = useState<string | null>(null);
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
    <>
      <div className="testimonials-section">
        <div className="container">
          <p className="testimonials-label">זה מה שקורה בשוק. בדקנו.</p>
        </div>
        <div className="testimonials-marquee">
          <div className="testimonials-track" ref={trackRef}>
            {quadrupled.map((src, i) => (
              <div
                key={i}
                className="testimonial-card testimonial-card--clickable"
                onClick={() => setLightbox(images[i % images.length])}
              >
                <Image
                  src={src}
                  alt="צילום מסך של תגובה מטושטשת"
                  width={340}
                  height={240}
                  className="testimonial-img"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="סגור">✕</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt="תגובה"
              className="lightbox-img"
            />
          </div>
        </div>
      )}
    </>
  );
}

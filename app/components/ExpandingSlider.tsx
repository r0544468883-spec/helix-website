'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Slide {
  content: React.ReactNode;
}

interface ExpandingSliderProps {
  slides: Slide[];
  /** Auto-play interval in ms (default: 5000) */
  interval?: number;
  className?: string;
}

export default function ExpandingSlider({ slides, interval = 5000, className = '' }: ExpandingSliderProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next, interval]);

  return (
    <div
      className={`expanding-slider ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="expanding-slider__track">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`expanding-slider__slide ${active === i ? 'expanding-slider__slide--active' : ''}`}
          >
            {slide.content}
          </div>
        ))}
      </div>

      <div className="expanding-slider__dots" role="tablist">
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            aria-label={`Slide ${i + 1}`}
            className={`expanding-slider__dot ${active === i ? 'expanding-slider__dot--active' : ''}`}
            onClick={() => {
              setActive(i);
              setPaused(true);
              setTimeout(() => setPaused(false), 8000);
            }}
          />
        ))}
      </div>
    </div>
  );
}

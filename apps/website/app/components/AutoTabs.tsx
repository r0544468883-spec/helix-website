'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface AutoTabsProps {
  tabs: Tab[];
  /** Auto-switch interval in ms (default: 4000) */
  interval?: number;
  className?: string;
}

export default function AutoTabs({ tabs, interval = 4000, className = '' }: AutoTabsProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % tabs.length);
    }, interval);
  }, [tabs.length, interval]);

  useEffect(() => {
    if (!paused) startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, startTimer]);

  const handleClick = (index: number) => {
    setActive(index);
    setPaused(true);
    // Resume auto-play after 10 seconds of no interaction
    setTimeout(() => setPaused(false), 10000);
  };

  return (
    <div className={`auto-tabs ${className}`}>
      <div className="auto-tabs__nav" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            className={`auto-tabs__tab ${active === i ? 'auto-tabs__tab--active' : ''}`}
            onClick={() => handleClick(i)}
          >
            {tab.icon && <span className="auto-tabs__icon">{tab.icon}</span>}
            <span>{tab.label}</span>
            {active === i && (
              <span className="auto-tabs__progress" style={{ animationDuration: `${interval}ms` }} />
            )}
          </button>
        ))}
      </div>
      <div className="auto-tabs__content" role="tabpanel">
        {tabs[active].content}
      </div>
    </div>
  );
}

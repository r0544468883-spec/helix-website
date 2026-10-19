'use client';

// Lightweight anonymous view beacon for the hosted GEO report.
// - Generates/reads a random visitorId in localStorage (not PII).
// - Posts a 'view' event on mount.
// - Watches [data-track-section] wrappers with an IntersectionObserver and posts a
//   throttled 'progress' event carrying the furthest section reached + max scroll %.
// - Posts a 'leave' event with dwell time on tab-hide / unload via sendBeacon.
// Fails silently: analytics must never break the report for the reader.

import { useEffect } from 'react';
import { SECTION_ORDER } from '@/lib/report-sections';

const VISITOR_KEY = 'helix_geo_visitor';

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `v-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    // Private mode / storage blocked: fall back to an ephemeral id.
    return `v-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }
}

const ORDER = SECTION_ORDER as readonly string[];

export default function Track({ token }: { token: string }) {
  useEffect(() => {
    const visitorId = getVisitorId();
    const mountedAt = Date.now();

    let maxScrollPct = 0;
    let furthestIdx = -1;
    let furthestSection: string | null = null;
    let progressTimer: ReturnType<typeof setTimeout> | null = null;
    let lastSentIdx = -1;

    function post(
      type: 'view' | 'progress' | 'leave',
      extra: { section?: string; maxScrollPct?: number; dwellMs?: number },
    ) {
      const payload = JSON.stringify({ token, type, visitorId, ...extra });
      try {
        if (type === 'leave' && typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon('/api/r-track', new Blob([payload], { type: 'application/json' }));
          return;
        }
      } catch {
        // fall through to fetch
      }
      fetch('/api/r-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }

    // 1. View.
    post('view', {});

    // 2. Section depth via IntersectionObserver over [data-track-section] wrappers.
    function computeScrollPct(): number {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return 100;
      return Math.max(0, Math.min(100, Math.round((window.scrollY / scrollable) * 100)));
    }

    function sendProgress() {
      progressTimer = null;
      if (furthestIdx === lastSentIdx && maxScrollPct < 100) return;
      lastSentIdx = furthestIdx;
      post('progress', {
        section: furthestSection ?? undefined,
        maxScrollPct,
      });
    }

    function scheduleProgress() {
      const pct = computeScrollPct();
      if (pct > maxScrollPct) maxScrollPct = pct;
      if (progressTimer) return;
      progressTimer = setTimeout(sendProgress, 1500);
    }

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-track-section]'),
    );

    let observer: IntersectionObserver | null = null;
    if (sections.length > 0 && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const key = entry.target.getAttribute('data-track-section') || '';
            const idx = ORDER.indexOf(key);
            if (idx > furthestIdx) {
              furthestIdx = idx;
              furthestSection = key;
            }
          }
          scheduleProgress();
        },
        { threshold: 0.4 },
      );
      for (const el of sections) observer.observe(el);
    }

    function onScroll() {
      const pct = computeScrollPct();
      if (pct > maxScrollPct) {
        maxScrollPct = pct;
        scheduleProgress();
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // 3. Leave: dwell time on tab-hide / unload.
    let left = false;
    function sendLeave() {
      if (left) return;
      left = true;
      post('leave', {
        section: furthestSection ?? undefined,
        maxScrollPct,
        dwellMs: Date.now() - mountedAt,
      });
    }
    function onVisibility() {
      if (document.visibilityState === 'hidden') sendLeave();
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', sendLeave);
    window.addEventListener('beforeunload', sendLeave);

    return () => {
      if (progressTimer) clearTimeout(progressTimer);
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', sendLeave);
      window.removeEventListener('beforeunload', sendLeave);
    };
  }, [token]);

  return null;
}

'use client';

import { useEffect } from 'react';

/**
 * Counts a view by running, not by being requested: link-preview robots fetch the
 * HTML and run no script, so they never post. The route decides the rest (a draft,
 * a signed-in team member). A failure changes nothing on the page.
 * See DESIGN.md §9 — Counting a view.
 */
export default function QuoteViewBeacon({ token }: { token: string }) {
  useEffect(() => {
    fetch(`/api/q/${encodeURIComponent(token)}/view`, { method: 'POST', keepalive: true }).catch(() => {});
  }, [token]);
  return null;
}

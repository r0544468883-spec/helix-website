'use client';

import { useEffect, useState } from 'react';
import { THEME_COOKIE, THEME_EVENT, themeFrom, type Theme } from '@/lib/theme';

/**
 * Switches the open page at once (no reload) and keeps the choice in a cookie for the
 * next load, which the server reads. If the browser refuses the cookie, the open page
 * still switches and the next load is light again: nothing breaks, so nothing is
 * reported. Used by the profile menu's theme item. See DESIGN.md §9 — Nav.
 */
export function applyTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
}

/**
 * The current theme on the client. `initial` is what the server rendered, so the
 * first render matches the HTML; after mount it reads <html data-theme> and follows
 * the switch's event. For code that cannot style itself with tokens, such as React
 * Flow's `colorMode`.
 */
export function useTheme(initial: Theme = 'light'): Theme {
  const [theme, setTheme] = useState<Theme>(initial);
  useEffect(() => {
    setTheme(themeFrom(document.documentElement.dataset.theme));
    const onChange = (e: Event) => setTheme(themeFrom((e as CustomEvent<string>).detail));
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);
  return theme;
}

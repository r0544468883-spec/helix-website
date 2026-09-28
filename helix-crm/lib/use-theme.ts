'use client';

import { useEffect, useState } from 'react';
import { THEME_EVENT, themeFrom, type Theme } from '@/lib/theme';

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

'use client';

import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getDict } from '@/lib/i18n';
import { THEME_COOKIE, THEME_EVENT, type Theme } from '@/lib/theme';

/**
 * Light or dark. The press flips <html data-theme> at once (no reload) and keeps
 * the choice in a cookie for the next page load, which the server reads. If the
 * browser refuses the cookie, the open page still switches and the next load is
 * light again: nothing breaks, so nothing is reported. The name says what the
 * switch turns ON. See DESIGN.md §9 — Nav.
 */
export default function ThemeToggle({ locale, initial }: { locale: string; initial: Theme }) {
  const t = getDict(locale).shell;
  const [theme, setTheme] = useState<Theme>(initial);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    setTheme(next);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
  }

  const label = theme === 'dark' ? t.themeLight : t.themeDark;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-[10px] text-ink-secondary hover:text-ink hover:bg-ink/5 transition-colors"
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}

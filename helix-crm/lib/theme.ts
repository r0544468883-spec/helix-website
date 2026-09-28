// The CRM's theme: light by default, dark by choice (Eran, 2026-09-28). The choice
// lives in a cookie so the server can render <html data-theme> and a page arrives
// already in its theme, with no flash of the other one. Server-safe: the root
// layout and the nav read it; lib/use-theme.ts follows it on the client.
// See DESIGN.md §2.

export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'crm-theme';

/** Fired on window when the switch changes the theme, with the new theme as detail. */
export const THEME_EVENT = 'crm-theme';

/** Anything but an explicit "dark" is the default: light. */
export function themeFrom(value: string | null | undefined): Theme {
  return value === 'dark' ? 'dark' : 'light';
}

export const SITE = {
  name: 'HELIX.',
  domain: 'helix.co.il',
  url: 'https://helix.co.il',
  email: 'eran@helix.co.il',
  defaultTitle: 'HELIX. — פיתוח וצמיחה לעסקים ישראלים',
  titleTemplate: '%s | HELIX.',
  defaultDescription:
    'חברת פיתוח-וצמיחה שעובדת אחרת. מבטיחים פחות, מספקים יותר, מדברים כל שבוע. פיתוח, שיווק אורגני, וקמפיינים תחת קורת גג אחת.',
  defaultOgImage: '/og-default.png',
  locale: 'he_IL',
  twitterHandle: '@helix_il',
} as const;

export type NavLink = {
  href: string;
  label: string;
  /** Pages where this link should appear "active". For anchor links, the homepage. */
  activeOn?: string;
};

export const NAV_LINKS: NavLink[] = [
  { href: '/#capabilities', label: 'מה אנחנו עושים' },
  { href: '/#paths', label: 'שירותים' },
  { href: '/#faq', label: 'שו"ת' },
  { href: '/articles', label: 'מאמרים', activeOn: '/articles' },
  { href: '/podcast', label: 'פודקאסט', activeOn: '/podcast' },
  { href: '/#about', label: 'אודות' },
];

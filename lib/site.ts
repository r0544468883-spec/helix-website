export const SITE = {
  name: 'HELIX.',
  domain: 'helix.co.il',
  url: 'https://helix.co.il',
  email: 'eran@helix.co.il',
  accessibilityEmail: 'service@helix.co.il',
  calendlyUrl: 'https://calendly.com/eranlipi/new-meeting',
  whatsappNumber: '972525447209',
  whatsappMessage: 'שלום ערן, ראיתי את helix.co.il ורציתי לשאול שאלה',
  vibeCodeWhatsappGroup: 'https://chat.whatsapp.com/GCR97CJQrunHCqYbRzc0FO?mode=gi_t',
  phone: '+972-52-544-7209',
  foundingDate: '2026',
  slogan: 'מבטיחים פחות. מספקים יותר. עושים תיאום ציפיות.',
  defaultTitle: 'HELIX. — פיתוח וצמיחה לעסקים ישראלים',
  titleTemplate: '%s | HELIX.',
  defaultDescription:
    'חברת פיתוח-וצמיחה שעובדת אחרת. מבטיחים פחות, מספקים יותר, עושים תיאום ציפיות. פיתוח, שיווק אורגני, וקמפיינים תחת קורת גג אחת.',
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
  { href: '/#packages', label: 'חבילות' },
  { href: '/services/marketing', label: 'שיווק דיגיטלי' },
  { href: '/services/websites', label: 'אתרים' },
  { href: '/services/automation', label: 'אוטומציה' },
  { href: '/services/growth', label: 'Growth' },
  { href: '/services/sales', label: 'מכירות' },
  { href: '/services/tools', label: 'תוכנות' },
  { href: '/services/development', label: 'פיתוח' },
  { href: '/#faq', label: 'שו"ת' },
  { href: '/#about', label: 'אודות' },
];

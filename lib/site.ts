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
  // TODO(Eran): קבוצת WhatsApp לסדנת "משתמשים ראשונים". ריק = כפתור ההצטרפות מוסתר במסך התודה.
  firstUsersWhatsappGroup: '',
  phone: '+972-52-544-7209',
  foundingDate: '2026',

  // ── פרטי חברה משפטיים ─────────────────────────────────────────
  // TODO(Eran): מלא את השם הרשום ומספר ח.פ / ע.מ. ריק = לא מוצג בפוטר ובסכמה.
  company: {
    legalName: '', // לדוגמה: 'הליקס בע״מ' או 'ערן ליפשטיין — עוסק מורשה'
    businessId: '', // מספר ח.פ / ע.מ
  },

  // ── כתובת עסקית ───────────────────────────────────────────────
  // TODO(Eran): מלא כתובת. שדות ריקים לא מוצגים (ובסכמה יורד addressCountry בלבד).
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: 'IL',
  },

  // ── רשתות חברתיות ─────────────────────────────────────────────
  // TODO(Eran): הדבק URL מלא לכל פרופיל פעיל. ריק = הלינק לא מופיע בפוטר/בסכמה.
  social: {
    linkedin: 'https://www.linkedin.com/in/eranlipi/',
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    x: '', // Twitter/X
  },

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
  /** External link — opens in a new tab. */
  external?: boolean;
  /** Show a badge next to the label, e.g. a blinking "מומלץ" star or a "COMING SOON" pill. */
  badge?: 'recommended' | 'soon';
};

export type NavGroup = {
  title: string;
  /** Optional link for the group title (e.g. the products hub). */
  href?: string;
  items: NavLink[];
};

/** Services mega-menu — grouped by customer goal (Style 1). */
export const NAV_SERVICES: NavGroup[] = [
  {
    title: 'נכסים דיגיטליים',
    items: [
      { href: '/services/websites', label: 'בניית אתרים' },
      { href: '/services/ecommerce', label: 'איקומרס' },
      { href: '/services/development', label: 'פיתוח' },
      { href: '/services/automation', label: 'אוטומציות ובוטים' },
    ],
  },
  {
    title: 'שיווק וצמיחה',
    items: [
      { href: '/services/marketing', label: 'שיווק דיגיטלי' },
      { href: '/services/growth', label: 'Growth hacking', badge: 'recommended' },
      { href: '/services/sales-consulting', label: 'מכירות ופיתוח עסקי' },
      { href: '/ai-checker', label: 'בדיקת GEO בחינם', activeOn: '/ai-checker', badge: 'soon' },
    ],
  },
];

/** התוכנות של HELIX — תפריט עליון עצמאי (הכותרת מקשרת לדף התוכנות). */
export const NAV_PRODUCTS: NavGroup = {
  title: 'התוכנות של HELIX',
  href: '/products',
  items: [
    { href: '/products/marketing-ops', label: 'HELIX Marketing OPS' },
    { href: '/products/dashboards', label: 'HELIX Dashboards' },
    { href: '/products/sdr', label: 'HELIX SDR' },
    { href: '/products/geo', label: 'HELIX GEO' },
    { href: '/products/reputation', label: 'HELIX Reputation' },
    { href: '/products/assistant', label: 'HELIX Assistant' },
    { href: '/products/growth-doctor', label: 'HELIX Growth Doctor' },
    { href: '/products/forms', label: 'HELIX Forms' },
  ],
};

/** Content hub dropdown — articles, podcast, Q&A. */
export const NAV_CONTENT: NavLink[] = [
  { href: '/articles', label: 'מאמרים' },
  { href: '/podcast', label: 'פודקאסט' },
  { href: '/#faq', label: 'שאלות ותשובות' },
];

/** סטארטאפים ויזמים — תפריט עליון עצמאי (הכותרת מקשרת ל-hub). */
export const NAV_STARTUPS: NavGroup = {
  title: 'סטארטאפים ויזמים',
  href: '/startups',
  items: [
    { href: '/startups/growth-hacking', label: 'Growth Hacking' },
    { href: '/startups/business-development', label: 'פיתוח עסקי' },
    { href: '/startups/marketing', label: 'שיווק דיגיטלי' },
    { href: '/startups/market-entry', label: 'חדירה לשווקים חדשים' },
    { href: '/startups/readiness', label: 'בדיקת מוכנות למיזם', badge: 'soon' },
    { href: '/startups/stage', label: 'HELIX STAGE · חינם' },
  ],
};

/** Top-level simple links (rendered between the dropdowns). */
export const NAV_LINKS: NavLink[] = [
  { href: '/#packages', label: 'חבילות' },
  { href: '/#about', label: 'אודות' },
];

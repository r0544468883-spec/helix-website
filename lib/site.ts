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
    legalName: '', // לדוגמה: 'הליקס בע״מ' או 'ערן ליפשטיין, עוסק מורשה'
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
  defaultTitle: 'HELIX. פיתוח וצמיחה לעסקים ישראלים',
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
  /** External link, opens in a new tab. */
  external?: boolean;
  /** Show a badge next to the label, e.g. a blinking "מומלץ" star or a "COMING SOON" pill. */
  badge?: 'recommended' | 'soon';
};

export type NavGroup = {
  title: string;
  /** Optional link for the group title (e.g. the products hub). */
  href?: string;
  /** Optional emoji rendered (via EmojiIcon) before the group title. */
  icon?: string;
  items: NavLink[];
};

/** Services mega-menu, grouped by customer goal (Style 1). */
export const NAV_SERVICES: NavGroup[] = [
  {
    title: 'נכסים דיגיטליים',
    items: [
      { href: '/services/development', label: 'פיתוח' },
      { href: '/services/automation', label: 'אוטומציות ובוטים' },
    ],
  },
  {
    title: 'שיווק וצמיחה',
    items: [
      { href: '/services/growth', label: 'Growth hacking', badge: 'recommended' },
      { href: '/services/sales-consulting', label: 'מכירות ופיתוח עסקי' },
      { href: '/services/ai-consulting', label: 'ליווי והטמעת AI', badge: 'recommended' },
      { href: '/ai-checker', label: 'בדיקת GEO בחינם', activeOn: '/ai-checker', badge: 'soon' },
    ],
  },
];

/** מוצר הדגל — מערכת הניהול הכללית, מוצג בראש תפריט התוכנות בהדגשה. */
export const NAV_PRODUCTS_FLAGSHIP: NavLink = {
  href: '/products/chief',
  label: 'HELIX CHIEF · מערכת הניהול הכללית',
};

/** מוצר חינם מודגש — שורה נפרדת ישירות מתחת ל-CHIEF. */
export const NAV_PRODUCTS_FREE: NavLink = {
  href: '/products/crm',
  label: 'HELIX CHIEF CRM',
};

/** התוכנות של HELIX, תפריט עליון עצמאי (הכותרת מקשרת לדף התוכנות). */
export const NAV_PRODUCTS: NavGroup = {
  title: 'התוכנות של HELIX',
  href: '/products',
  items: [],
};

/** המוצרים מחולקים למחלקות פונקציונליות — כל אחת "סאב-הדר" משלה במגה-מניו. */
export const NAV_PRODUCTS_DEPARTMENTS: NavGroup[] = [
  {
    title: 'מכירות והכנסות',
    icon: '💰',
    items: [
      { href: '/products/sdr', label: 'HELIX SDR' },
      { href: '/products/shop', label: 'HELIX Shop' },
    ],
  },
  {
    title: 'שיווק וצמיחה',
    icon: '📈',
    items: [
      { href: '/products/marketing-ops', label: 'HELIX Marketing OPS' },
      { href: '/products/geo', label: 'HELIX GEO' },
      { href: '/products/growth-doctor', label: 'HELIX Growth Doctor' },
      { href: '/products/reputation', label: 'HELIX Reputation' },
    ],
  },
  {
    title: 'תפעול ונתונים',
    icon: '⚙️',
    items: [
      { href: '/products/meeting', label: 'Helix meeting and recording' },
      { href: '/products/forms', label: 'HELIX Forms' },
      { href: '/products/assistant', label: 'HELIX Assistant' },
      { href: '/products/dashboards', label: 'HELIX Dashboards' },
      { href: '/products/website-maintenance', label: 'HELIX Website Maintenance' },
    ],
  },
];

/** קטגוריות-תחום — מוצר ייעודי + שאר הכלים שמתאימים לאותו תחום (מדרגי לעוד תחומים). */
export const NAV_PRODUCTS_VERTICALS: NavGroup[] = [
  {
    title: 'לחנויות איקומרס',
    icon: '🛍️',
    href: '/solutions/ecommerce',
    items: [
      { href: '/products/shop', label: 'HELIX Shop' },
      { href: '/products/growth-doctor', label: 'Growth Doctor · המרות ועגלה' },
      { href: '/products/geo', label: 'GEO · קידום מוצרים' },
      { href: '/products/dashboards', label: 'Helix ecommerce dashboards' },
      { href: '/products/store-maintenance', label: 'HELIX Ecommerce Maintenance' },
    ],
  },
];

/** Content hub dropdown, articles, podcast, Q&A. */
export const NAV_CONTENT: NavLink[] = [
  { href: '/articles', label: 'מאמרים' },
  { href: '/podcast', label: 'פודקאסט' },
  { href: '/#faq', label: 'שאלות ותשובות' },
];

/** סטארטאפים ויזמים, תפריט עליון עצמאי (הכותרת מקשרת ל-hub). */
export const NAV_STARTUPS: NavGroup = {
  title: 'סטארטאפים ויזמים',
  href: '/startups',
  items: [
    { href: '/startups/growth-hacking', label: 'Growth Hacking', badge: 'recommended' },
    { href: '/startups/business-development', label: 'פיתוח עסקי · BDR/SDR', badge: 'recommended' },
    { href: '/startups/market-entry', label: 'חדירה לשווקים חדשים' },
    { href: '/startups/readiness', label: 'בדיקת מוכנות למיזם', badge: 'soon' },
    { href: '/startups/stage', label: 'HELIX STAGE · חינם', badge: 'soon' },
  ],
};

/** בדיקות חינם לנכסים דיגיטליים, תפריט עליון עצמאי. הקישורים נשארים גם במיקומם המקורי
 * (GEO תחת שירותים, מוכנות תחת סטארטאפים), כאן הם מרוכזים יחד. */
export const NAV_CHECKS: NavGroup = {
  title: 'בדיקות חינם',
  items: [
    { href: '/ai-checker', label: 'בדיקת GEO, נראות ב-AI', activeOn: '/ai-checker', badge: 'soon' },
    { href: '/startups/readiness', label: 'בדיקת מוכנות למיזם', activeOn: '/startups/readiness', badge: 'soon' },
    { href: '/free-tools/content', label: 'בדיקת תוכן, פוסטים ומיילים', activeOn: '/free-tools/content', badge: 'soon' },
    { href: '/free-tools/ai-context', label: 'אבחון AI לעסק, דוח בשלות', activeOn: '/free-tools/ai-context', badge: 'soon' },
  ],
};

/** Top-level simple links (rendered between the dropdowns). */
export const NAV_LINKS: NavLink[] = [
  { href: '/#packages', label: 'חבילות' },
  { href: '/#about', label: 'אודות' },
];

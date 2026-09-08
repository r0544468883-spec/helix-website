export type CaseStudyMetric = { v: string; l: string };
export type CaseStudyStep = { n: string; t: string; d: string };

export type CaseStudy = {
  slug: string;
  track: 'marketing' | 'sales';
  eyebrow: string;
  title: string;
  company: string;
  heroImage: string;
  summary: string;
  metrics: CaseStudyMetric[];
  challenge: string[];
  process: CaseStudyStep[];
  consolidation: { title: string; text: string; items: string[] };
  quote: { text: string; role: string };
  relatedHref: string;
  relatedLabel: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'saas-15-tools-to-hubspot',
    track: 'marketing',
    eyebrow: 'Case Study · הנדסת משפך שיווק',
    title: 'מ-15 תוכנות מפוזרות, לכל השיווק בתוך HubSpot',
    company: 'חברת SaaS גלובלית · 80 עובדים',
    heroImage: '/case-studies/marketing-hero.png',
    summary:
      'חברת SaaS גלובלית בת 80 עובדים הגיעה אלינו עם כאב מוכר: השיווק והמכירות היו מפוזרים על 15 תוכנות שונות. ה-CRM היה HubSpot, אבל סביבו התרוצצו גיליונות, כלי העשרה נפרד, אוטומציה בכלי אחר, ניקוד ידני ודיווח שנשבר בין המערכות. לידים דלפו, ה-handoff בין שיווק למכירות היה שבור, ולא הייתה אמת אחת.',
    metrics: [
      { v: '15→1', l: 'מ-15 תוכנות לפלטפורמה אחת' },
      { v: '48 שעות', l: 'SLA לכל SQL שעובר למכירות' },
      { v: '40/30/30', l: 'מודל ניקוד: התנהגות / ICP / כוונה' },
      { v: '100%', l: 'מתפעול השיווק רץ בתוך HubSpot' },
    ],
    challenge: [
      '15 תוכנות מנותקות, בלי מקור אמת אחד',
      'ניקוד לידים ידני ולא עקבי',
      'העשרה ודאטה מפוזרים, עם כפילויות',
      'handoff שבור בין שיווק למכירות',
      'אין attribution אמין, אי אפשר לדעת מה מחזיר',
    ],
    process: [
      { n: '01', t: 'הנדסה לאחור', d: 'מיפינו את הטקטיקות בעלות ה-ROI הגבוה ואת מסע הליד מקצה לקצה, לפני שנגענו בכלי.' },
      { n: '02', t: 'איחוד סיגנלים', d: 'ריכזנו את אותות הכוונה (התנהגות, אתר, אירועים) לזרם אחד, כולל ניקוי UTM וניתוח סמנטי של דפי כוונה.' },
      { n: '03', t: 'מודל Lifecycle', d: 'הגדרנו שלבים מוסכמים: Subscriber ← Lead ← MQL ← SQL, עם קריטריון מעבר ברור לכל שלב.' },
      { n: '04', t: 'מודל ניקוד', d: 'ציון מורכב: 40% התנהגות, 30% התאמה ל-ICP, 30% כוונת רכישה. רק ליד שעובר את הסף ממשיך.' },
      { n: '05', t: 'ניתוב ו-SLA', d: 'ניתוב Round-robin אוטומטי עם SLA של 48 שעות, והתראה כשליד יושב בלי טיפול.' },
      { n: '06', t: 'העשרה ואוטומציה', d: 'Clay waterfall (LinkedIn, Apollo) לגודל חברה, תפקיד וסיגנלים, ו-nurture אוטומטי לפי שלב.' },
      { n: '07', t: 'איכות דאטה', d: 'dedup לילי, שדות חובה, חסימת כפילויות וסנכרון דו-כיווני מקורי מול ה-CRM.' },
    ],
    consolidation: {
      title: 'ואז איחדנו את הכל לתוך HubSpot',
      text: 'הבנו שרוב 15 הכלים כבר מיותרים. HubSpot Marketing Hub של היום מריץ נייטיב את מה שפעם דרש חמישה כלים נפרדים. העברנו את כל תפעול השיווק פנימה, והשארנו רק בסט-אוף-בריד בודד (כמו Clay להעשרה) מחובר בסנכרון מקורי. פחות רישיונות, פחות נקודות כשל, ואמת אחת.',
      items: [
        'אימייל ו-Nurture Workflows', 'ניקוד לידים (Lead Scoring)', 'רשימות וסגמנטציה',
        'טפסים ודפי נחיתה', 'קמפיינים ומעקב Campaign', 'Smart Content ופרסונליזציה',
        'סושיאל ו-Ads', 'SEO, בלוג ותוכן', 'ABM ו-Target Accounts',
        'Attribution רב-מגע (U/W/full-path)', 'דשבורדים ודיווח', 'סנכרון דו-כיווני ל-CRM',
      ],
    },
    quote: {
      text: 'לראשונה אנחנו יודעים איזה קמפיין באמת מייצר pipeline, והכל יושב במקום אחד. הפסקנו לנחש.',
      role: 'סמנכ״לית שיווק, חברת SaaS גלובלית',
    },
    relatedHref: '/services/gtm-engineering/marketing',
    relatedLabel: 'לשירות GTM Engineering לשיווק',
  },
  {
    slug: 'ai-saas-outbound-engine',
    track: 'sales',
    eyebrow: 'Case Study · הנדסת משפך מכירה',
    title: 'מ-outbound ידני למנוע pipeline שרץ לבד',
    company: 'חברת SaaS בתחום ה-AI · צוות מכירות מתרחב',
    heroImage: '/case-studies/sales-hero.png',
    summary:
      'חברת AI צומחת רצתה pipeline יזום בלי לנפח את צוות ה-SDR. ה-outbound היה ידני, הרשימות התיישנו, והמענה לאינבאונד היה איטי. הנדסנו מנוע outbound מבוסס סיגנלים על Clay ועל ה-CRM: סוכני AI שחוקרים חשבונות ברצף, מעשירים, מנקדים ומנתבים, כך שכל נציג עובד רק על מה שחם.',
    metrics: [
      { v: '<5 דק׳', l: 'speed-to-lead לאינבאונד' },
      { v: '+50%', l: 'SQL מוכשרים למכירות' },
      { v: '×2', l: 'reply rate ב-cold outbound' },
      { v: '0', l: 'מחקר חשבונות ידני, הכל אוטומטי' },
    ],
    challenge: [
      'outbound ידני שלא מתרחב עם הצוות',
      'רשימות מתיישנות בלי סיגנלים טריים',
      'מענה איטי לאינבאונד, לידים חמים מתקררים',
      'נציגים מבזבזים שעות על מחקר חשבונות',
      'אין ניתוב חכם, כל אחד עובד אחרת',
    ],
    process: [
      { n: '01', t: 'Signal Watchlist', d: 'הגדרנו אותות קנייה (גיוסים, funding, טכנולוגיות, job changes) ובנינו רשימת מעקב חיה לחשבונות היעד.' },
      { n: '02', t: 'העשרת Waterfall', d: 'Clay מושך מ-LinkedIn, Apollo, ZoomInfo ו-Lusha ברצף, למקסימום כיסוי של מיילים, טלפונים ופרטי חברה.' },
      { n: '03', t: 'סוכני מחקר AI', d: 'סוכני AI חוקרים כל חשבון ברצף, מסכמים הקשר וכותבים פתיח מותאם, במקום שעות מחקר ידני.' },
      { n: '04', t: 'ניקוד וניתוב', d: 'ניקוד לפי fit וכוונה, וניתוב Round-robin עם SLA. רק לידים חמים מגיעים לנציג הנכון.' },
      { n: '05', t: 'Speed-to-Lead', d: 'אינבאונד חם מקבל מענה תוך פחות מ-5 דקות דרך אוטומציה, במקום שעות של המתנה.' },
      { n: '06', t: 'Outbound בסקייל', d: 'רצפים רב-ערוציים מותאמים אישית שרצים לבד, עם A/B ומעקב reply, בלי לנפח את הצוות.' },
      { n: '07', t: 'סנכרון ודיווח', d: 'הכל מסונכרן ל-CRM עם דשבורד pipeline, כך שההנהלה רואה מה עובד בזמן אמת.' },
    ],
    consolidation: {
      title: 'המנוע: Clay + CRM, רץ לבד',
      text: 'במקום צוות שמחפש, מעתיק ומדביק, המנוע רץ מסביב לשעון. סוכני AI חוקרים ומעשירים, המערכת מנקדת ומנתבת, והנציגים מתעסקים רק בשיחות ובסגירות. הכל מחובר ל-CRM בסנכרון מקורי.',
      items: [
        'Signal watchlist חי', 'העשרת Waterfall', 'סוכני מחקר AI',
        'ניקוד fit + כוונה', 'ניתוב Round-robin + SLA', 'Speed-to-lead אוטומטי',
        'רצפים רב-ערוציים', 'A/B ומעקב reply', 'סנכרון דו-כיווני ל-CRM',
      ],
    },
    quote: {
      text: 'הצוות הפסיק לחפש והתחיל למכור. המנוע מביא לנו חשבונות חמים כל בוקר, מוכנים לשיחה.',
      role: 'VP Sales, חברת SaaS בתחום ה-AI',
    },
    relatedHref: '/services/gtm-engineering/sales',
    relatedLabel: 'לשירות GTM Engineering למכירות',
  },
];

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

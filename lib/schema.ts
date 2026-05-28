import { SITE } from './site';

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

const personEran = {
  '@type': 'Person',
  name: 'Eran Lipshtain',
  alternateName: 'ערן ליפשטיין',
  jobTitle: 'מייסד ומפתח מוביל',
  worksFor: { '@id': ORG_ID },
  knowsAbout: [
    'פיתוח תוכנה',
    'Node.js',
    'React',
    'eCommerce',
    'AI',
    'OCR',
    'GCP',
  ],
  alumniOf: [
    { '@type': 'Organization', name: 'Groupon Israel' },
    { '@type': 'Organization', name: 'JobMaster.co.il' },
  ],
};

const personRon = {
  '@type': 'Person',
  name: 'Ron Kali',
  alternateName: 'רון קלי',
  jobTitle: 'שותף — פיתוח עסקי ושיווק',
  worksFor: { '@id': ORG_ID },
  knowsAbout: ['פיתוח עסקי', 'שיווק', 'מכירות', 'אוטומציה', 'AI'],
};

const services = [
  {
    name: 'Helix Audit',
    description:
      'אבחון מקיף של מוצר, שיווק, פאנל ו-data. מסמך עם תמונת מצב ו-3 פעולות מתועדפות לפי ROI. למי שיודע שמשהו לא עובד אבל לא בטוח מה.',
  },
  {
    name: 'Helix Launch',
    description:
      'ביצוע פרויקט ממוקד: השקת מוצר, פיצ׳ר חדש, פתיחת קמפיין מ-0, או מיגרציה. אפיון כתוב לפני התחלה וסטטוס שבועי לכל אורך הדרך.',
  },
  {
    name: 'Helix Grow',
    description:
      'רטיינר חודשי במעטפת מלאה — פיתוח, שיווק אורגני, וקמפיינים ממומנים תחת קורת גג אחת. שיחת סטטוס שבועית ודוחות חודשיים עם מספרים אמיתיים.',
  },
];

export const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: 'HELIX.',
  alternateName: 'Helix',
  url: SITE.url,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE.url}/favicon.svg`,
  },
  email: SITE.email,
  telephone: SITE.phone,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IL',
  },
  areaServed: { '@type': 'Country', name: 'Israel' },
  foundingDate: SITE.foundingDate,
  slogan: SITE.slogan,
  description: SITE.defaultDescription,
  knowsAbout: [
    'פיתוח תוכנה',
    'פיתוח אתרים',
    'אפליקציות מובייל',
    'שיווק אורגני',
    'SEO',
    'קמפיינים ממומנים',
    'Google Ads',
    'Meta Ads',
    'אסטרטגיית צמיחה',
    'Go-to-Market',
    'AI',
    'OCR',
    'eCommerce',
  ],
  founder: [personEran, personRon],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'שירותי Helix',
    itemListElement: services.map((s) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: s.name,
        description: s.description,
        provider: { '@id': ORG_ID },
        areaServed: { '@type': 'Country', name: 'Israel' },
      },
    })),
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE.url,
  name: SITE.name,
  description: SITE.defaultDescription,
  inLanguage: 'he-IL',
  publisher: { '@id': ORG_ID },
};

export type Crumb = { name: string; url: string };

export function breadcrumbSchema(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

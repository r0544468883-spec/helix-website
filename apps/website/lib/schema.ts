import { SITE } from './site';

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

const personEran = {
  '@type': 'Person',
  name: 'Eran Lipshtain',
  alternateName: 'ערן ליפשטיין',
  jobTitle: 'מייסד ומפתח מוביל',
  worksFor: { '@id': ORG_ID },
  ...(SITE.social.linkedin ? { sameAs: [SITE.social.linkedin] } : {}),
  knowsAbout: [
    'פיתוח תוכנה',
    'Node.js',
    'React',
    'אוטומציה עסקית',
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
  jobTitle: 'שותף, פיתוח עסקי ומכירות',
  worksFor: { '@id': ORG_ID },
  knowsAbout: ['פיתוח עסקי', 'מכירות', 'אוטומציה', 'CRM', 'AI'],
};

const services = [
  {
    name: 'Helix Audit',
    description:
      'אבחון מקיף של התהליכים, המערכות והדאטה בעסק. מסמך עם תמונת מצב ו-3 פעולות מתועדפות לפי ROI. למי שיודע שמשהו לא עובד אבל לא בטוח מה.',
  },
  {
    name: 'Helix Launch',
    description:
      'ביצוע פרויקט ממוקד: מערכת חדשה, סוכן AI, אוטומציה של תהליך, או מיגרציה. אפיון כתוב לפני התחלה וסטטוס שבועי לכל אורך הדרך.',
  },
  {
    name: 'Helix Grow',
    description:
      'רטיינר חודשי, אוטומציות, סוכני AI ופיתוח שוטף תחת קורת גג אחת. שיחת סטטוס שבועית ודוחות חודשיים עם מספרים אמיתיים.',
  },
];

// Build a PostalAddress with only the fields that are filled in.
const postalAddress = {
  '@type': 'PostalAddress',
  addressCountry: SITE.address.country || 'IL',
  ...(SITE.address.city ? { addressLocality: SITE.address.city } : {}),
  ...(SITE.address.street ? { streetAddress: SITE.address.street } : {}),
  ...(SITE.address.postalCode ? { postalCode: SITE.address.postalCode } : {}),
};

// sameAs, every social profile that's actually set.
const sameAs = Object.values(SITE.social).filter(Boolean);

export const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: 'HELIX.',
  alternateName: 'Helix',
  ...(SITE.company.legalName ? { legalName: SITE.company.legalName } : {}),
  ...(SITE.company.businessId ? { taxID: SITE.company.businessId } : {}),
  url: SITE.url,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE.url}/favicon.svg`,
  },
  email: SITE.email,
  telephone: SITE.phone,
  address: postalAddress,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: SITE.phone,
      email: SITE.email,
      contactType: 'sales',
      areaServed: 'IL',
      availableLanguage: ['he', 'en'],
    },
    {
      '@type': 'ContactPoint',
      email: SITE.accessibilityEmail,
      contactType: 'נגישות',
      areaServed: 'IL',
      availableLanguage: ['he'],
    },
  ],
  ...(sameAs.length ? { sameAs } : {}),
  areaServed: { '@type': 'Country', name: 'Israel' },
  foundingDate: SITE.foundingDate,
  slogan: SITE.slogan,
  description: SITE.defaultDescription,
  knowsAbout: [
    'פיתוח תוכנה',
    'אפליקציות מובייל',
    'אוטומציה עסקית',
    'סוכני AI',
    'צ׳אטבוטים',
    'אינטגרציות מערכות',
    'n8n',
    'CRM',
    'Growth Hacking',
    'AI',
    'OCR',
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

// ── Reusable FAQPage, feeds Google rich results AND answer engines (AEO). ──
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// ── Service schema for a /services/* page. ──
export function serviceSchema(opts: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    ...(opts.serviceType ? { serviceType: opts.serviceType } : {}),
    url: `${SITE.url}${opts.path}`,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Israel' },
    inLanguage: 'he-IL',
  };
}

// Pull the first integer out of a Hebrew price line ("החל מ-199 ₪" → 199).
// "חינם" / no digits → undefined (offer omitted).
function parsePrice(price?: string): number | undefined {
  if (!price) return undefined;
  const digits = price.replace(/[^\d]/g, '');
  return digits ? Number(digits) : undefined;
}

// ── SoftwareApplication schema for a /products/* page. ──
// Answer engines cite products by name + price + capability; this hands them that on a plate.
export function softwareApplicationSchema(opts: {
  name: string;
  description: string;
  path: string;
  price?: string;
  category?: string;
}) {
  const low = parsePrice(opts.price);
  const isFree = opts.price ? /חינם|free/i.test(opts.price) : false;
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    description: opts.description,
    url: `${SITE.url}${opts.path}`,
    applicationCategory: opts.category || 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: 'he-IL',
    provider: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    ...(low || isFree
      ? {
          offers: {
            '@type': 'Offer',
            price: isFree ? 0 : low,
            priceCurrency: 'ILS',
            ...(low && !isFree ? { description: 'מחיר התחלתי לחודש' } : {}),
          },
        }
      : {}),
  };
}

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

// Content-machine page schema (methodology §7): gives compare / use-cases /
// playbook / trust a full Article node with dateModified (freshness signal) +
// speakable (AEO: lift the H1 + answer-first TL;DR) + graph links, matching what
// /articles/* already emits. Date is a constant string (static-export safe).
export function contentPageSchema(opts: {
  name: string;
  description: string;
  path: string;
  datePublished?: string;
  wordCount?: number;
}) {
  const url = `${SITE.url}${opts.path}`;
  const date = opts.datePublished ?? '2026-08-19';
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.name,
    description: opts.description,
    inLanguage: 'he-IL',
    datePublished: date,
    dateModified: date,
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.article-tldr'] },
  };
}

// Count words across a set of strings (real count from the rendered text, so the
// wordCount schema value is honest, never a fabricated number).
export function countWords(...parts: (string | string[] | undefined)[]): number {
  const text = parts.flat().filter(Boolean).join(' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}

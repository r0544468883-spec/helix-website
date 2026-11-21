import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import UniqueOfferClient from './UniqueOfferClient';

export const metadata: Metadata = {
  title: 'ערב הכרה לבעלי עסקים · שיווק, אוטומציה ובינה מלאכותית | HELIX',
  description:
    'אירוע חינם לבעלי עסקים קטנים בצפון, יום שלישי 1.12.2026 בשעה 17:00. הרצאה של רון קלי על שיווק ובינה מלאכותית, ייעוץ אישי וכיבוד. מספר המקומות מוגבל.',
  alternates: { canonical: '/unique-offer' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ערב הכרה לבעלי עסקים · שיווק, אוטומציה ובינה מלאכותית',
    description:
      'אירוע חינם בצפון, יום שלישי 1.12.2026 בשעה 17:00. הרצאה, ייעוץ אישי וכיבוד. מספר המקומות מוגבל, שריינו מקום.',
    url: '/unique-offer',
    type: 'website',
    locale: 'he_IL',
    images: ['/opengraph-image'],
  },
};

const faqs = [
  { q: 'כמה עולה להשתתף?', a: 'הכניסה חינם לגמרי. מספר המקומות מוגבל, אז כדאי להירשם מראש.' },
  { q: 'איפה זה בדיוק?', a: 'האירוע ייערך בצפון. המיקום המדויק יישלח לנרשמים בהודעה לפני האירוע.' },
  { q: 'למי האירוע מתאים?', a: 'לכל בעל עסק קטן או עצמאי שרוצה להביא יותר לקוחות בעזרת שיווק, אוטומציה ובינה מלאכותית. לא צריך רקע טכני.' },
  { q: 'מה אני מקבל חוץ מההרצאה?', a: 'ייעוץ אישי 1-על-1 בשיווק, באוטומציה ובכניסה למנועי ה-AI. בנוסף, כיבוד וכיוון מעשי להתחיל איתו כבר למחרת.' },
  { q: 'צריך להביא משהו או להתכונן?', a: 'לא. בואו כמו שאתם. אם בא לכם, תחשבו מראש על אתגר שיווקי אחד שתרצו להתייעץ עליו.' },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'ערב הכרה לבעלי עסקים: שיווק, אוטומציה ובינה מלאכותית',
  startDate: '2026-12-01T17:00:00+02:00',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  description:
    'אירוע חינם לבעלי עסקים קטנים בצפון. הרצאה של רון קלי על שיווק ובינה מלאכותית, ייעוץ אישי בשיווק, באוטומציה ובכניסה למנועי הבינה המלאכותית, וכיבוד קל. מספר המקומות מוגבל.',
  location: {
    '@type': 'Place',
    name: 'צפון (המיקום המדויק יישלח לנרשמים)',
    address: { '@type': 'PostalAddress', addressRegion: 'צפון', addressCountry: 'IL' },
  },
  organizer: { '@type': 'Organization', name: 'HELIX', url: SITE.url },
  performer: {
    '@type': 'Person',
    name: 'רון קלי',
    jobTitle: 'מרצה בכיר לשיווק ובינה מלאכותית',
    image: `${SITE.url}/ron-keli-speaker.jpg`,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'ILS',
    availability: 'https://schema.org/InStock',
    url: `${SITE.url}/unique-offer`,
    validFrom: '2026-11-20T00:00:00+02:00',
  },
};

export default function UniqueOfferPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          eventJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'ערב הכרה לבעלי עסקים', url: `${SITE.url}/unique-offer` },
          ]),
        ]}
      />
      <UniqueOfferClient />
    </>
  );
}

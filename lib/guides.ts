// Single source of truth for the free-guide series (/guides/*).
// Each guide is one entry here + its PDF in public/guides/. The landing page,
// its <metadata>, the NAV "מדריכים חינם" rubric, and the PDF download header in
// next.config all read from this list, so a new guide is one object + one PDF.
//
// To add a guide:
//   1. Produce the branded PDF via the helix-pptx pipeline (real screenshots),
//      save it to public/guides/<slug>-guide.pdf (+ optional <slug>-cover.png).
//   2. Add an entry below.
//   3. Add the PDF path to DOWNLOAD_PDFS in next.config.mjs (forces download +
//      Hebrew filename).
//   4. Create app/guides/<slug>/page.tsx (3 lines, see chatgpt-ads).
//   5. Add it to NAV_GUIDES in lib/site.ts.

export type GuideConfig = {
  /** URL slug: /guides/<slug>. */
  slug: string;
  /** Small pill above the H1. */
  badge: string;
  /** Hero headline. */
  h1: string;
  /** Hero sub-headline. */
  sub: string;
  /** "מה יש בפנים" bullet list. */
  inside: string[];
  /** Optional trust line under the list (GuidePage has a default). */
  trust?: string;
  /** Public path to the guide PDF. */
  pdfUrl: string;
  /** Hebrew download filename. */
  pdfName: string;
  /** WhatsApp prefilled message for the "already ready" CTA. */
  waText: string;
  /** SEO/OG metadata. */
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    /** OG image path (defaults handled by the page if omitted). */
    cover?: string;
  };
};

export const GUIDES: GuideConfig[] = [
  {
    slug: 'chatgpt-ads',
    badge: 'מתנה מהילדים הטובים של עולם הדיגיטל',
    h1: 'פרסום ב-ChatGPT: המדריך המעשי לעסק הישראלי',
    sub: 'הפרסום הממומן ב-ChatGPT הגיע לישראל. קבלו את התהליך המלא, מא׳ עד ת׳, עם צילומי מסך אמיתיים ומספרים אמיתיים, לפני שכולם נכנסים והמחיר עולה.',
    inside: [
      'התהליך המלא, מבדיקת robots.txt ועד קמפיין שרץ ונמדד.',
      'צילומי מסך אמיתיים מכל שלב בממשק ה-Ads Manager.',
      'איך כותבים Context Hints שבאמת מביאים לקוחות (עם דוגמאות).',
      'המספרים האמיתיים: תקציב מינימלי, עלויות ו-benchmarks.',
      'מפרטי הקריאייטיב: אורך כותרת, תמונה, וטון שמנצח.',
      '3 הטעויות ששורפות תקציב, ואיך להימנע מהן.',
    ],
    pdfUrl: '/guides/chatgpt-ads-guide.pdf',
    pdfName: 'הליקס - מדריך לממומן ב-ChatGPT.pdf',
    waText: 'היי, ראיתי את המדריך על פרסום ב-ChatGPT ואשמח לשמוע עוד',
    meta: {
      title: 'מדריך פרסום ב-ChatGPT לעסק הישראלי, חינם',
      description:
        'המדריך המעשי לפרסום ממומן ב-ChatGPT: התהליך המלא מ-robots.txt ועד קמפיין רץ ומדוד, עם צילומי מסך אמיתיים, תקציב, עלויות ו-benchmarks. הורדה חינם, בלי ספאם.',
      ogTitle: 'פרסום ב-ChatGPT: המדריך המעשי לעסק הישראלי',
      ogDescription: 'התהליך המלא, מא׳ עד ת׳, עם צילומי מסך אמיתיים ומספרים אמיתיים. הורדה חינם.',
      cover: '/guides/chatgpt-ads-cover.png',
    },
  },
];

export const getGuide = (slug: string): GuideConfig | undefined =>
  GUIDES.find((g) => g.slug === slug);

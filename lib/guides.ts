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
  /** Optional explainer video shown in the hero (a short clip about the guide). Served
   *  from /public. Omit to render the hero without a video. */
  videoUrl?: string;
  /** Optional community step shown AFTER the lead submits, BEFORE the download button:
   *  the flow becomes details → join the community → download. Backward-compatible: guides
   *  without it skip straight to the download in the success state. */
  community?: {
    heading: string;
    sub: string;
    ctaLabel: string;
    /** WhatsApp group invite URL (chat.whatsapp.com/...). */
    url: string;
    /** Why-to-join value points, rendered as a list in the dedicated community section.
     *  These sell the reason to join (learn / ask / network / belong), not just "join". */
    benefits?: string[];
  };
  /** Optional funnel CTA shown after "what's inside" — the next step the guide points to
   *  (e.g. the free GEO check, then the managed service). Backward-compatible: guides
   *  without it render exactly as before. */
  funnel?: {
    heading: string;
    sub: string;
    ctaLabel: string;
    ctaHref: string;
    note?: string;
  };
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
    slug: 'business-hub',
    badge: 'חדש · נובמבר 2026',
    h1: 'ChatGPT Business Hub: המדריך לרשום את העסק שלך בתוך ChatGPT',
    sub: 'OpenAI השיקה פרופיל עסקי בתוך ChatGPT. קבלו את המדריך המלא: איך תובעים, מה מקבלים, מה המגבלות, ומה באמת גורם ל-AI להמליץ עליכם (ולא רק לרשום אתכם).',
    inside: [
      'מה זה Business Hub ומה בדיוק מקבלים (וי כחול, אנליטיקס, נציג AI).',
      'הקאטץ׳ שחשוב לדעת: תביעת הפרופיל לא מבטיחה המלצה, ולמה.',
      'איך תובעים, צעד אחר צעד, כולל אימות דומיין ו-Persona.',
      'מה באמת אפשר מישראל היום, ומה עוד חסום.',
      'איך קוראים את הנתונים (וה-מלכודת: ריק אינו אפס).',
      'מה שבאמת מזיז: עבודת GEO שהופכת אתכם ממומלצים, לא רק רשומים.',
    ],
    pdfUrl: '/guides/business-hub-guide.pdf',
    pdfName: 'הליקס - מדריך ChatGPT Business Hub.pdf',
    videoUrl: '/guides/business-hub-video.mp4',
    waText: 'היי, ראיתי את המדריך על ChatGPT Business Hub ואשמח לשמוע עוד',
    community: {
      heading: 'הבית לעסקים קטנים',
      sub: 'לא עוד קבוצת וואטסאפ, אלא בית שלם וחינמי לבעלי עסקים קטנים ועצמאים: קהילה חיה יחד עם ארגז כלים אמיתי שגדל כל הזמן.',
      ctaLabel: 'להצטרפות לבית, חינם ←',
      url: 'https://chat.whatsapp.com/HzVX17qdgkZIq4FVwIaS7s',
      benefits: [
        'ספריית סקילים ענקית, 300+ סוכני AI מוכנים לעסק שלכם.',
        'מערכת CRM חינמית, ועוד כלים חינמיים לניהול העסק.',
        'מיניסייט אישי לכל חבר בקהילה.',
        'איזור אישי עם מאגר תכנים שגדל ומתעדכן כל הזמן.',
        'שאלות ותשובות וקהילה חיה של בעלי עסקים, לא לבד.',
      ],
    },
    funnel: {
      heading: 'השלב הבא: איפה אתם היום?',
      sub: 'הפרופיל הוא המינימום. כדי לדעת אם ה-AI בכלל מכיר, מציג וממליץ עליכם, הריצו את בדיקת ה-GEO החינמית שלנו, 2 דקות, בלי כרטיס אשראי, מול 4 מנועי AI.',
      ctaLabel: 'לבדיקת ה-GEO החינמית ←',
      ctaHref: '/ai-checker',
      note: 'מהבדיקה אפשר להמשיך לליווי GEO מנוהל לעסקים קטנים, החל מ-2,500 ₪ לחודש.',
    },
    meta: {
      title: 'מדריך ChatGPT Business Hub לעסק הישראלי, חינם',
      description:
        'המדריך המלא ל-ChatGPT Business Hub: איך תובעים ומאמתים פרופיל עסקי בתוך ChatGPT, מה מקבלים, מה המגבלות, מה אפשר מישראל, ואיך באמת גורמים ל-AI להמליץ עליכם. הורדה חינם, בלי ספאם.',
      ogTitle: 'ChatGPT Business Hub: המדריך לעסק הישראלי',
      ogDescription: 'איך תובעים פרופיל עסקי בתוך ChatGPT, מה המגבלות, ומה באמת מזיז. הורדה חינם.',
      cover: '/guides/business-hub-cover.png',
    },
  },
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

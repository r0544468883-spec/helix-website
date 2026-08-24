// Learn Hub — hub-and-spoke clusters over the existing articles (methodology §2).
// This file ONLY groups slugs + cluster framing; article content stays in
// app/articles/articles-data.ts. Each cluster = one pillar article + its spokes,
// a coined category term we own, and one signature-diagram concept (§3.2, §3.4).
// The pillar's slug must exist in ARTICLES; spokeSlugs must exist in ARTICLES.

export type Cluster = {
  id: string;
  title: string;         // the cluster's head topic (Hebrew)
  coinedTerm: string;    // the category term we define + own (methodology §3.2)
  intro: string;         // answer-first framing shown at the top of the group
  diagram: string;       // one-line signature-diagram concept reused across the cluster
  pillarSlug: string;    // the pillar article (head term)
  spokeSlugs: string[];  // long-tail spokes, each links back to the pillar
};

export const CLUSTERS: Cluster[] = [
  {
    id: 'agentic-ai',
    title: 'שכבת ה-AI שמבצעת',
    coinedTerm: 'צוות סוכנים',
    intro:
      'תוכנה שלא נותנת לכם רשימת מטלות אלא מבצעת אותן, מאחוריה צוות סוכנים שמתכנן, עושה, ומבקר שפוסל לפני שמשהו יוצא. כאן מוסבר איך זה עובד ולמה זה שונה מצ׳אטבוט.',
    diagram: 'בקשה, תכנון, ביצוע, מבקר שפוסל, תוצאה, בלולאה עד שהמשימה נגמרת.',
    pillarSlug: 'agentic-ai-layer',
    spokeSlugs: ['agent-symphony-hallucinations', 'helix-chief-agent', 'ai-agents-bd', 'ai-marketing-tools', 'ai-content-human', 'hebrew-ocr'],
  },
  {
    id: 'growth-loops',
    title: 'לולאות צמיחה',
    coinedTerm: 'לולאת שיווק',
    intro:
      'משפך שיווק נגמר בכל לקוח מחדש. לולאה מזינה את עצמה: כל לקוח מביא את הבא. כאן מוסבר איך בונים לולאות שצומחות לבד, במקום לשרוף תקציב על פאנל שדולף.',
    diagram: 'לקוח נכנס, מפעיל אות, האות מביא לקוח נוסף, הלולאה מאיצה את עצמה.',
    pillarSlug: 'marketing-loop-vs-funnel',
    // 6 spokes (even = balanced 3+3 grid, no orphan row).
    spokeSlugs: ['budget-loop', 'viral-loop', 'plg-small-business', 'cohort-retention', 'rule-of-seven-growth-hacking', 'reading-a-campaign'],
  },
  {
    id: 'gtm-israel',
    title: 'חדירה לשוק הישראלי',
    coinedTerm: 'ראש-גשר',
    intro:
      'לא מנצחים את כולם ביום אחד. בוחרים שוק ראשון צר שאפשר לנצח בו במלואו, ומשם מתרחבים. כאן תוכנית חדירה לשוק לעסק ישראלי, בלי לשרוף תקציב.',
    diagram: 'שוק צר ראשון, ניצחון מלא בו, הרחבה לשוק הסמוך, וחוזר חלילה.',
    pillarSlug: 'gtm-israel',
    // 6 spokes (even 3+3). attribution sits here: knowing where customers come from is core to market entry.
    spokeSlugs: ['beachhead-market', 'icp-target-audience', 'attribution-explained', 'project-spec-guide', 'dev-and-marketer-not-talking', 'transparent-pricing'],
  },
  {
    id: 'bi-dashboards',
    title: 'דשבורדים וקריאת נתונים',
    coinedTerm: 'שבעת המדדים',
    intro:
      'מנכ״ל לא סובל ממחסור בנתונים, הוא סובל מעודף. כאן מוסבר איך בוחרים מעט מדדים שמנבאים ולא רק מתעדים, בונים דשבורד שנטען לבד בלי אנליסט, ומחליטים בין כלי BI ותיק למערכת מבוססת AI.',
    diagram: 'מקורות (סליקה, CRM, הנהלת חשבונות), נמשכים לבד, מורכבים לשבעה מדדים, מתריעים כשמשהו חורג.',
    pillarSlug: 'ceo-kpi-dashboard',
    // 2 spokes (even). product-anchored cluster for HELIX Dashboards.
    spokeSlugs: ['bi-dashboard-without-analyst', 'power-bi-alternative'],
  },
  {
    id: 'cro-retention',
    title: 'להפסיק לדלוף: המרה ושימור',
    coinedTerm: 'הדלי המחורר',
    intro:
      'רוב העסקים רצים להביא עוד תנועה, בזמן ש-70% מהגולשים נוטשים ורבע מהלקוחות דולפים מאחורה. כאן מוסבר איך סותמים את החורים בדלי: מזהים איפה נוטשים, מתקנים את ההמרה, ושומרים על הלקוחות שכבר יש.',
    diagram: 'תנועה נכנסת מהברז, נוטשת דרך חורי המשפך, נשארת נוטשת בנטישה, מה שנשאר בדלי הוא הרווח.',
    pillarSlug: 'conversion-rate-optimization-guide',
    // 2 spokes (even). product-anchored cluster for HELIX Growth Doctor.
    spokeSlugs: ['funnel-drop-off-analysis', 'retention-vs-acquisition'],
  },
  {
    id: 'sdr-outbound',
    title: 'סוכן פיתוח מכירות',
    coinedTerm: 'חלוקת עבודה',
    intro:
      'רוב עבודת ה-SDR היא מחקר ופנייה חוזרת, לא מכירה. כאן מוסבר איך סוכן AI לוקח את השכבה הזו בקנה מידה, איך מעשירים לידים כדי שבכלל יהיה למי לפנות, וכמה זה עולה מול נציג אנושי.',
    diagram: 'הגדרת לקוח אידיאלי, איתור לידים, העשרה ודירוג, פנייה ראשונה בקנה מידה, מסירה לאדם לסגירה.',
    pillarSlug: 'ai-sdr-lead-automation',
    // 2 spokes (even). product-anchored cluster for HELIX SDR.
    spokeSlugs: ['lead-enrichment-guide', 'sdr-cost-human-vs-ai'],
  },
  {
    id: 'social-presence',
    title: 'נוכחות ברשתות',
    coinedTerm: 'עקביות על מערכת',
    intro:
      'עמודים קופאים כי נוכחות נשענת על כוח רצון שנגמר. כאן מוסבר איך אוטומציה מחזיקה נוכחות עקבית בלי צוות, איך מודדים איזה תוכן באמת מביא לקוחות (ולא רק לייקים), ואיך גורמים ל-AI לכתוב בקול שלכם.',
    diagram: 'הכנה מרוכזת, תזמון אוטומטי, מדידת פעולה (לא לייקים), קול מותג עקבי, נוכחות שלא קופאת.',
    pillarSlug: 'social-media-automation',
    // 2 spokes (even). product-anchored cluster for HELIX OPS.
    spokeSlugs: ['social-content-roi', 'brand-voice-ai'],
  },
  {
    id: 'geo-search',
    title: 'להיות מצוטט ב-AI',
    coinedTerm: 'תשובה אחת',
    intro:
      'החיפוש עובר מרשימת קישורים לתשובה אחת מנוסחת. כאן מוסבר מה זה GEO ובמה הוא שונה מ-SEO, למה האתר שלכם לא ב-AI Overviews, ואיזו שכבה טכנית (סכמה, llms.txt) גורמת למכונה להבין ולצטט אתכם.',
    diagram: 'שאלה למנוע AI, המנוע שולף מקורות ברורים ומבוססים, מנסח תשובה אחת, אתם בפנים או בחוץ.',
    pillarSlug: 'geo-vs-seo',
    // 2 spokes (even). product-anchored cluster for HELIX Rank.
    spokeSlugs: ['ai-overviews-visibility', 'llms-txt-schema-guide'],
  },
  {
    id: 'esign-forms',
    title: 'חתימה וטפסים חכמים',
    coinedTerm: 'מסלול ביקורת',
    intro:
      'חתימה דיגיטלית מוכרת בחוק בישראל ולרוב חזקה יותר מנייר. כאן מוסבר מה חוקי ומה תקף בבית משפט, איך טופס חכם מקצר סגירת חוזה, ואיך בוחרים כלי חתימה שמתאים לעסק ישראלי קטן.',
    diagram: 'מסמך, נשלח בקישור, נחתם על המסך בכל מכשיר, מסלול ביקורת מתעד מי ומתי, עותק חתום לשניהם.',
    pillarSlug: 'digital-signature-legal-israel',
    // 2 spokes (even). product-anchored cluster for HELIX Sign & Forms.
    spokeSlugs: ['smart-forms-business', 'docusign-alternative'],
  },
  {
    id: 'meeting-intelligence',
    title: 'מודיעין פגישות',
    coinedTerm: 'פגישה שלא מתאדה',
    intro:
      'פגישות מתאדות: ההחלטות נשכחות ואיש לא בטוח מי אחראי. כאן מוסבר איך סיכום אוטומטי הופך שיחה להחלטות ומשימות, למה תמלול בעברית קשה ואיך בכל זאת מדייקים, וכמה זמן אפשר להחזיר מפגישות מיותרות.',
    diagram: 'פגישה, תמלול בעברית, זיקוק להחלטות ומשימות עם אחראים, אין צורך בפגישת המשך רק כדי לזכור.',
    pillarSlug: 'ai-meeting-summary',
    // 2 spokes (even). product-anchored cluster for HELIX Meeting.
    spokeSlugs: ['hebrew-meeting-transcription', 'meeting-productivity'],
  },
  {
    id: 'crm-agent',
    title: 'CRM שמנהל את עצמו',
    coinedTerm: 'מפסיבי ליזום',
    intro:
      'CRM קלאסי טוב בדיוק כמו המשמעת שלכם לעדכן אותו, ולכן הוא מתיישן. כאן מוסבר מה עסק קטן באמת צריך ממערכת לקוחות, מתי HubSpot גדול עליכם, ואיך סוכן CRM הופך את המערכת מארון תיוק פסיבי לשותף שבא אליכם.',
    diagram: 'ליד נכנס, הסוכן מעדכן לבד, מזהה עסקה תקועה, מזכיר, מציע צעד, שום לקוח לא נופל.',
    pillarSlug: 'free-crm-small-business',
    // 2 spokes (even). product-anchored cluster for HELIX CRM / CHIEF.
    spokeSlugs: ['hubspot-alternative', 'ai-crm-agent'],
  },
  {
    id: 'ecommerce-agent',
    title: 'סוכן מכירות לחנות',
    coinedTerm: 'שעת מכירה',
    intro:
      'רוב המכירות באתר נופלות על שאלה שלא נענתה בזמן ועל עגלות שננטשו. כאן מוסבר איך סוכן AI סוגר עסקאות 24/7, משחזר עגלות נטושות, ומחלק נכון בין שירות אוטומטי לרגעים שדורשים אדם.',
    diagram: 'לקוח נכנס, שאלה נענית מיד, היסוס מזוהה, עגלה שננטשה משוחזרת, רגע רגיש עובר לאדם.',
    pillarSlug: 'sales-chatbot-website',
    // 2 spokes (even). product-anchored cluster for HELIX SHOP.
    spokeSlugs: ['reduce-cart-abandonment-agent', 'ai-customer-service-ecommerce'],
  },
  {
    id: 'behavior-intent',
    title: 'התנהגות וכוונה',
    coinedTerm: 'להקשיב להתנהגות',
    intro:
      'לא כל מבקר שווה אותו דבר, וההתנהגות מסגירה מי חם. כאן מוסבר איך מזהים כוונת רכישה מאותות, איך אוספים דאטה בעולם שאחרי העוגיות, ואיך הופכים אות התנהגותי לפעולה אוטומטית שמגיעה ברגע הנכון.',
    diagram: 'מבקר מייצר אות, הכוונה מוערכת, דאטה מגוף ראשון נאספת, פעולה אוטומטית מגיבה כשהכוונה חמה.',
    pillarSlug: 'purchase-intent-signals',
    // 2 spokes (even). product-anchored cluster for HELIX PIXEL.
    spokeSlugs: ['cookieless-first-party-data', 'behavioral-automation'],
  },
  {
    id: 'startup-growth',
    title: 'צמיחת סטארטאפ',
    coinedTerm: 'הפצה היא חלק מהמוצר',
    intro:
      'מוצר טוב לא מפיץ את עצמו. כאן מוסבר איך משיגים משתמשים ראשונים בלי תקציב, איך יודעים באמת שהגעתם ל-product market fit, ואיך בונים waitlist ויראלי שמגייס את עצמו עוד לפני ההשקה.',
    diagram: 'גיוס ידני ראשון, מיקוד ערוץ אחד, לולאה שמזינה את עצמה, מדידת PMF, האצה.',
    pillarSlug: 'startup-distribution-no-budget',
    // 2 spokes (even). product-anchored cluster for HELIX STAGE.
    spokeSlugs: ['product-market-fit-guide', 'viral-waitlist'],
  },
];

export const getCluster = (id: string): Cluster | undefined => CLUSTERS.find((c) => c.id === id);

// The slug of the cluster a given article belongs to (for back-links from spokes).
export function clusterOfSlug(slug: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.pillarSlug === slug || c.spokeSlugs.includes(slug));
}

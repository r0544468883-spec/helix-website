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
];

export const getCluster = (id: string): Cluster | undefined => CLUSTERS.find((c) => c.id === id);

// The slug of the cluster a given article belongs to (for back-links from spokes).
export function clusterOfSlug(slug: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.pillarSlug === slug || c.spokeSlugs.includes(slug));
}

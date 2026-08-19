import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';

export const metadata: Metadata = {
  title: 'מילון מושגים, שיווק, צמיחה ופיתוח עסקי',
  description:
    'מילון מושגים בעברית למונחי שיווק, growth ופיתוח עסקי: ראש-גשר, ICP, לולאת שיווק, משפך, attribution, קוהורט, PLG, churn ועוד. הגדרות קצרות בעברית פשוטה.',
  alternates: { canonical: '/glossary' },
  openGraph: {
    title: 'מילון מושגים, שיווק, צמיחה ופיתוח עסקי | HELIX.',
    description:
      'הגדרות בעברית פשוטה למונחי שיווק, growth ופיתוח עסקי, ראש-גשר, ICP, לולאת שיווק, משפך, attribution, קוהורט, PLG ועוד.',
    url: '/glossary',
    type: 'website',
  },
};

type Term = {
  term: string;
  en?: string;
  definition: string;
  /** slug of the article that expands on this term. */
  article?: string;
};

const TERMS: Term[] = [
  {
    term: 'שכבת AI שפועלת',
    en: 'Agentic AI / Autonomous AI Layer',
    definition:
      'שכבת בינה מלאכותית שיושבת מעל המערכות הקיימות (CRM, פרסום, אתר, אנליטיקס), מבינה את ההקשר המלא ופועלת בעצמה, לא רק ממליצה. בניגוד לכלי שמחכה שתפעיל אותו, היא יזומה: מזהה מה שמתחיל להידרדר ובאה אליך. זה הכיוון שאליו מערכות תוכנה מתקדמות היום.',
    article: 'agentic-ai-layer',
  },
  {
    term: 'מתג אוטונומיה',
    en: 'Autonomy Switch',
    definition:
      'מנגנון בטיחות שקובע כמה חופש לתת ל-AI לכל סוג פעולה, בשלוש רמות: יועץ (רק ממליץ), מאשר (מכין את הפעולה ואתה מאשר בלחיצה), ואוטופיילוט (עושה לבד ומדווח). ברירת המחדל בטוחה, ופעולות שמוציאות כסף או יוצאות ללקוחות דורשות אישור מפורש.',
    article: 'agentic-ai-layer',
  },
  {
    term: 'ראש-גשר',
    en: 'Beachhead',
    definition:
      'פלח שוק צר אחד שבו מחליטים לנצח לגמרי לפני שנוגעים בשאר השוק. במקום לפזר תקציב על "כולם", מרכזים הכל בקבוצה מוגדרת, כובשים אותה, ומשם מתרחבים.',
    article: 'beachhead-market',
  },
  {
    term: 'ICP, פרופיל הלקוח האידיאלי',
    en: 'Ideal Customer Profile',
    definition:
      'תיאור חד של סוג הלקוח שמפיק מהמוצר הכי הרבה ערך, משלם, נשאר וממליץ. בניגוד ל"קהל יעד" רחב, ה-ICP מספיק חד כדי לפסול לקוחות שלא מתאימים.',
    article: 'icp-target-audience',
  },
  {
    term: 'GTM, תוכנית חדירה לשוק',
    en: 'Go-to-Market',
    definition:
      'ההחלטות הקונקרטיות של איך מביאים מוצר ללקוחות משלמים: למי מוכרים קודם, מה אומרים, באילו ערוצים, באיזה מחיר, ואיך מודדים אם זה עובד.',
    article: 'gtm-israel',
  },
  {
    term: 'משפך (פאנל)',
    en: 'Funnel',
    definition:
      'המסלול שהלקוח עובר מהחשיפה הראשונה ועד הרכישה: מודעות, עניין, שקילה, החלטה. מודל ליניארי שעוזר לראות איפה אנשים נושרים בדרך.',
    article: 'marketing-loop-vs-funnel',
  },
  {
    term: 'לולאת שיווק / לולאת צמיחה',
    en: 'Marketing / Growth Loop',
    definition:
      'מבנה מעגלי שבו הפלט של לקוח אחד (המלצה, תוכן, שיתוף, נתונים) הופך לקלט שמביא את הלקוח הבא. בניגוד למשפך שדולף, לולאה צוברת תאוצה בלי להזרים עוד תקציב.',
    article: 'marketing-loop-vs-funnel',
  },
  {
    term: 'לולאה ויראלית',
    en: 'Viral Loop',
    definition:
      'מנגנון שבו כל משתמש קיים מביא משתמשים חדשים כחלק מהשימוש הרגיל במוצר (הזמנה, קובץ משותף, תוצר גלוי), לא כטובה שמבקשים ממנו.',
    article: 'viral-loop',
  },
  {
    term: 'מקדם ויראלי',
    en: 'k-factor',
    definition:
      'כמה משתמשים חדשים מביא בממוצע כל משתמש קיים. גם k מתחת ל-1 מוריד דרמטית את עלות הרכישה, כי כל שקל שהושקע ממשיך לייצר משתמשים.',
    article: 'viral-loop',
  },
  {
    term: 'PLG, צמיחה מובלת מוצר',
    en: 'Product-Led Growth',
    definition:
      'מודל שבו המוצר עצמו הוא ערוץ הרכישה: המשתמש נכנס, מתנסה, מגיע לרגע הערך, ומשלם, בלי איש מכירות. מתאים לעסקאות קטנות שאדם אחד מחליט עליהן.',
    article: 'plg-small-business',
  },
  {
    term: 'רגע הערך',
    en: 'Aha Moment',
    definition:
      'הרגע שבו המשתמש מבין בבטן, לא בראש, למה המוצר שווה לו, כי חווה את התועלת בעצמו. מוצר שמוכר את עצמו בונה הכל כדי לקצר את הדרך אליו.',
    article: 'plg-small-business',
  },
  {
    term: 'הפעלה',
    en: 'Activation',
    definition:
      'כמה מהנרשמים באמת הגיעו לרגע הערך והתחילו להשתמש בפועל. נרשם הוא לא לקוח, ההפעלה מודדת את ההבדל, ולרוב היא הצומת הכי משתלם לתקן.',
    article: 'plg-small-business',
  },
  {
    term: 'מדד צפון',
    en: 'North Star Metric',
    definition:
      'המספר האחד שמייצג הכי טוב את הערך שהלקוחות מקבלים, ושכל הצוות מיישר אליו קו. לא כמה נרשמו או כמה כסף נכנס, אלא כמה ערך אמיתי נצרך.',
    article: 'plg-small-business',
  },
  {
    term: 'ניתוח קוהורט',
    en: 'Cohort Analysis',
    definition:
      'קיבוץ לקוחות לפי תקופת הכניסה שלהם ומעקב אחרי כל קבוצה בנפרד לאורך זמן. חושף נטישה שקטה שממוצע כללי מסתיר, ומראה אם המוצר משתפר בהחזקת אנשים.',
    article: 'cohort-retention',
  },
  {
    term: 'שימור ונטישה',
    en: 'Retention / Churn',
    definition:
      'שימור הוא אחוז הלקוחות שנשארים בתקופה נתונה; נטישה (churn) היא אלה שעזבו. נטישה שקטה מאכלת צמיחה מבפנים, "דלי מחורר" שאי אפשר למלא בעוד תקציב.',
    article: 'cohort-retention',
  },
  {
    term: 'Attribution, ייחוס מקור',
    en: 'Attribution',
    definition:
      'לדעת איזה ערוץ, מודעה או תוכן באמת הביא לקוח משלם. כיוון שמסע לקוח נוגע בכמה נקודות, מודל "מגע אחרון" מרמה. attribution הוא מצפן להחלטות תקציב, לא מד מדויק.',
    article: 'attribution-explained',
  },
  {
    term: 'לולאת תקציב',
    en: 'Budget Loop',
    definition:
      'מנגנון שמעביר תקציב פרסום מקריאייטיבים מפסידים למנצחים באופן שיטתי, לפי סף מובהקות ומדד עסקי, במקום החלטות תקציב לפי תחושה פעם בחודש.',
    article: 'budget-loop',
  },
  {
    term: 'אדם באמצע',
    en: 'Human-in-the-loop',
    definition:
      'סוכן AI מכין (פרופיל ליד, טיוטת פנייה, נימוק), ואדם מאשר או מתקן לפני שיוצא. מקצר עבודה ידנית בלי לוותר על שיקול הדעת שמונע ספאם וטעויות.',
    article: 'ai-agents-bd',
  },
  {
    term: 'גייט הומניזציה',
    definition:
      'שער חובה שכל טקסט שנוצר ב-AI עובר לפני פרסום: עורך אנושי מזריק דוגמה אמיתית, דעה, וקצב לא סדיר, כדי שהתוכן לא יישמע כמו רובוט.',
    article: 'ai-content-human',
  },
  {
    term: 'GEO / AEO, אופטימיזציה למנועי תשובות',
    en: 'Generative / Answer Engine Optimization',
    definition:
      'לגרום ל-ChatGPT, Perplexity, Gemini ו-Google AI Overviews לצטט אתכם כשמישהו שואל שאלה. תוכן אנושי, מדויק ומבוסס-עובדות עדיף גם כאן, לא רק לקורא.',
    article: 'ai-content-human',
  },
  {
    term: 'חוק השבע',
    en: 'The Rule of Seven',
    definition:
      'עיקרון שיווקי שלפיו אדם צריך להיחשף למסר בערך שבע פעמים לפני שהוא זוכר אותו ומתחיל לשקול לפעול. הוא נגזר מהספר Successful Advertising של המפרסם הלונדוני תומאס סמית׳ מ-1885, שתיאר עד עשרים נקודות מגע עד לרכישה בפועל. הלקח: כוונת קנייה נבנית בחזרתיות, לא בחשיפה אחת.',
    article: 'rule-of-seven-growth-hacking',
  },
  {
    term: 'Growth Hacking, שיווק צמיחה',
    en: 'Growth Hacking',
    definition:
      'גישת צמיחה שבמקום לקנות כל חשיפה בתשלום, מהנדסת מערכת שמייצרת חשיפות בעלות שולית שמתקרבת לאפס, דרך תוכן, לולאות הפניה ומוצר שמשווק את עצמו. בניגוד לשיווק ממומן שהעלות שלו לינארית ונעצרת עם התקציב, growth hacking מצטבר עם הזמן, ולכן מתאים במיוחד לסטארטאפ.',
    article: 'rule-of-seven-growth-hacking',
  },
  {
    term: 'CPL, עלות לליד',
    en: 'Cost Per Lead',
    definition:
      'כמה עולה להביא פנייה אחת (טופס, השארת פרטים). זה המדד הכי קל למכור והכי קל לזייף, כי אפשר להוריד אותו כמעט לאפס במחיר של לידים חסרי ערך. לבד הוא מספר יתום; מה שקובע הוא כמה מהלידים באמת הופכים ללקוחות משלמים.',
    article: 'reading-a-campaign',
  },
  {
    term: 'CAC ו-LTV',
    en: 'Customer Acquisition Cost & Lifetime Value',
    definition:
      'CAC הוא עלות רכישת לקוח (כמה הוצאתם כדי לסגור לקוח אחד), ו-LTV הוא הערך שלו לאורך כל חייו כלקוח. היחס ביניהם הוא המבחן האמיתי אם קמפיין או ערוץ רווחיים, הרבה יותר מעלות לליד לבדה.',
    article: 'reading-a-campaign',
  },
  {
    term: 'ROAS, החזר על הוצאת פרסום',
    en: 'Return on Ad Spend',
    definition:
      'כמה הכנסה חזרה על כל שקל שהוצא על פרסום. מדד מרכזי לרווחיות קמפיין, אבל צריך למדוד אותו עד לעסקה שנסגרה ולא רק עד הטופס, אחרת הוא מטעה.',
    article: 'reading-a-campaign',
  },
  {
    term: 'עיגון מחיר (Anchoring)',
    en: 'Price Anchoring',
    definition:
      'הטיה קוגניטיבית שבה המספר הראשון שאתם שומעים הופך לעוגן שכל שאר המשא ומתן מסתובב סביבו. סוכנויות שמסתירות מחיר עושות זאת כדי לקבוע את העוגן בשיחת המכירה לטובתן; מחיר גלוי מעביר את העוגן לצד הלקוח.',
    article: 'transparent-pricing',
  },
  {
    term: 'Scope Creep, זחילת היקף',
    en: 'Scope Creep',
    definition:
      'תפיחה איטית של היקף הפרויקט בטפטוף בקשות ״קטנות״ סבירות, בלי שאף אחד שם לב. מסוכן יותר מבאג כי הוא שקוף ומתחפש לשירות טוב, עד שהפרויקט שהיה אמור לקחת חודש לוקח שלושה. נעצר עם אפיון שמגדיר מראש מה בפנים ומה בחוץ.',
    article: 'project-spec-guide',
  },
  {
    term: 'נקודת מסירה (Handoff)',
    en: 'Handoff',
    definition:
      'הנקודה שבה עבודה או אחריות עוברת מגורם אחד לאחר, למשל מהמפתח למשווק. רוב הכשלים בפרויקטים קורים בדיוק שם, כי לתפר עצמו אין בעלים. מתקנים עם מדד משותף והגדרה כתובה של מי מרים את הכדור.',
    article: 'dev-and-marketer-not-talking',
  },
  {
    term: 'OCR, זיהוי תווים אופטי',
    en: 'Optical Character Recognition',
    definition:
      'המרה אוטומטית של טקסט מתמונה או סריקה לטקסט דיגיטלי. בעברית הוא קשה יותר בגלל כיווניות (RTL), ניקוד וגופנים, ורוב השיפור בדיוק מגיע מהנדסה סביב הבעיה ולא ממודל חכם יותר.',
    article: 'hebrew-ocr',
  },
  {
    term: 'סוכן AI',
    en: 'AI Agent',
    definition:
      'תוכנה מבוססת בינה מלאכותית שמבצעת משימות בעצמה (מחקר, פנייה, פעולה במערכת), לא רק מייעצת. בפיתוח עסקי היא עושה אוטומציה של מחקר ליד ופנייה, אבל רק על תהליך שכבר הוכח ידנית, אחרת היא רק שוברת מהר יותר.',
    article: 'ai-agents-bd',
  },
  {
    term: 'HELIX CHIEF',
    en: 'HELIX CHIEF',
    definition:
      'שכבת AI (״ראש וידיים״) שיושבת מעל ה-CRM וכל מוצרי HELIX, מבינה בקשה בעברית, מתכננת את הצעדים ומבצעת דרך הסוכנים. כל הסוכנים חולקים זיכרון אחד (ה-CRM), והמשתמש שולט בכל פעולה דרך מתג האוטונומיה.',
    article: 'helix-chief-agent',
  },
  {
    term: 'אות מול רעש (Signal vs Noise)',
    en: 'Signal vs Noise',
    definition:
      'ההבחנה בין מה שבאמת מזיז מספרים (אות) לבין מה שרק מרשים או מוכר כנסים (רעש). בכלי AI לשיווק, השאלה הנכונה היא ״מה זה עושה למספרים״ ולא ״כמה AI יש בזה״.',
    article: 'ai-marketing-tools',
  },
];

export default function GlossaryPage() {
  const definedTermSet = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE.url}/glossary`,
    name: 'מילון מושגים, שיווק, צמיחה ופיתוח עסקי, HELIX',
    inLanguage: 'he-IL',
    hasDefinedTerm: TERMS.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      ...(t.en ? { alternateName: t.en } : {}),
      description: t.definition,
      inDefinedTermSet: `${SITE.url}/glossary`,
      ...(t.article ? { url: `${SITE.url}/articles/${t.article}` } : {}),
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          definedTermSet,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'מילון מושגים', url: `${SITE.url}/glossary` },
          ]),
        ]}
      />

      <section className="page-header">
        <div className="container">
          <div className="eyebrow">מילון מושגים</div>
          <h1>
            מילון המושגים של שיווק,<br />צמיחה ופיתוח עסקי.
          </h1>
          <p className="intro">
            ראש-גשר, לולאת שיווק, ICP, attribution, קוהורט. כל המונחים שאנחנו משתמשים בהם ביומיום, בהגדרה קצרה בעברית פשוטה, עם קישור למאמר שנכנס לעומק.
          </p>
        </div>
      </section>

      <section className="glossary">
        <div className="container container-narrow">
          <dl className="glossary-list">
            {TERMS.map((t) => (
              <div key={t.term} className="glossary-item" id={t.article}>
                <dt>
                  {t.term}
                  {t.en && <span className="glossary-en">{t.en}</span>}
                </dt>
                <dd>
                  {t.definition}
                  {t.article && (
                    <Link href={`/articles/${t.article}`} className="glossary-more">
                      למאמר המלא ←
                    </Link>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

import Link from 'next/link';
import { getProduct, type Product } from './products-data';

const strip = (name: string) => name.replace(/^HELIX\s*/i, '') || name;

// Rec 4 — Land & Expand cross-sell. Each recommendation is a *reasoned* pairing
// (why these two products work better together), not a generic list. The bottom
// banner always surfaces the free CRM (except on the CRM page itself).
type Pair = { slug: string; why: string };
const SYNERGY: Record<string, Pair[]> = {
  'marketing-ops': [
    { slug: 'sdr', why: 'OPS מחמם את הקהל בסושיאל, SDR סוגר את הפנייה' },
    { slug: 'geo', why: 'OPS מפיץ את התוכן, GEO דואג שתימצא אורגנית וב-AI' },
    { slug: 'dashboards', why: 'כל ביצועי הקמפיינים מתנקזים למסך אחד' },
  ],
  dashboards: [
    { slug: 'growth-doctor', why: 'Dashboards מראה מה קורה, Growth Doctor אומר איך לתקן' },
    { slug: 'marketing-ops', why: 'נתוני הקמפיינים זורמים ישר לדשבורד' },
    { slug: 'shop', why: 'כל מדדי המכירות של החנות במקום אחד' },
  ],
  sdr: [
    { slug: 'marketing-ops', why: 'OPS מחמם לידים בסושיאל לפני ש-SDR פונה אליהם' },
    { slug: 'meeting', why: 'כל פגישה ש-SDR קובע מוקלטת ומסוכמת לבד' },
    { slug: 'forms', why: 'סוגרים ליד, ומחתימים על החוזה באותו רגע' },
  ],
  geo: [
    { slug: 'marketing-ops', why: 'GEO מייצר תוכן, OPS מפיץ אותו בכל הרשתות' },
    { slug: 'reputation', why: 'GEO דוחף תוכן חיובי, Reputation שולט בתמונה בגוגל' },
    { slug: 'dashboards', why: 'רואים את הצמיחה האורגנית במספרים' },
  ],
  reputation: [
    { slug: 'geo', why: 'Reputation מנקה, GEO דוחף תוכן חיובי לראש התוצאות' },
    { slug: 'marketing-ops', why: 'מגבים את המוניטין בתוכן שוטף בסושיאל' },
    { slug: 'sdr', why: 'מוניטין נקי = יותר לידים שנסגרים' },
  ],
  assistant: [
    { slug: 'dashboards', why: 'העוזר שולף לך נתונים מהדשבורד בשאלה בעברית' },
    { slug: 'meeting', why: 'סיכומי פגישות זורמים ישר לעוזר' },
    { slug: 'forms', why: 'העוזר מכין ושולח מסמכים לחתימה' },
  ],
  'growth-doctor': [
    { slug: 'dashboards', why: 'רואים את הנתונים, ומקבלים מרשם לתיקון' },
    { slug: 'shop', why: 'פחות עגלות נטושות, יותר המרה בחנות' },
    { slug: 'marketing-ops', why: 'מתקנים את המשפך, OPS מביא עוד תנועה פנימה' },
  ],
  forms: [
    { slug: 'sdr', why: 'SDR סוגר את העסקה, Forms מחתים על החוזה' },
    { slug: 'meeting', why: 'מהפגישה ישר למסמך חתום' },
    { slug: 'shop', why: 'הזמנות ואישורים נחתמים דיגיטלית' },
  ],
  meeting: [
    { slug: 'sdr', why: 'כל פגישת מכירה מוקלטת, מסוכמת ומוזנת לפולואפ' },
    { slug: 'forms', why: 'אחרי הפגישה, חוזה לחתימה בלחיצה' },
    { slug: 'dashboards', why: 'סיגנלים מהפגישות הופכים למדדים' },
  ],
  shop: [
    { slug: 'store-maintenance', why: 'Shop מוכר, Store Maintenance שומר שהחנות לא שבורה' },
    { slug: 'growth-doctor', why: 'פחות נטישות, יותר המרה בעגלה' },
    { slug: 'dashboards', why: 'כל נתוני המכירות במסך אחד' },
  ],
  crm: [
    { slug: 'sdr', why: 'SDR ממלא את ה-CRM בלידים חמים' },
    { slug: 'meeting', why: 'סיכומי פגישות נכנסים לכרטיס הלקוח' },
    { slug: 'marketing-ops', why: 'קמפיינים שמזינים אנשי קשר חדשים' },
  ],
  chief: [
    { slug: 'crm', why: 'CHIEF יושב מעל ה-CRM ומתאם את הכל' },
    { slug: 'assistant', why: 'עוזר אישי שמבצע את מה ש-CHIEF מתכנן' },
    { slug: 'dashboards', why: 'CHIEF מציג לך את המצב במסך אחד' },
  ],
  'website-maintenance': [
    { slug: 'geo', why: 'אתר תקין ומהיר = SEO ונראות טובים יותר' },
    { slug: 'store-maintenance', why: 'אותה שמירה, גם לחנות המכירות' },
    { slug: 'dashboards', why: 'רואים תקינות וביצועים במקום אחד' },
  ],
  'store-maintenance': [
    { slug: 'shop', why: 'חנות שעובדת חלק, Shop שמוכר יותר' },
    { slug: 'website-maintenance', why: 'אותה שמירה, גם לאתר התדמית' },
    { slug: 'growth-doctor', why: 'תופסים דליפות הכנסה ומתקנים המרה' },
  ],
};

export default function ProductSynergy({ current }: { current: Product }) {
  const sibs = (SYNERGY[current.slug] || [])
    .map((p) => {
      const prod = getProduct(p.slug);
      return prod ? { prod, why: p.why } : null;
    })
    .filter((x): x is { prod: Product; why: string } => Boolean(x))
    .slice(0, 3);
  if (sibs.length === 0) return null;

  const acc = current.accent || '#10B981';
  const name = strip(current.name);
  const showCrm = current.slug !== 'crm'; // the CRM page IS the CRM

  return (
    <div className="sp-synergy" style={{ ['--acc' as string]: acc }}>
      <div className="sp-synergy-head">
        <div className="sp-synergy-eyebrow">עובד לבד, מנצח בקבוצה</div>
        <h2 className="sp-synergy-title">התחלת ב-{name}? יופי.</h2>
        <p className="sp-synergy-text">
          הנה המוצרים שעובדים הכי טוב יחד עם {name}, על אותם לקוחות ואותה דאטה.
          באיזור האישי תקבל בדיוק את ההמלצות האלה, מותאמות למה שכבר יש לך:
        </p>
      </div>

      <div className="sp-synergy-grid">
        {sibs.map(({ prod, why }) => (
          <Link
            key={prod.slug}
            href={`/products/${prod.slug}`}
            className="sp-synergy-card"
            style={{ ['--c' as string]: prod.accent || '#10B981' }}
          >
            <span className="sp-synergy-card-name">{strip(prod.name)}</span>
            <span className="sp-synergy-card-why">{why}</span>
            <span className="sp-synergy-card-go">לגלות ←</span>
          </Link>
        ))}
      </div>

      {showCrm && (
        <Link href="/products/crm" className="sp-synergy-crm">
          <span className="sp-synergy-crm-badge">חינם</span>
          <span className="sp-synergy-crm-text">
            וכל מוצרי HELIX יושבים על <b>CRM חינמי</b>, בלי הגבלת זמן. שם כל הלקוחות והדאטה נפגשים.
          </span>
          <span className="sp-synergy-crm-go">להתחיל עם ה-CRM ←</span>
        </Link>
      )}
    </div>
  );
}

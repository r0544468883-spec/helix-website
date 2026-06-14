import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import AddonsSection from '../../components/service/AddonsSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import StickyPricing from '../../components/service/StickyPricing';

export const metadata: Metadata = { title: 'אוטומציות', description: 'CRM, Email, Funnel אוטומטי. 500 ₪ לחודש.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אוטומציה')}`;

export default function AutomationPage() {
  return (
    <div className="service-page">
      <ServiceHero eyebrow="חבילה 03 · אוטומציות" title="שהמכונה תעבוד בשבילך.<br/>לא ההפך." subtitle="יש לך CRM שאף אחד לא משתמש בו? תהליכי מכירה שרצים ביד? לידים שנופלים בין הכיסאות? זה בדיוק מה שאנחנו מסדרים." marketPrice="4,000–7,000" price="500 ₪" priceNote="לחודש · מיפוי ראשוני חינם" ctaHref={wa} gradient="from-violet-950/40 via-transparent to-transparent" />

      <PainSection cards={[
        { title: 'לידים שנעלמים', text: 'מילאו טופס באתר. אף אחד לא חזר אליהם בזמן. עד שהתפנית, הם כבר סגרו עם מישהו אחר.' },
        { title: 'CRM ריק או בלאגן', text: 'קנית מערכת ב-200 דולר לחודש. אף אחד בצוות לא מזין נתונים. המערכת ריקה, ואתה חוזר לאקסל.' },
        { title: 'הכל ידני', text: 'שולח מיילים ביד, מעדכן סטטוסים ביד, עוקב אחרי לידים ביד. יש לך עסק, לא משרד דואר.' },
      ]} />

      <FeaturesSection title="מה כלול" lead="מהרגע שליד נכנס, דרך nurturing, ועד סגירה. בלי שתיגע." stats={[
        { value: 73, suffix: '%', label: 'חיסכון בעבודה ידנית' },
        { value: 3, suffix: 'x', label: 'שיפור בזמן תגובה ללידים' },
      ]} features={[
        { title: 'מיפוי תהליכים', text: 'יושבים איתך, מבינים את ה-flow, ומזהים איפה אוטומציה תחסוך הכי הרבה זמן.' },
        { title: 'הטמעת CRM + Email + Lead Nurturing', text: 'מחברים את הכלים. מגדירים את התהליכים. מוודאים שזה עובד.' },
        { title: 'Funnel אוטומטי מקצה לקצה', text: 'מהרגע שליד נכנס, דרך nurturing, ועד סגירה. אוטומטית.' },
        { title: 'מעקב ואופטימיזציה שוטפת', text: 'לא רק מקימים ועוזבים. עוקבים, מודדים, משפרים.' },
        { title: 'פגישה שבועית + דוח חודשי', text: '30 דקות כל שבוע. דוח מפורט כל חודש.' },
      ]} />

      <ForWhoSection yes={['עסקים שעושים הכל ביד ורוצים להפסיק', 'מי שיש לו CRM אבל לא משתמש בו', 'עסקים עם תהליך מכירה שחוזר על עצמו']} no={['עסקים בלי תהליך מכירה ברור', 'מי שרוצה "רק לחבר Zapier"']} />

      <AddonsSection addons={[
        { name: 'איסוף לידים ל-Google Sheets', price: '350 ₪' },
        { name: 'חיבור לידים ל-CRM (Monday, HubSpot, Pipedrive)', price: 'החל מ-650 ₪' },
        { name: 'הקמת מערכת דיוור (SendPulse)', price: '750 ₪' },
        { name: 'בניית סדרת אימיילים', price: '350 ₪ / שעה' },
      ]} />

      <TrustBar items={['בלי חוזה', 'ביטול בכל עת', 'מיפוי ראשוני חינם']} />
      <FinalCTA title="500 ₪ לחודש. אוטומציה מלאה." subtitle="שלחו הודעה בוואטסאפ. נסדר את התהליכים שלכם." ctaHref={wa} />
      <StickyPricing price="500 ₪" label="אוטומציות · לחודש" ctaHref={wa} />
    </div>
  );
}

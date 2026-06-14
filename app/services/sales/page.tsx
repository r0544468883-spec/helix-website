import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import StickyPricing from '../../components/service/StickyPricing';

export const metadata: Metadata = { title: 'תהליכי מכירה אוטומטיים', description: 'SDR אוטומטי. Data Enrichment, LinkedIn, Outreach. 500 ₪ לחודש.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על תהליכי מכירה אוטומטיים')}`;

export default function SalesPage() {
  return (
    <div className="service-page">
      <ServiceHero eyebrow="חבילה 05 · מכירות אוטומטיות" title="SDR שעובד 24/7.<br/>בלי להגדיל צוות." subtitle="לידים B2B חמים לא מגיעים מקמפיינים. הם מגיעים מ-outreach חכם, data enrichment, ו-LinkedIn. בנינו מערך שעושה את זה אוטומטית." marketPrice="8,000–15,000" price="500 ₪" priceNote="לחודש · מיפוי ICP ראשוני חינם" ctaHref={wa} gradient="from-rose-950/40 via-transparent to-transparent" />

      <PainSection cards={[
        { title: 'SDR עולה 15,000 ש׳׳ח בחודש', text: 'גייסת איש מכירות. הוא לומד 3 חודשים. מתחיל להניב. ואז עוזב. מתחילים מחדש.' },
        { title: 'Outreach ביד', text: 'שולח הודעות LinkedIn אחת אחת. 20 ביום. מתוכן 2 עונים. זה לא scalable.' },
        { title: 'אין Pipeline אמיתי', text: 'יודע שיש "כמה לידים" אבל אין מערכת שמראה לך בדיוק מה הסטטוס של כל ליד.' },
      ]} />

      <FeaturesSection title="מה כלול" lead="מערך מכירות אוטומטי שעובד בשבילך, כל יום, כל שעה." stats={[
        { value: 200, suffix: '+', label: 'הודעות outreach ביום' },
        { value: 15, suffix: 'x', label: 'יותר לידים מ-outreach ידני' },
      ]} features={[
        { title: 'אסטרטגיית מכירות דיגיטלית', text: 'מגדירים ICP, מסרים, ערוצים. יודעים למי פונים ולמה.' },
        { title: 'Data Enrichment + LinkedIn Sales Navigator', text: 'מוצאים את האנשים הנכונים, מעשירים את הנתונים, ומכינים רשימות ממוקדות.' },
        { title: 'תהליכי SDR אוטומטיים', text: 'Outreach sequences שרצים לבד. הודעות, follow-ups, תזכורות. בלי שתיגע.' },
        { title: 'ניהול Pipeline אוטומטי', text: 'CRM מסודר. כל ליד יודע איפה הוא. אתה יודע מה הצעד הבא.' },
        { title: 'פגישה שבועית + דוח חודשי', text: '30 דקות כל שבוע. דוח מפורט כל חודש.' },
      ]} />

      <ForWhoSection yes={['עסקי B2B שרוצים לידים בלי להגדיל צוות', 'יועצים ופרילנסרים שרוצים לקוחות חדשים', 'סטארטאפים בשלב מכירות ראשוניות']} no={['B2C (קהל צרכנים רחב)', 'עסקים בלי הגדרה ברורה של לקוח יעד']} />
      <TrustBar items={['בלי חוזה', 'ביטול בכל עת', 'מיפוי ICP ראשוני חינם']} />
      <FinalCTA title="500 ₪ לחודש. מערך מכירות אוטומטי." subtitle="שלחו הודעה בוואטסאפ." ctaHref={wa} />
      <StickyPricing price="500 ₪" label="מכירות אוטומטיות · לחודש" ctaHref={wa} />
    </div>
  );
}

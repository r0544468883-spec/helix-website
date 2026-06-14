import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import StickyPricing from '../../components/service/StickyPricing';

export const metadata: Metadata = { title: 'Growth Hacking', description: 'צמיחה מהירה. ניסויים, אופטימיזציה, viral loops. 500 ₪ לחודש.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על Growth Hacking')}`;

export default function GrowthPage() {
  return (
    <div className="service-page">
      <ServiceHero eyebrow="חבילה 04 · Growth Hacking" title="צמיחה שלא תלויה בתקציב.<br/>תלויה בראש." subtitle="סוכנויות שיווק זורקות כסף על קמפיינים ומקוות לטוב. אנחנו בודקים, מודדים, ומשפרים. כל שבוע ניסוי חדש, כל חודש צמיחה." marketPrice="6,000–12,000" price="500 ₪" priceNote="לחודש · אבחון צמיחה ראשוני חינם" ctaHref={wa} gradient="from-amber-950/40 via-transparent to-transparent" />

      <PainSection cards={[
        { title: 'שורפים תקציב בלי ללמוד', text: 'הוצאת 10,000 ש"ח על קמפיין. לא עבד. אף אחד לא ניתח למה. הוצאת עוד 10,000 על אותו דבר.' },
        { title: 'אין מי שמנתח את המשפך', text: 'אנשים נכנסים לאתר. חלק ממלאים טופס. חלק קונים. אבל אין לך מושג איפה אתה מפסיד את רובם.' },
        { title: 'צמיחה = עוד תקציב', text: 'כל פעם שרוצים לגדול, מגדילים תקציב. אין מנגנון צמיחה אורגני. בלי כסף, הכל עוצר.' },
      ]} />

      <FeaturesSection title="מה כלול" lead="מנגנוני צמיחה שעובדים בלי להגדיל תקציב כל חודש." stats={[
        { value: 340, suffix: '%', label: 'שיפור ממוצע בהמרות אחרי 90 יום' },
        { value: 12, label: 'ניסויי A/B בממוצע לרבעון' },
      ]} features={[
        { title: 'אסטרטגיית צמיחה מותאמת', text: 'מנתחים את העסק, מזהים הזדמנויות צמיחה, ובונים תוכנית.' },
        { title: 'ניסויי A/B ואופטימיזציית המרות', text: 'כל שבוע ניסוי. כל ניסוי מלמד משהו. המספרים עולים.' },
        { title: 'Funnel Analysis', text: 'מאיפה אנשים מגיעים, איפה הם נופלים, ומה גורם להם לסגור. עם מספרים.' },
        { title: 'Viral Loops ותוכניות Referral', text: 'מנגנונים שגורמים ללקוחות להביא עוד לקוחות. בלי שתשלם על כל אחד.' },
        { title: 'Growth Metrics ודשבורד', text: 'מספרים שחשובים, לא מספרים שנראים טוב. דשבורד שאתה באמת מסתכל עליו.' },
        { title: 'פגישה שבועית + דוח חודשי', text: '30 דקות כל שבוע. דוח מפורט כל חודש.' },
      ]} />

      <ForWhoSection yes={['סטארטאפים שרוצים לצמוח מהר בתקציב נמוך', 'עסקים שרוצים מנגנון צמיחה, לא רק קמפיין', 'מי שמוכן לנסות, למדוד, ולשפר']} no={['עסקים שרוצים "רק קמפיין בגוגל"', 'מי שלא מוכן לעבוד עם דאטה']} />
      <TrustBar items={['בלי חוזה', 'ביטול בכל עת', 'אבחון צמיחה ראשוני חינם']} />
      <FinalCTA title="500 ₪ לחודש. צמיחה אמיתית." subtitle="שלחו הודעה בוואטסאפ." ctaHref={wa} />
      <StickyPricing price="500 ₪" label="Growth Hacking · לחודש" ctaHref={wa} />
    </div>
  );
}

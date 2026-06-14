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

export const metadata: Metadata = { title: 'בניית אתרים', description: 'אתרי תדמית, דפי נחיתה, בלוגים. 500 ₪ לחודש. בלי דמי הקמה.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על בניית אתרים')}`;

export default function WebsitesPage() {
  return (
    <div className="service-page">
      <ServiceHero eyebrow="חבילה 02 · בניית אתרים" title="אתר שעובד בשבילך.<br/>לא אתר שיושב בפינה." subtitle="שילמת 12,000 ש׳׳ח על אתר שהיה 'כמעט מוכן' חודשיים? אצלנו האתר עולה לאוויר, מביא לקוחות, ונשאר חי. תחזוקה, עדכונים, וגיבויים כלולים. בלי דמי הקמה." marketPrice="8,000-15,000 חד פעמי" price="500 ₪" priceNote="לחודש · בלי דמי הקמה" ctaHref={wa} gradient="from-cyan-950/40 via-transparent to-transparent" />

      <PainSection cards={[
        { title: 'האתר "כמעט מוכן" כבר חודשיים', text: 'הספק נעלם לשבוע, חזר עם תירוצים, והחשבון עלה ב-50%. אתה עדיין בלי אתר.' },
        { title: 'האתר עלה. ואז מה?', text: 'שילמת על בנייה, אבל אף אחד לא דיבר על תחזוקה. עכשיו האתר איטי, לא מעודכן, ואתה לא יודע מי אחראי.' },
        { title: 'אתר יפה, אפס תנועה', text: 'עיצוב יפהפה. אבל אף אחד לא הסביר שאתר בלי SEO ובלי שיווק זה שלט חוצות במדבר.' },
      ]} />

      <FeaturesSection title="מה כלול" lead="מהרגע הראשון ועד שהאתר מביא לקוחות. ומשם, תחזוקה שוטפת." stats={[
        { value: 14, label: 'ימי עבודה ממוצע עד עלייה לאוויר' },
        { value: 0, suffix: ' ₪', label: 'דמי הקמה' },
        { value: 99, suffix: '%', label: 'uptime מובטח' },
      ]} features={[
        { title: 'אפיון ואסטרטגיית אתר', text: 'מבינים מה האתר צריך לעשות בשבילך לפני שמתחילים לבנות.' },
        { title: 'עיצוב UX/UI ופיתוח מלא', text: 'עיצוב שנראה טוב ועובד טוב. רספונסיבי, מהיר, ממיר.' },
        { title: 'אתר תדמית · דף נחיתה · בלוג', text: 'בונים את מה שמתאים לך. לא את מה שנוח לנו.' },
        { title: 'פיקסלים, אוטומציות ו-WhatsApp', text: 'הכל מחובר מיום ראשון. פיקסלים של גוגל ומטא, טפסים, וואטסאפ.' },
        { title: 'SEO בסיסי + תחזוקה שוטפת', text: 'האתר לא רק עולה. הוא נשאר חי: עדכונים, גיבויים, אבטחה.' },
        { title: 'פגישה שבועית + דוח חודשי', text: '30 דקות כל שבוע. דוח מפורט כל חודש.' },
      ]} />

      <ForWhoSection yes={['עסקים חדשים שצריכים אתר מקצועי', 'עסקים עם אתר ישן שצריך עדכון', 'יועצים ופרילנסרים שרוצים נוכחות אונליין', 'מי שצריך דף נחיתה לקמפיין']} no={['חנויות eCommerce (יש לנו חבילה נפרדת)', 'פלטפורמות SaaS מורכבות (זה פיתוח בהתאמה)']} />

      <AddonsSection addons={[
        { name: 'עמוד אינטרנט נוסף', price: '480 ₪' },
        { name: 'הקמת תשתית בלוג', price: '550 ₪' },
        { name: 'תרגום שפה לעמוד', price: '480 ₪ / עמוד' },
        { name: 'תחזוקה מורחבת חודשית', price: '350 ₪ / חודש' },
        { name: 'פיתוח WordPress', price: '220 ₪ / שעה' },
        { name: 'פיתוח בקוד', price: '450 ₪ / שעה' },
      ]} />

      <TrustBar items={['בלי חוזה', 'בלי דמי הקמה', 'ביטול בכל עת', 'תחזוקה כלולה']} />
      <FinalCTA title="500 ₪ לחודש. אתר מלא + תחזוקה." subtitle="שלחו הודעה בוואטסאפ. בלי טפסים, בלי המתנה." ctaHref={wa} />
      <StickyPricing price="500 ₪" label="אתרים ואיקומרס · לחודש" ctaHref={wa} />
    </div>
  );
}

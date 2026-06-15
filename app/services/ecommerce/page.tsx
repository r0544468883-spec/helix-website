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

export const metadata: Metadata = {
  title: 'חנויות איקומרס',
  description: 'Shopify, WooCommerce, חנויות מותאמות. 500 ₪ לחודש. בלי דמי הקמה.',
};

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על בניית חנות איקומרס')}`;

export default function EcommercePage() {
  return (
    <div className="service-page">
      <ServiceHero
        eyebrow="חבילה · איקומרס"
        title={'חנות שמוכרת.<br/>לא חנות שמחכה.'}
        subtitle={'בנית חנות אונליין ב-15,000 ש\u05F3\u05F3ח. ואז גילית שצריך גם שיווק, גם SEO, גם תחזוקה, וגם מישהו שיבין למה אנשים נוטשים עגלה. אצלנו הכל כלול.'}
        marketPrice="15,000-30,000 חד פעמי"
        price="500 ₪"
        priceNote="לחודש · כולל תחזוקה ואופטימיזציה"
        ctaHref={wa}
        gradient="from-violet-950/40 via-transparent to-transparent"
      />

      <PainSection cards={[
        { title: 'חנות יפה, אפס מכירות', text: 'השקעת 20,000 על עיצוב. המוצרים בפנים. אבל אף אחד לא קונה. כי אף אחד לא הסביר שחנות בלי תנועה זה חנות סגורה.' },
        { title: 'עלות תחזוקה שולטת', text: 'Shopify, אפליקציות, תוספים, עדכונים. כל חודש עוד 200 דולר פה, עוד 50 דולר שם.' },
        { title: 'נטישת עגלות ב-70%', text: 'אנשים מוסיפים מוצרים לעגלה ונעלמים. אף אחד לא בנה תהליך שחזור או אימיילים אוטומטיים.' },
      ]} />

      <FeaturesSection
        title="מה כלול"
        lead="מהקמה ועד מכירה ראשונה. ומשם, אופטימיזציה שוטפת."
        stats={[
          { value: 21, label: 'ימים ממוצע עד חנות פעילה' },
          { value: 0, suffix: ' ₪', label: 'דמי הקמה' },
          { value: 35, suffix: '%', label: 'שיפור ממוצע ב-conversion' },
        ]}
        features={[
          { title: 'אפיון חנות ומוצרים', text: 'מבנה קטגוריות, תהליך רכישה, ודפי מוצר שממירים.' },
          { title: 'Shopify / WooCommerce / Custom', text: 'בוחרים את הפלטפורמה שמתאימה לך.' },
          { title: 'עיצוב חנות שמוכרת', text: 'UX שמוביל לקנייה. לא עיצוב שנראה יפה בפורטפוליו.' },
          { title: 'תשלומים + משלוחים + מלאי', text: 'Stripe, PayPal, משלוחים, מלאי. הכל עובד מיום ראשון.' },
          { title: 'אימיילים אוטומטיים', text: 'עגלה נטושה, אישור הזמנה, follow-up. הכל אוטומטי.' },
          { title: 'אופטימיזציה + דוחות', text: 'פגישה שבועית. דוח חודשי. מכירות, conversion, AOV.' },
        ]}
      />

      <ForWhoSection
        yes={['עסקים שרוצים למכור אונליין', 'מותגי DTC שצריכים חנות מקצועית', 'חנויות קיימות שרוצות לשדרג']}
        no={['מי שרוצה רק דף נחיתה (יש חבילת אתרים)', 'מרקטפלייס עם אלפי מוכרים (פיתוח בהתאמה)']}
      />

      <AddonsSection addons={[
        { name: 'עמוד מוצר/קטגוריה נוסף', price: '480 ₪' },
        { name: 'חיבור CRM למערכת הזמנות', price: 'החל מ-650 ₪' },
        { name: 'הקמת מערכת דיוור', price: '750 ₪' },
        { name: 'סדרת אימיילים אוטומטית', price: '350 ₪ / שעה' },
        { name: 'תרגום חנות לשפה נוספת', price: '480 ₪ / עמוד' },
      ]} />

      <TrustBar items={['בלי חוזה', 'בלי דמי הקמה', 'ביטול בכל עת', 'אופטימיזציה כלולה']} />
      <FinalCTA title="500 ₪ לחודש. חנות שמוכרת." subtitle="שלחו הודעה בוואטסאפ. נבנה לכם חנות שמביאה הכנסות." ctaHref={wa} />
      <StickyPricing price="500 ₪" label="איקומרס · לחודש" ctaHref={wa} />
    </div>
  );
}

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

export const metadata: Metadata = { title: 'איקומרס · חנויות אונליין', description: 'Shopify, WooCommerce, חנויות מותאמות. 500 ₪ לחודש. בלי דמי הקמה.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על בניית חנות אונליין')}`;

export default function EcommercePage() {
  return (
    <div className="service-page">
      <ServiceHero
        eyebrow="חבילה 02B · איקומרס"
        title="חנות אונליין שמוכרת.<br/>לא רק חנות שיש בה מוצרים."
        subtitle="בנית חנות ב-Shopify לבד ועכשיו יושב עם 3 מכירות בחודש? או שילמת 20,000 ש׳׳ח למישהו שבנה לך חנות יפה שאף אחד לא מוצא? אנחנו בונים חנויות שמביאות לקוחות ומוכרות."
        marketPrice="15,000-30,000 חד פעמי"
        price="500 ₪"
        priceNote="לחודש · בלי דמי הקמה"
        ctaHref={wa}
        gradient="from-amber-950/40 via-transparent to-transparent"
      />

      <PainSection cards={[
        { title: 'החנות עלתה. המכירות לא.', text: 'המוצרים בפנים, התמונות יפות, הכל עובד טכנית. אבל אף אחד לא קונה. כי אף אחד לא הגיע לחנות.' },
        { title: 'עגלות נטושות בכל מקום', text: '67% מהאנשים שמים מוצר בעגלה ועוזבים. ואתה לא יודע למה, כי אין לך מערכת שעוקבת.' },
        { title: 'שני ספקים שלא מדברים', text: 'אחד בנה את החנות, אחד עושה שיווק. הם לא מכירים אחד את השני. אתה באמצע, משלם לשניהם.' },
      ]} />

      <FeaturesSection
        title="מה כלול"
        lead="חנות מלאה, מהמוצר הראשון ועד הלקוח שחוזר לקנות שוב."
        stats={[
          { value: 67, suffix: '%', label: 'ממוצע עגלות נטושות בשוק. אנחנו מורידים.' },
          { value: 0, suffix: ' ₪', label: 'דמי הקמה' },
          { value: 21, label: 'יום ממוצע עד חנות חיה' },
        ]}
        features={[
          { title: 'הקמת חנות Shopify / WooCommerce', text: 'בוחרים את הפלטפורמה שמתאימה לך, לא את מה שנוח לנו. מקימים מאפס ועד חנות שעובדת.' },
          { title: 'עיצוב מותאם למותג שלך', text: 'לא תבנית גנרית. עיצוב שמרגיש כמו המותג שלך ומותאם להמרות.' },
          { title: 'אינטגרציות תשלום ומשלוחים', text: 'PayPal, Stripe, כרטיסי אשראי ישראליים, חברות משלוחים. הכל מחובר.' },
          { title: 'SEO לחנות + Google Shopping', text: 'כל מוצר מותאם לחיפוש. חיבור ל-Google Merchant Center ו-Shopping Ads.' },
          { title: 'אוטומציות: עגלה נטושה, מיילים, פולואפ', text: 'מערכות שרצות לבד. מייל על עגלה נטושה, thank you, בקשת review.' },
          { title: 'פגישה שבועית + דוח חודשי', text: '30 דקות כל שבוע. דוח מכירות חודשי. אתה תמיד יודע מה קורה.' },
        ]}
      />

      <ForWhoSection
        yes={['עסקים שרוצים למכור אונליין לראשונה', 'חנויות קיימות שלא מוכרות מספיק', 'מותגי D2C שרוצים ערוץ ישיר', 'עסקים עם מוצרים פיזיים או דיגיטליים']}
        no={['מי שצריך marketplace עם מוכרים מרובים', 'פלטפורמות SaaS עם חיובים מורכבים (זה פיתוח בהתאמה)']}
      />

      <AddonsSection addons={[
        { name: 'עמוד מוצר נוסף (עיצוב מותאם)', price: '480 ₪' },
        { name: 'חיבור למערכת ניהול מלאי', price: 'החל מ-650 ₪' },
        { name: 'הקמת מערכת דיוור ללקוחות', price: '750 ₪' },
        { name: 'סדרת אימיילים אוטומטית', price: '350 ₪ / שעה' },
        { name: 'תרגום חנות לשפה נוספת', price: '480 ₪ / עמוד' },
      ]} />

      <TrustBar items={['בלי חוזה', 'בלי דמי הקמה', 'ביטול בכל עת', 'תחזוקה ועדכונים כלולים']} />
      <FinalCTA title="500 ₪ לחודש. חנות אונליין מלאה." subtitle="שלחו הודעה בוואטסאפ. נבנה לכם חנות שמוכרת." ctaHref={wa} />
      <StickyPricing price="500 ₪" label="איקומרס · לחודש" ctaHref={wa} />
    </div>
  );
}

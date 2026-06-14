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
  title: 'שיווק דיגיטלי · Hands-on',
  description: 'מאסטרטגיה ועד ביצוע. קמפיינים, SEO, סושיאל, תוכן. 500 ₪ לחודש. בלי חוזה.',
};

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת השיווק')}`;

export default function MarketingPage() {
  return (
    <div className="service-page">
      <ServiceHero
        eyebrow="חבילה 01 · שיווק דיגיטלי"
        title="שיווק דיגיטלי שעובד.<br/>לא שיווק שנראה טוב בדוח."
        subtitle="שילמת 5,000 ש"ח בחודש על סוכנות שיווק וקיבלת דוח עם impressions? אצלנו אתה יודע בדיוק כמה לידים הגיעו, מאיפה, ובכמה. בלי גרפים יפים שמסתירים תוצאות עלובות."
        marketPrice="5,000–8,000"
        price="500 ₪"
        priceNote="לחודש · בלי חוזה · ביטול בכל עת"
        ctaHref={wa}
        gradient="from-emerald-950/50 via-emerald-950/20 to-transparent"
      />

      <PainSection cards={[
        { title: 'הסוכנות שלחה דוח', text: 'גרפים צבעוניים, מספרים שנראים גדולים. אבל שורה תחתונה? אתה לא יודע כמה לידים הגיעו בגלל הקמפיין וכמה בגלל גוגל.' },
        { title: 'ג׳וניור מנהל לך את החשבון', text: 'שילמת על "צוות שלם". בפועל? בן אדם אחד שמנהל עוד שבעה לקוחות ושואל אותך כל שבוע "מה רוצים לפרסם?"' },
        { title: 'המחיר עולה, התוצאות לא', text: 'התחלת ב-3,000 ש"ח. עכשיו אתה ב-6,000. ואין לך מושג אם המעבר הצדיק את עצמו.' },
      ]} />

      <FeaturesSection
        title="מה אנחנו עושים אחרת"
        lead="אותו שיווק דיגיטלי שסוכנות גובה עליו 5,000. AI חתך לנו 60% מהעבודה, ואנחנו מעבירים את החיסכון אליכם."
        stats={[
          { value: 60, suffix: '%', label: 'חיסכון בשעות עבודה' },
          { value: 47, label: 'לקוחות פעילים' },
          { value: 500, suffix: ' ₪', label: 'לחודש, לא 5,000' },
        ]}
        features={[
          { title: 'אסטרטגיה מבוססת נתונים', text: 'מחקר קהלים, מסרים, מיפוי מתחרים. לפני שמוציאים שקל.' },
          { title: 'ניהול קמפיינים: Google · Meta · TikTok', text: 'מקימים, מנהלים, מנתחים, משפרים. כל שבוע. עם מספרים אמיתיים.' },
          { title: 'SEO אורגני + GEO', text: 'קידום אורגני קלאסי + אופטימיזציה למנועי AI (ChatGPT, Perplexity, Gemini). ככה אנשים מחפשים ב-2026.' },
          { title: 'סושיאל, תוכן וקריאייטיב', text: 'פוסטים, סטוריז, reels. תוכן שאנשים רוצים לצרוך, לא "תוכן שיווקי" שאף אחד לא קורא.' },
          { title: 'דוחות שקופים', text: 'לידים, עלות ליד, מכירות. לא impressions ולא reach.' },
          { title: 'פגישה שבועית + דוח חודשי', text: '30 דקות כל שבוע. דוח מפורט כל חודש. אתה תמיד יודע מה קורה.' },
        ]}
      />

      <ForWhoSection
        yes={['עסקים שרוצים תוצאות מדידות', 'בעלי עסקים שנכוו מסוכנויות יקרות', 'סטארטאפים שצריכים לידים עכשיו', 'מי שרוצה שקיפות מלאה על כל שקל']}
        no={['מי שמחפש רק "מישהו שינהל את הפייסבוק"', 'עסקים שלא מוכנים לפגישה שבועית', 'מי שרוצה את הזול ביותר בלי מעורבות']}
      />

      <AddonsSection addons={[
        { name: 'מאמר SEO מותאם (800–1,200 מילים)', price: '550 ₪' },
        { name: 'SEO בסיסי לעמוד', price: '350 ₪ / עמוד' },
        { name: 'SEO מתקדם (מחקר מילות מפתח + Schema + Search Console)', price: '1,200 ₪ / עמוד' },
        { name: 'שעת ייעוץ דיגיטלי', price: '350 ₪ / שעה' },
      ]} />

      <TrustBar items={['בלי חוזה', 'ביטול בכל עת', 'עשרות לקוחות מרוצים', 'דוח חודשי מפורט', 'שיחת אסטרטגיה ראשונה חינם']} />

      <FinalCTA
        title="500 ₪ לחודש. שיווק דיגיטלי מלא."
        subtitle="שלחו הודעה בוואטסאפ. בלי טפסים, בלי המתנה. ערן או רון חוזרים אליכם תוך כמה שעות."
        ctaHref={wa}
      />

      <StickyPricing price="500 ₪" label="שיווק דיגיטלי · לחודש" ctaHref={wa} />
    </div>
  );
}

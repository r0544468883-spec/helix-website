'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import AddonsSection from '../../components/service/AddonsSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import StickyPricing from '../../components/service/StickyPricing';
import LeadForm from '../../components/sections/LeadForm';
import FloatingCTA from '../../components/FloatingCTA';

const CityLightsLottie = dynamic(() => import('../../components/CityLightsLottie'), { ssr: false });
const BurningMoneyLottie = dynamic(() => import('../../components/BurningMoneyLottie'), { ssr: false });
const HandshakeLottie = dynamic(() => import('../../components/HandshakeLottie'), { ssr: false });

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת השיווק')}`;

export default function MarketingPageClient() {
  return (
    <div className="service-page">
      {/* 1. Hero with city lights Lottie */}
      <div className="relative">
        <ServiceHero
          eyebrow="חבילה 01 · שיווק דיגיטלי"
          title="שיווק שעובד.<br/>לא כזה שנראה טוב בדוח."
          subtitle="רוב הסוכנויות ישלחו לך דוח עם המון גרפים ירוקים ואיפשהו שם בשורה האחרונה תמצא אפס לידים. אנחנו עושים הפוך — מתחילים מהשאלה ״כמה כסף נכנס?״ ומשם בונים הכל."
          marketPrice="5,000–8,000"
          price="1,250 ₪"
          priceNote="לחודש · בלי חוזה · ביטול בכל עת"
          ctaHref={wa}
          gradient="from-emerald-950/50 via-emerald-950/20 to-transparent"
        />
        <div className="absolute left-4 bottom-8 w-[300px] h-[240px] opacity-30 pointer-events-none hidden lg:block" aria-hidden="true">
          <CityLightsLottie />
        </div>
      </div>

      {/* 2. Pain points with burning money Lottie */}
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-[140px] h-[140px] opacity-50 pointer-events-none" aria-hidden="true">
          <BurningMoneyLottie />
        </div>
        <PainSection cards={[
          {
            title: 'הסוכנות לקחה את הכסף, הלידים לא הגיעו',
            text: 'שילמת כל חודש, ראית "תוצאות" בפרזנטציה יפה — ובחשבון הבנק לא זז כלום. הבעיה היא לא התקציב שלך. הבעיה היא שמי שניהל לך את הקמפיין אופטימייז על קליקים, לא על לקוחות.',
          },
          {
            title: 'אף אחד לא מבין מה קורה עם הכסף שלך',
            text: '"הגענו ל-80,000 חשיפות אורגניות" — כל הכבוד, אבל מה זה שווה לך בפועל? אנחנו לא מדברים בסטטיסטיקות. אנחנו מדברים על לידים, עלות לליד, ועסקאות שנסגרו.',
          },
          {
            title: 'כל חודש להתחיל מהתחלה עם מישהו חדש',
            text: 'חתמת על שנה, אחרי שלושה חודשים החשבון עבר ל-Account Manager אחר שלא מכיר אותך ולא מכיר את העסק שלך. זה לא שירות — זה טרנספר.',
          },
        ]} />
      </div>

      {/* 3. Lead form — soft, early */}
      <LeadForm variant="soft" />

      {/* 4. For who */}
      <ForWhoSection
        yes={[
          'עסק שיש לו מוצר טוב ורוצה להביא ממנו יותר לקוחות',
          'סטארטאפ שצריך לבדוק ערוצי רכישה בלי לשרוף את כל התקציב',
          'בעל עסק שנשרף מסוכנות קודמת ורוצה פעם אחת שיעבדו ברצינות',
          'חברה שמנהלת שיווק פנימית וצריכה יד עוזרת עם ראייה רחבה יותר',
        ]}
        no={[
          'מי שרוצה תוצאות אחרי שבועיים ובלי תקציב פרסום בכלל',
          'מי שחיפש מישהו שיעשה "ויראלי" בלי לדעת למה',
          'מי שלא מוכן לתת פידבק ולהיות חלק מהתהליך',
          'מי שמחפש הכי זול בשוק — אנחנו לא הכי זולים, ולא מנסים להיות',
        ]}
      />

      {/* 5. Features */}
      <FeaturesSection
        title="מה אנחנו עושים שונה ממה שהתרגלת לקבל"
        lead="אותו שיווק דיגיטלי שסוכנות גובה עליו 5,000+. AI חתך לנו 60% מהעבודה, ואנחנו מעבירים את החיסכון אליכם."
        stats={[
          { value: 60, suffix: '%', label: 'חיסכון בשעות עבודה' },
          { value: 30, suffix: '+', label: 'עסקים פעילים' },
          { value: 1250, suffix: ' ₪', label: 'לחודש, לא 5,000' },
        ]}
        features={[
          { title: 'אסטרטגיה שנבנית בשבילך, לא מתבנית', text: 'מתחילים עם קול על הקהל שלך, המתחרים שלך, ומה הלקוחות שלך באמת מחפשים — ורק אז בונים קמפיינים.' },
          { title: 'ניהול קמפיינים ב-Google, Meta ו-TikTok', text: 'פרסום ממומן שמנוהל כל שבוע — לא מוגדר פעם אחת ונשכח. מה שעובד מקבל יותר תקציב. מה שלא — נעצר.' },
          { title: 'SEO + GEO: גם גוגל, גם בינה מלאכותית', text: 'בנוסף לקידום אורגני רגיל, אנחנו מוודאים שה-AI ממליץ על העסק שלך כשמישהו שואל שאלה רלוונטית.' },
          { title: 'תוכן וסושיאל שנשמע כמוך, לא כמו כולם', text: 'פוסטים, קריאייטיב ווידאו שנבנים סביב המסר שלך — לא תבניות גנריות שכולם משתמשים בהן.' },
          { title: 'דוח חודשי שאפשר להבין', text: 'לא עשרים עמודים של PDF. מה הלך טוב, מה לא, מה עושים חודש הבא. זהו.' },
          { title: 'פגישה שבועית של חצי שעה', text: '30 דקות כל שבוע שבהן אתה יודע בדיוק מה קורה, יכול לשאול, ויכול לשנות כיוון — בלי לחכות לסוף הרבעון.' },
        ]}
      />

      {/* 6. Addons */}
      <AddonsSection addons={[
        { name: 'מאמר SEO מותאם', price: '550 ₪ · חד פעמי' },
        { name: 'SEO בסיסי לעמוד', price: '350 ₪ · חד פעמי' },
        { name: 'SEO מתקדם לעמוד', price: '1,200 ₪ · חד פעמי' },
        { name: 'שעת ייעוץ דיגיטלי', price: '350 ₪ · חד פעמי' },
        { name: 'ניתוח אטריביוציה — מעקב שמראה איזה ערוץ באמת הביא את הליד', price: '1,400 ₪ · חד פעמי' },
        { name: 'מיפוי מילות מפתח ל-AI Search', price: '800 ₪ · חד פעמי' },
        { name: 'ריטרגטינג דינמי — מודעות שרודפות מבקרים שכבר היו באתר', price: '650 ₪ · חד פעמי' },
        { name: 'ניתוח מתחרים ממומן (Ad Intelligence)', price: '750 ₪ · חד פעמי' },
        { name: 'קמפיין Brand Awareness (Taboola / Outbrain)', price: '800 ₪ · חודשי' },
      ]} />

      {/* 7. Lead form — strong, with handshake Lottie */}
      <div className="relative">
        <div className="absolute right-8 top-4 w-[140px] h-[100px] opacity-50 pointer-events-none hidden md:block" aria-hidden="true">
          <HandshakeLottie />
        </div>
        <LeadForm />
      </div>

      {/* 8. Trust bar */}
      <TrustBar items={[
        'בלי חוזה',
        'ביטול בכל עת',
        'בלי דמי הקמה',
        'שיחת אסטרטגיה ראשונה חינם',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* 9. Final CTA */}
      <FinalCTA
        title="כבר השקעת מספיק בשיווק שלא עבד."
        subtitle="שיחת אסטרטגיה ראשונה בחינם — בלי התחייבות, בלי מצגת מכירה. תספר לנו על העסק, נגיד לך בכנות אם אנחנו יכולים לעזור. אם לא — נגיד גם את זה."
        ctaHref={wa}
        ctaText="קבע שיחה עכשיו"
      />

      {/* Sticky bottom bar */}
      <StickyPricing price="1,250 ₪" label="שיווק דיגיטלי · לחודש" ctaHref={wa} />

      {/* Floating CTA button */}
      <FloatingCTA />
    </div>
  );
}

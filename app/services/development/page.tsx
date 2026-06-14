import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import AddonsSection from '../../components/service/AddonsSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';

export const metadata: Metadata = { title: 'בנק שעות פיתוח ואפיון', description: 'פיתוח תוכנה בהתאמה. MVP, פיצ׳רים, אינטגרציות. תמחור לפי הצעה.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על פיתוח בהתאמה')}`;

export default function DevelopmentPage() {
  return (
    <div className="service-page">
      <ServiceHero eyebrow="פיתוח בהתאמה" title="תוכנה שעובדת בדיוק<br/>כמו שאתה צריך." subtitle="יש לך רעיון למוצר? צריך פיצ׳ר שלא קיים? רוצה לחבר שתי מערכות שלא מדברות? פיתוח בהתאמה, בלי bloat, בלי over-engineering." price="לפי הצעה" priceNote="נסגר בשיחה · שיחת אפיון ראשונה חינם" ctaHref={wa} gradient="from-blue-950/40 via-transparent to-transparent" />

      <PainSection cards={[
        { title: 'MVP שלקח שנה', text: 'הזמנת מערכת פשוטה. הספק אמר 3 חודשים. עברה שנה ויש חצי מוצר.' },
        { title: 'הספק נעלם', text: 'פיתחו לך מערכת. הספק עבר לפרויקט אחר. עכשיו יש באג ואין מי שיתקן.' },
        { title: 'עלות שפוחתה', text: 'הסכמתם על 30,000. החשבון עלה ל-80,000. "הייתה מורכבות שלא צפינו."' },
      ]} />

      <FeaturesSection title="מה כלול" lead="גמיש, שקוף, ולפי מה שצריך." stats={[
        { value: 10, suffix: '+', label: 'שנות ניסיון בפיתוח' },
        { value: 2, label: 'מוצרים בייצור עם לקוחות משלמים' },
      ]} features={[
        { title: 'שעות פיתוח ואפיון לפי בנק שעות', text: 'משלם על מה שצורך. לא על חבילה שלא מתאימה.' },
        { title: 'MVP · פיצ׳ר · אינטגרציה · אפליקציה', text: 'מ-MVP ראשון ועד פיצ׳רים למוצר קיים. גמיש.' },
        { title: 'Stack: Node.js · React · Python · .NET · AWS · GCP', text: 'עובדים עם מה שמתאים לפרויקט, לא עם מה שנוח לנו.' },
        { title: 'פגישה שבועית + דוח חודשי', text: '30 דקות כל שבוע. שקיפות מלאה על התקדמות ושעות.' },
      ]} />

      <ForWhoSection yes={['יזמים שצריכים MVP', 'עסקים שצריכים פיצ׳ר חדש למוצר קיים', 'מי שצריך אינטגרציה בין מערכות', 'פרויקטים עם scope ברור']} no={['"יש לי רעיון, תבנה לי פייסבוק"', 'פרויקטים בלי תקציב או scope']} />

      <AddonsSection addons={[
        { name: 'פיתוח WordPress', price: '220 ₪ / שעה' },
        { name: 'פיתוח בקוד (React, Node, Python, .NET)', price: '450 ₪ / שעה' },
        { name: 'שעת ייעוץ דיגיטלי / אפיון', price: '350 ₪ / שעה' },
      ]} />

      <TrustBar items={['שיחת אפיון ראשונה חינם', 'הצעת מחיר מפורטת לפני התחלה', 'שקיפות מלאה על שעות']} />
      <FinalCTA title="ספרו לנו מה צריך. נחזור עם הצעה." subtitle="שלחו הודעה בוואטסאפ." ctaHref={wa} />
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const FunnelLottie = dynamic(() => import('../../components/FunnelLottie'), { ssr: false });
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import StickyPricing from '../../components/service/StickyPricing';
import LeadForm from '../../components/sections/LeadForm';
import FloatingCTA from '../../components/FloatingCTA';
import { PackageCard, corePackages } from '../../components/sections/Services';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import HowItWorks from '../../components/sections/HowItWorks';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת השיווק')}`;


export default function MarketingPageClient() {
  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow="חבילה 01 · שיווק דיגיטלי"
        title="שיווק שעובד.<br/>לא כזה שנראה טוב בדוח."
        subtitle="רוב הסוכנויות ישלחו לך דוח עם המון גרפים ירוקים ואיפשהו שם בשורה האחרונה תמצא אפס לידים. אנחנו עושים הפוך — מתחילים מהשאלה ״כמה כסף נכנס?״ ומשם בונים הכל."
        marketPrice="8,000–15,000"
        price="1,250 ₪"
        priceNote="לחודש · בלי חוזה · ביטול בכל עת · בלי דמי הקמה"
        ctaHref={wa}
      />

      {/* ──── FUNNEL LOTTIE ──── */}
      <ScrollReveal direction="up">
        <div style={{ maxWidth: 320, height: 320, margin: '0 auto' }}>
          <FunnelLottie />
        </div>
      </ScrollReveal>

      {/* ──── NARRATIVE: למה הגעת לכאן ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>בוא נגיד את מה שכולם חושבים ומעטים אומרים.</h2>
            <p>
              שילמת לסוכנות שיווק 8,000 עד 15,000 שקל בחודש. קיבלת דוח חודשי עם הרבה מספרים שאתה לא מבין.
              שאלת &quot;אבל כמה לידים הגיעו?&quot; וקיבלת תשובה מעורפלת על impressions ו-reach.
            </p>
            <p>
              אנחנו יודעים בדיוק איך זה מרגיש כי הלקוחות שלנו מספרים לנו את זה כל שבוע.
              הסיפור תמיד אותו דבר: הבטחות גדולות, תוצאות קטנות, ומחיר שלא מפסיק לעלות.
            </p>
            <p className="sp-narrative-highlight">
              אז החלטנו לעשות את זה אחרת. לגבות החל מ-1,250 ₪ לחודש על אותו שירות.
              בלי חוזה. בלי דמי הקמה. בלי bullshit.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── PAIN POINTS ──── */}
      <PainSection
        title="מכירים את הסיפור?"
        cards={[
          {
            title: 'הסוכנות לקחה את הכסף, הלידים לא הגיעו',
            text: 'שילמת כל חודש, ראית "תוצאות" בפרזנטציה יפה — ובחשבון הבנק לא זז כלום. מי שניהל לך את הקמפיין אופטימייז על קליקים, לא על לקוחות.',
          },
          {
            title: 'אף אחד לא מבין מה קורה עם הכסף שלך',
            text: '"הגענו ל-80,000 חשיפות אורגניות" — כל הכבוד, אבל מה זה שווה? אנחנו מדברים על לידים, עלות לליד, ועסקאות שנסגרו. לא על מספרים שנשמעים יפה.',
          },
          {
            title: 'כל חודש מישהו חדש מטפל בך',
            text: 'אחרי שלושה חודשים החשבון עבר למישהו אחר שלא מכיר אותך ולא מכיר את העסק שלך. אצלנו ערן ורון מטפלים אישית בכל לקוח.',
          },
        ]}
      />

      {/* ──── LEAD FORM — SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── NARRATIVE: איך זה עובד אצלנו ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>איך שיווק דיגיטלי עובד אצלנו.</h2>
            <p>
              <strong>שלב ראשון — שיחה.</strong> לא פגישת מכירה. שיחה אמיתית כדי להבין מה המצב, מה עבד ומה לא,
              ומה בדיוק אתה צריך. אם אנחנו לא יכולים לעזור — נגיד את זה.
            </p>
            <p>
              <strong>שלב שני — אסטרטגיה.</strong> מחקר קהלים, מיפוי מתחרים, בחירת ערוצים ומסרים.
              לא תבנית שעובדת לכולם — תוכנית שנבנית בשבילך.
            </p>
            <p>
              <strong>שלב שלישי — ביצוע ומדידה.</strong> קמפיינים עולים לאוויר. כל שבוע אנחנו בודקים מה עובד ומה לא.
              מה שעובד — מקבל יותר תקציב. מה שלא — נעצר. בלי לחכות חודש כדי להבין שבזבזנו כסף.
            </p>
            <p>
              <strong>שלב רביעי — שקיפות מלאה.</strong> פגישה שבועית של 30 דקות + דוח חודשי עם מספרים אמיתיים.
              לידים, עלות לליד, מכירות. אתה תמיד יודע מה קורה עם הכסף שלך.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── STEPS TIMELINE ──── */}
      <HowItWorks />

      {/* ──── SUB-SERVICES GRID ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו מכסים</h2>
            <p className="sp2-lead">כל ערוץ דיגיטלי שרלוונטי לעסק שלך — תחת קורת גג אחת.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🎯', title: 'Google Ads', desc: 'קמפיינים בחיפוש, שופינג ודיספליי. מיקוד במילות מפתח שמביאות לקוחות, לא קליקים.' },
                { icon: '📱', title: 'Meta Ads', desc: 'פייסבוק ואינסטגרם. קהלים מותאמים, ריטרגטינג, ו-lookalike שעובד.' },
                { icon: '🎵', title: 'TikTok Ads', desc: 'תוכן שמרגיש אורגני אבל מגיע לקהל הנכון. מותאם לפלטפורמה, לא מועתק מפייסבוק.' },
                { icon: '🔍', title: 'SEO אורגני', desc: 'קידום בגוגל לטווח ארוך. מחקר מילים, תוכן, לינקים ו-Technical SEO.' },
                { icon: '🤖', title: 'GEO — מנועי AI', desc: 'אופטימיזציה ל-ChatGPT, Gemini, Perplexity. שהעסק שלך יופיע כשמישהו שואל שאלה רלוונטית.' },
                { icon: '📝', title: 'תוכן וסושיאל', desc: 'פוסטים, סטוריז, Reels. תוכן שנבנה סביב המסר שלך — לא תבניות גנריות.' },
                { icon: '📊', title: 'אנליטיקס ומדידה', desc: 'GA4, פיקסלים, UTM, דשבורדים. תדע בדיוק מאיפה כל ליד הגיע.' },
                { icon: '📧', title: 'Email & WhatsApp', desc: 'סדרות אימיילים אוטומטיות, WhatsApp marketing, nurturing שהופך לידים ללקוחות.' },
              ].map((svc) => (
                <div key={svc.title} className="sp-service-card">
                  <div className="sp-service-icon">{svc.icon}</div>
                  <h3>{svc.title}</h3>
                  <p>{svc.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── FEATURES ──── */}
      <FeaturesSection
        title="מה כלול בחבילה"
        lead="כל מה שסוכנות שיווק גובה עליו 8,000+ — אנחנו עושים ב-1,250 ₪. AI חתך לנו 60% מהעבודה, ואנחנו מעבירים את החיסכון אליכם."
        stats={[
          { value: 60, suffix: '%', label: 'חיסכון בשעות עבודה בזכות AI' },
          { value: 30, suffix: '+', label: 'עסקים שעובדים איתנו' },
          { value: 1250, suffix: ' ₪', label: 'במקום 8,000–15,000 ₪' },
        ]}
        features={[
          { title: 'אסטרטגיית שיווק מותאמת', text: 'מחקר קהלים, מתחרים ומסרים. תוכנית שנבנית בשבילך, לא מתבנית.' },
          { title: 'קמפיינים: Google · Meta · TikTok', text: 'ניהול שוטף כל שבוע. מה שעובד מקבל יותר. מה שלא — נעצר.' },
          { title: 'SEO אורגני + מנועי AI', text: 'קידום בגוגל + אופטימיזציה ל-ChatGPT, Gemini, Perplexity. ככה מחפשים ב-2026.' },
          { title: 'תוכן וסושיאל', text: 'פוסטים, קריאייטיב ווידאו סביב המסר שלך. לא תבניות גנריות.' },
          { title: 'דוח חודשי שאפשר להבין', text: 'מה הלך טוב, מה לא, מה עושים חודש הבא. בלי 20 עמודים של PDF.' },
          { title: 'פגישה שבועית', text: '30 דקות כל שבוע. אתה יודע מה קורה ויכול לשנות כיוון.' },
        ]}
      />

      {/* ──── NARRATIVE: למה אנחנו זולים ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה המחיר הזה? מה הקאץ׳?</h2>
            <p>
              אין קאץ׳. בינה מלאכותית חתכה לנו 60% משעות העבודה.
              מה שלקח שבוע לוקח עכשיו יום וחצי. רוב השוק כיסה על ההפרש והמשיך לגבות כרגיל.
            </p>
            <p>
              אנחנו החלטנו אחרת. להעביר את החיסכון אליכם.
              1,250 ₪ זה לא מחיר מבצע — זה המחיר.
              אותו שירות, אותה איכות, פחות overhead.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסק עם מוצר טוב שרוצה יותר לקוחות',
          'סטארטאפ שצריך לבדוק ערוצי רכישה בתקציב סביר',
          'בעל עסק שנשרף מסוכנות יקרה ורוצה שמישהו יעבוד ברצינות',
          'חברה שצריכה יד מקצועית מבחוץ עם ראייה רחבה',
        ]}
        no={[
          'מי שרוצה תוצאות אחרי שבוע בלי תקציב פרסום',
          'מי שמחפש "ויראלי" בלי אסטרטגיה או מטרה',
          'מי שלא מוכן להיות חלק מהתהליך ולתת פידבק',
          'מי שמחפש רק מישהו שינהל את הפייסבוק',
        ]}
      />

      {/* ──── PACKAGE CARD (identical to homepage) ──── */}
      <section className="sp2-section" id="packages">
        <div className="container">
          <ScrollReveal direction="up">
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <PackageCard pkg={corePackages[0]} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── LEAD FORM — STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── TRUST BAR ──── */}
      <TrustBar items={[
        'בלי חוזה',
        'ביטול בכל עת',
        'בלי דמי הקמה',
        'שיחת אסטרטגיה ראשונה חינם',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* ──── FINAL CTA ──── */}
      <FinalCTA
        title="כבר השקעת מספיק בשיווק שלא עבד."
        subtitle="שיחת אסטרטגיה ראשונה בחינם — בלי התחייבות. תספר לנו על העסק, נגיד לך בכנות אם אנחנו יכולים לעזור. אם לא — נגיד גם את זה."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />

      {/* ──── STICKY + FLOATING ──── */}
      <StickyPricing price="1,250 ₪" label="שיווק דיגיטלי · לחודש" ctaHref={wa} />
      <FloatingCTA />
    </div>
  );
}

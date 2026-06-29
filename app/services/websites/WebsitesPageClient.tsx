'use client';

import { SITE } from '@/lib/site';
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import LeadForm from '../../components/sections/LeadForm';
import { PackageCard, corePackages } from '../../components/sections/Services';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import WebsitesReviews from './WebsitesReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import WebsitesTimeline from './WebsitesTimeline';
import dynamic from 'next/dynamic';

const WebsitesHeroLottie = dynamic(() => import('../../components/WebsitesHeroLottie'), { ssr: false });
const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
import WebsitesConstellation from '../../components/WebsitesConstellation';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על בניית אתרים')}`;

export default function WebsitesPageClient() {
  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow="חבילה 02 · בניית אתרים"
        title="האתר שלכם,<br/>כמנוע צמיחה עסקי."
        subtitle="הילדים הטובים של עולם הדיגיטל בונים אתרים שעובדים — לא כאלה שיושבים בפינה. יותר המרות, יותר פניות, יותר צמיחה."
        marketPrice="8,000–15,000 חד פעמי"
        price="1,250 ₪"
        priceNote="לחודש · בלי דמי הקמה · בלי חוזה · תחזוקה כלולה"
        ctaHref={wa}
      >
        <WebsitesHeroLottie />
      </ServiceHero>

      {/* ──── NARRATIVE ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נגיד את מה שכולם יודעים אבל לא אומרים.</h2>
              <p>
                שילמת 12,000 עד 20,000 שקל על אתר שהיה &quot;כמעט מוכן&quot; חודשיים.
                הספק נעלם לשבוע, חזר עם תירוצים, והחשבון עלה ב-50%.
                כשהאתר סוף סוף עלה — אף אחד לא דיבר על תחזוקה, SEO, או איך מביאים תנועה.
              </p>
              <p>
                הילדים הטובים עושים את זה אחרת. אתר מלא — עיצוב, פיתוח, תוכן, SEO ותחזוקה שוטפת.
                החל מ-1,250 ₪ לחודש. בלי דמי הקמה. בלי חוזה.
              </p>
              <p className="sp-narrative-highlight">
                AI חתך לנו 60% משעות העבודה. הילדים הטובים לא מכסים על ההפרש — מעבירים את החיסכון אליכם.
              </p>
            </ScrollTextHighlight>
            <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
          </div>
        </div>
      </section>

      {/* ──── PAIN POINTS ──── */}
      <PainSection
        title="מכירים את הסיפור?"
        cards={[
          {
            title: 'האתר "כמעט מוכן" כבר חודשיים',
            text: 'הספק נעלם לשבוע, חזר עם תירוצים, והחשבון עלה ב-50%. הילדים הטובים לא נעלמים — אנחנו כאן כל שבוע.',
          },
          {
            title: 'האתר עלה. ואז מה?',
            text: 'שילמת על בנייה, אבל אף אחד לא דיבר על תחזוקה. הילדים הטובים כוללים תחזוקה, גיבויים ועדכונים — כי אתר זה לא פרויקט חד-פעמי.',
          },
          {
            title: 'אתר יפה, אפס תנועה',
            text: 'עיצוב יפהפה. אבל אף אחד לא הסביר שאתר בלי SEO זה שלט חוצות במדבר. הילדים הטובים בונים אתר שגם נמצא.',
          },
        ]}
      />

      {/* ──── REVIEWS ──── */}
      <ScrollReveal direction="up">
        <WebsitesReviews />
      </ScrollReveal>

      {/* ──── LEAD FORM — SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── WEBSITES TOOLS CONSTELLATION ──── */}
      <WebsitesConstellation />

      {/* ──── STEPS TIMELINE ──── */}
      <WebsitesTimeline />

      {/* ──── SUB-SERVICES GRID ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בונים</h2>
            <p className="sp2-lead">כל סוג אתר שעסק צריך — תחת קורת גג אחת.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🚀', title: 'דפי נחיתה', desc: 'עמודים ממוקדי המרה לקמפיינים ממומנים. היררכיית תוכן נכונה, מהירות טעינה גבוהה, מקסימום פניות ומכירות.' },
                { icon: '📄', title: 'מיניסייטים', desc: 'אתר קומפקטי להצגת שירות ספציפי או פרויקט ממוקד. מסר חד שמוביל לפעולה, בלי הסחות דעת.' },
                { icon: '🏢', title: 'אתרי תדמית', desc: 'עוגן דיגיטלי שמייצג את העסק כאוטוריטה. עיצוב נקי ומינימליסטי שמייצר אמון וסמכות.' },
                { icon: '🛒', title: 'חנויות eCommerce', desc: 'חנות אונליין מלאה — קטלוג, עגלת קניות, תשלום ומשלוחים. Shopify, WooCommerce, או קוד מותאם.' },
                { icon: '📝', title: 'בלוגים ותוכן', desc: 'תשתית תוכן שעובדת ל-SEO. מאמרים, קטגוריות, תגים, ומנוע חיפוש פנימי.' },
                { icon: '🔗', title: 'אינטגרציות', desc: 'CRM, WhatsApp, גוגל אנליטיקס, פיקסלים, טפסים, אוטומציות — הכל מחובר מיום ראשון.' },
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
        title="מה כלול באתר שלכם"
        lead="הילדים הטובים לא עושים חצי עבודה. כל אתר מגיע עם מעטפת ביצועים מלאה כסטנדרט."
        stats={[
          { value: 14, label: 'ימי עבודה ממוצע עד עלייה לאוויר' },
          { value: 0, suffix: ' ₪', label: 'דמי הקמה' },
          { value: 99, suffix: '%', label: 'uptime מובטח' },
        ]}
        features={[
          { title: 'התאמה לכל המכשירים', text: 'האתר נראה ומתפקד מושלם בסמארטפון, טאבלט ומחשב. חוויית גלישה חלקה מכל מכשיר.' },
          { title: 'עיצוב בהתאמה אישית', text: 'שפה ויזואלית שמתאימה ל-DNA של העסק. רושם ראשוני בלתי נשכח שגורם ללקוחות להתחבר.' },
          { title: 'מהירות וביצועים', text: 'אתר שטוען בשבריר שנייה. מהירות = שימור גולשים + דירוג גבוה בגוגל.' },
          { title: 'תשתית SEO לקידום בגוגל', text: 'יסודות טכניים שגוגל אוהב. אופטימיזציה למנועי חיפוש כבר משלב הפיתוח.' },
          { title: 'אבטחה וגיבויים', text: 'SSL, מערכות הגנה, גיבויים שוטפים. המידע שלכם מוגן, האתר עובד.' },
          { title: 'הדרכה לניהול עצמאי', text: 'הדרכה מסודרת לעדכון תכנים בקלות. עצמאות מלאה, בלי תלות באף אחד.' },
        ]}
      />

      {/* ──── NARRATIVE: למה אנחנו זולים ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה 1,250 ₪ לחודש ולא 15,000 חד פעמי?</h2>
            <p>
              כי AI חתך לנו 60% משעות העבודה. מה שלקח שבועיים לוקח 4 ימים.
              רוב השוק המשיך לגבות כרגיל. הילדים הטובים העבירו את החיסכון אליכם.
            </p>
            <p>
              ובמודל חודשי אתם מקבלים משהו שחד-פעמי לא נותן: תחזוקה שוטפת, גיבויים, עדכונים, ושותף שנשאר איתכם.
              האתר לא רק עולה — הוא נשאר חי.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסקים חדשים שצריכים אתר מקצועי מהיום',
          'עסקים עם אתר ישן שמחפשים את הילדים הטובים לבנות מחדש',
          'יועצים, פרילנסרים ונותני שירותים שרוצים נוכחות אונליין',
          'עסק שצריך דף נחיתה לקמפיין ממומן',
        ]}
        no={[
          'מי שצריך פלטפורמת SaaS מורכבת (יש חבילת פיתוח נפרדת)',
          'מי שרוצה אתר ב-Wix בחינם (לא מתאים לנו)',
          'מי שלא מוכן להיות חלק מהתהליך ולתת פידבק',
        ]}
      />

      {/* ──── PACKAGE CARD ──── */}
      <section className="sp2-section" id="packages">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="sp-package-with-scissors">
              <div className="sp-scissors-wrap" aria-hidden="true">
                <ScissorsLottie />
              </div>
              <PackageCard pkg={corePackages[1]} />
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
        'תחזוקה כלולה',
        'שיחת אפיון ראשונה חינם',
      ]} />

      {/* ──── FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader
            eyebrow="שאלות נפוצות"
            titleHtml="שאלות שנשאלות<br>לפני כל פרויקט."
          />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="כמה עולה לבנות אתר ב-HELIX?">
                <p>החל מ-1,250 ₪ לחודש. כולל עיצוב, פיתוח, תוכן, SEO בסיסי ותחזוקה שוטפת. בלי דמי הקמה, בלי חוזה.</p>
              </FAQItem>
              <FAQItem question="למה מודל חודשי ולא תשלום חד-פעמי?">
                <p>כי אתר זה לא פרויקט חד-פעמי. הוא צריך תחזוקה, עדכונים, גיבויים ואבטחה. במודל חודשי אתם מקבלים שותף שנשאר — לא ספק שנעלם אחרי ההשקה.</p>
              </FAQItem>
              <FAQItem question="כמה זמן לוקח עד שהאתר באוויר?">
                <p>בממוצע 2-4 שבועות. תלוי בהיקף — דף נחיתה יכול להיות מוכן תוך שבוע, אתר תדמית מלא לוקח 3-4 שבועות.</p>
              </FAQItem>
              <FAQItem question="אני יכול לעדכן תכנים בעצמי?">
                <p>כן. נקיים הדרכה מסודרת ותקבלו עצמאות מלאה לעדכן תכנים בקלות. ואם צריכים עזרה — אנחנו כאן.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם אני רוצה לבטל?">
                <p>הודעה מראש של 30 יום. בלי קנסות, בלי חוזה, בלי סיפורים. האתר שלכם — אתם מקבלים את כל הקבצים.</p>
              </FAQItem>
              <FAQItem question="אתם בונים גם חנויות אונליין?">
                <p>כן. Shopify, WooCommerce, או קוד מותאם. קטלוג מוצרים, עגלת קניות, תשלום ומשלוחים — הכל כלול.</p>
              </FAQItem>
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="ערן ורון — הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── LEAD FORM — FINAL ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── FINAL CTA ──── */}
      <FinalCTA
        title="ספרו לנו מה המטרה שלכם."
        subtitle="הילדים הטובים מחכים לשיחה. אפיון ראשוני בחינם — נבין מה אתם צריכים ונחזור עם כיוון ברור. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

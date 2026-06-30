'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
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
import SalesReviews from './SalesReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import SalesTimeline from './SalesTimeline';
import SalesConstellation from '../../components/SalesConstellation';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על תהליכי מכירה אוטומטיים')}`;

export default function SalesPageClient() {
  return (
    <div className="service-page">
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow="חבילה 05 · תהליכי מכירה אוטומטיים"
        title="SDR שעובד 24/7.<br/>בלי להגדיל צוות."
        subtitle="לידים B2B חמים לא מגיעים מקמפיינים. הם מגיעים מ-outreach חכם, data enrichment ולינקדין. הילדים הטובים של עולם הדיגיטל בונים מערך SDR אוטומטי שעובד גם כשאתה ישן."
        marketPrice="8,000–15,000"
        price="1,250 ₪"
        priceNote="לחודש · בלי חוזה · ביטול בכל עת · בלי דמי הקמה"
        ctaHref={wa}
      />

      {/* ──── 2. NARRATIVE #1 + BURNING MONEY ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נדבר על איך נראה outreach ב-2026.</h2>
              <p>
                שולח 20 הודעות לינקדין ביום. מתוכן 2 עונים. אחד רלוונטי. זה לוקח שעתיים ביום —
                ואתה עושה את זה במקום לסגור עסקאות. או שאתה מגייס SDR ב-15,000 ₪ לחודש, הוא לומד 3 חודשים, מתחיל להניב, ואז עוזב.
              </p>
              <p>
                הילדים הטובים בנו מערך אוטומטי שעושה את כל מה ש-SDR עושה — אבל 24/7,
                עם 200+ הודעות ביום, A/B testing אוטומטי, ומעקב CRM מסודר.
              </p>
              <p className="sp-narrative-highlight">
                1,250 ₪ לחודש. במקום 15,000 ₪ על עובד. הילדים הטובים העבירו את החיסכון אליכם.
              </p>
            </ScrollTextHighlight>
            <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
          </div>
        </div>
      </section>

      {/* ──── 3. PAIN POINTS ──── */}
      <PainSection
        title="מכירים את הסיפור?"
        cards={[
          {
            title: 'SDR עולה 15,000 ₪ בחודש',
            text: 'גייסת איש מכירות. הוא לומד 3 חודשים. מתחיל להניב. ואז עוזב. הילדים הטובים בנו מערך אוטומטי שלא עוזב.',
          },
          {
            title: 'Outreach ידני לא סקיילבילי',
            text: 'שולח הודעות לינקדין אחת אחת. 20 ביום. מתוכן 2 עונים. הילדים הטובים שולחים 200+ הודעות ביום, אוטומטית.',
          },
          {
            title: 'אין Pipeline אמיתי',
            text: 'יודע שיש "כמה לידים" אבל אין מערכת שמראה בדיוק מה הסטטוס של כל ליד. הילדים הטובים בונים CRM מסודר עם דשבורד.',
          },
        ]}
      />

      {/* ──── 4. REVIEWS ──── */}
      <ScrollReveal direction="up">
        <SalesReviews />
      </ScrollReveal>

      {/* ──── 5. LEAD FORM — SOFT #1 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 6. CONSTELLATION ──── */}
      <SalesConstellation />

      {/* ──── 7. TIMELINE ──── */}
      <SalesTimeline />

      {/* ──── 8. SUB-SERVICES GRID (flip cards) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה כלול במערך ה-SDR</h2>
            <p className="sp2-lead">הילדים הטובים בונים מערך מכירות אוטומטי שעובד בשבילך כל יום, כל שעה.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🎯', title: 'אסטרטגיית מכירות', desc: 'מגדירים ICP, מסרים, ערוצים. יודעים למי פונים ולמה.' },
                { icon: '🔍', title: 'Data Enrichment', desc: 'מוצאים את האנשים הנכונים, מעשירים נתונים, מכינים רשימות ממוקדות.' },
                { icon: '💼', title: 'LinkedIn Outreach', desc: 'הודעות מותאמות אישית בלינקדין — אוטומטית, בקנה מידה.' },
                { icon: '📧', title: 'Cold Email', desc: 'סדרות מיילים קרים עם A/B testing — מה שעובד מקבל יותר.' },
                { icon: '🔄', title: 'Pipeline אוטומטי', desc: 'CRM מסודר. כל ליד יודע איפה הוא. דשבורד + דוח ROI שבועי.' },
                { icon: '📊', title: 'מעקב ואופטימיזציה', desc: 'פגישה שבועית + דוח חודשי. עוקבים, מודדים, משפרים.' },
              ].map((svc) => (
                <div key={svc.title} className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <span className="flip-card-icon">{svc.icon}</span>
                      <h3>{svc.title}</h3>
                    </div>
                    <div className="flip-card-back">
                      <span className="flip-card-icon">{svc.icon}</span>
                      <h3>{svc.title}</h3>
                      <p>{svc.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 9. FEATURES ──── */}
      <FeaturesSection
        title="מה כלול בחבילה"
        lead="הילדים הטובים עושים ב-1,250 ₪ מה ש-SDR עולה 15,000 ₪. AI חתך 60% מהעבודה."
        stats={[
          { value: 200, suffix: '+', label: 'הודעות outreach ביום' },
          { value: 15, suffix: 'x', label: 'יותר לידים מ-outreach ידני' },
          { value: 0, suffix: ' ₪', label: 'דמי הקמה' },
        ]}
        features={[
          { title: 'אסטרטגיית מכירות דיגיטלית', text: 'מגדירים ICP, מסרים, ערוצים. יודעים למי פונים, איך, ולמה.' },
          { title: 'Data Enrichment + LinkedIn Sales Navigator', text: 'מוצאים את האנשים הנכונים, מעשירים את הנתונים, מכינים רשימות ממוקדות.' },
          { title: 'תהליכי SDR אוטומטיים', text: 'Outreach sequences שרצים לבד — לינקדין ואימייל. הודעות, follow-ups, תזכורות.' },
          { title: 'A/B טסטינג למסרי פנייה', text: 'בודקים מה עובד הכי טוב — כותרות, תוכן, תזמון. אופטימיזציה מתמדת.' },
          { title: 'דשבורד מכירות + דוח ROI שבועי', text: 'תמונת מצב ברורה. כמה לידים, כמה ענו, כמה התקדמו. מספרים, לא תחושות.' },
          { title: 'פגישה שבועית של 30 דקות', text: 'אתה תמיד יודע מה קורה ויכול לשנות כיוון.' },
        ]}
      />

      {/* ──── 10. NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה 1,250 ₪ ולא 8,000?</h2>
            <p>
              כי AI חתך 60% מהעבודה. מה שלקח SDR שבוע לעשות ידנית — המערכת עושה ביום.
              רוב החברות ניצלו את ההפרש. הילדים הטובים העבירו את החיסכון אליכם.
            </p>
            <p>
              1,250 ₪ לחודש על מערך שעובד 24/7 ושולח 200+ הודעות ביום — זה לא מבצע, זה מה שהגינות נראית כמוה.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── 11. FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסקי B2B שרוצים לידים חמים בלי להגדיל צוות',
          'יועצים ופרילנסרים שמחפשים את הילדים הטובים לבנות outreach',
          'סטארטאפים בשלב מכירות ראשוניות',
          'חברות עם מוצר מוכן שצריכות pipeline מסודר',
        ]}
        no={[
          'B2C (קהל צרכנים רחב — יש חבילת שיווק)',
          'עסק בלי הגדרה ברורה של לקוח יעד (אבל אפשר לבנות)',
          'מי שמחפש "רק רשימת אימיילים" (יש בנק שעות)',
        ]}
      />

      {/* ──── 12. PACKAGE CARD ──── */}
      <section className="sp2-section" id="packages">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="sp-package-with-scissors">
              <div className="sp-scissors-wrap" aria-hidden="true">
                <ScissorsLottie />
              </div>
              <PackageCard pkg={corePackages[4]} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 13. LEAD FORM — STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── 14. TRUST BAR ──── */}
      <TrustBar items={[
        'בלי חוזה',
        'ביטול בכל עת',
        'בלי דמי הקמה',
        'מיפוי ICP ראשוני חינם',
        'פגישת ייעוץ ראשונה חינם',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* ──── 15. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="שאלות שנשאלות<br>לפני שמתחילים outreach." />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="כמה עולה מערך SDR אוטומטי ב-HELIX?">
                <p>החל מ-1,250 ₪ לחודש. כולל אסטרטגיה, data enrichment, outreach אוטומטי, CRM, דוח שבועי ופגישה שבועית. בלי חוזה, בלי דמי הקמה.</p>
              </FAQItem>
              <FAQItem question="למה זה שישית מעלות SDR?">
                <p>AI חתך 60% מהעבודה. מה שלקח SDR שבוע ידנית — המערכת עושה ביום. הילדים הטובים העבירו את החיסכון אליכם.</p>
              </FAQItem>
              <FAQItem question="כמה זמן עד שמתחילים לראות לידים?">
                <p>שבוע-שבועיים להקמה. אחרי זה — הודעות יוצאות כל יום. לידים מתחילים להיכנס בשבוע השני.</p>
              </FAQItem>
              <FAQItem question="באילו ערוצים עובדים?">
                <p>לינקדין ואימייל — או שניהם יחד. כל outreach מותאם אישית עם A/B testing. הילדים הטובים מתאימים את הערוץ לעסק.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם רוצים לבטל?">
                <p>הודעה מראש של 30 יום. בלי קנסות, בלי חוזה. כל מה שנבנה — שלכם.</p>
              </FAQItem>
              <FAQItem question="זה מתאים לעסק קטן?">
                <p>בהחלט. דווקא עסקים קטנים מרוויחים הכי הרבה — כי SDR ב-15,000 ₪ לא אופציה בשבילם. 1,250 ₪ כן.</p>
              </FAQItem>
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="ערן ורון — הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── 16. LEAD FORM — SOFT #3 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 17. FINAL CTA ──── */}
      <FinalCTA
        title="מוכנים שהלידים יתחילו להגיע?"
        subtitle="הילדים הטובים מחכים לשיחה. מיפוי ICP ראשוני בחינם — נבין מי הלקוח האידיאלי שלכם ואיך להגיע אליו. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

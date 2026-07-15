'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const RocketLottie = dynamic(() => import('../../components/RocketLottie'), { ssr: false });
const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import LeadForm from '../../components/sections/LeadForm';
import { PackageCard, extraPackages } from '../../components/sections/Services';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import ToolsShowcase from '../../components/ToolsShowcase';
import ToolsReviews from './ToolsReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import ToolsTimeline from './ToolsTimeline';
import ToolsConstellation from '../../components/ToolsConstellation';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על התוכנות')}`;

export default function ToolsPageClient() {
  return (
    <div className="service-page">
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow="גישה לתוכנות · תשלום חודשי"
        title="תוכנה שעובדת.<br/>בלי לפתח מאפס."
        subtitle="כבר בנינו את התוכנות שהעסק שלך צריך — ניהול מלאי, לידים, תוכן, הנהלת חשבונות וניטור אתרים. תשלום חודשי, גישה מלאה, תמיכה צמודה. בלי פרויקט פיתוח של חודשים."
        marketPrice="15,000–60,000 חד פעמי"
        price="500 ₪"
        priceNote="לתוכנה בודדת · חבילת 3 תוכנות 1,000 ₪ · שבוע ניסיון חינם"
        ctaHref={wa}
      >
        <RocketLottie />
      </ServiceHero>

      {/* ──── 2. NARRATIVE #1 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נדבר על מה שקורה כשמפתחים מאפס.</h2>
              <p>
                מזמינים פרויקט פיתוח. 60,000 ₪. ארבעה חודשים. מקבלים חצי מוצר שצריך עוד חודשיים ועוד 20,000 ₪.
                ואז עוד באגים. ועוד פיצ׳רים. ועוד ספרינט. בסוף שילמת פי שניים ויש לך מערכת שחצי עובדת.
              </p>
              <p>
                אנחנו כבר עשינו את הפיתוח. בנינו תוכנות שעובדות, נבדקו בשטח, ומתעדכנות כל הזמן.
                אתה מקבל גישה מלאה בתשלום חודשי — כמו Netflix, רק לעסק.
              </p>
              <p className="sp-narrative-highlight">
                500 ₪ לחודש לתוכנה. במקום 60,000 ₪ על פיתוח. החיסכון הוא מטורף.
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
            title: 'פרויקט פיתוח שבלע 60K',
            text: 'שילמת על מערכת מותאמת. לקח חודשים. עכשיו כל שינוי עולה עוד כסף. אנחנו כבר בנינו את התוכנה — אתה רק צריך להשתמש.',
          },
          {
            title: 'אקסל זה לא מערכת',
            text: '15 טאבים, 3 גרסאות, אף אחד לא יודע מה המספר הנכון. תוכנה מסודרת עם דשבורד אחד — זה מה שעסק צריך.',
          },
          {
            title: 'הספק נעלם עם הקוד',
            text: 'שילמת, הוא בנה, הוא נעלם. עכשיו אין מי שיתקן באגים. אצלנו התוכנה חיה — תמיכה, עדכונים, ופיצ׳רים חדשים כל הזמן.',
          },
        ]}
      />

      {/* ──── 4. REVIEWS ──── */}
      <ScrollReveal direction="up">
        <ToolsReviews />
      </ScrollReveal>

      {/* ──── 5. LEAD FORM — SOFT #1 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 6. CONSTELLATION ──── */}
      <ToolsConstellation />

      {/* ──── 7. TIMELINE ──── */}
      <ToolsTimeline />

      {/* ──── 8. TOOLS SHOWCASE ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="התוכנות"
              titleHtml="הכלים שכבר בנינו."
              description="כל תוכנה נבדקה בשטח, כוללת תמיכה מלאה, ומתעדכנת באופן שוטף."
            />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <ToolsShowcase />
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 9. FEATURES (flip cards) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה כלול בכל תוכנה</h2>
            <p className="sp2-lead">לא רק גישה — גם תמיכה, עדכונים, והדרכה. ככה זה אמור לעבוד.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🔓', title: 'גישה מלאה', desc: 'כל הפיצ׳רים פתוחים. בלי premium, בלי הגבלות, בלי הפתעות.' },
                { icon: '🔄', title: 'עדכונים שוטפים', desc: 'פיצ׳רים חדשים, שיפורי ביצועים ותיקוני באגים — אוטומטית, בלי עלות נוספת.' },
                { icon: '🛟', title: 'תמיכה צמודה', desc: 'תקלה? שאלה? פגישה שבועית, תמיכה בוואטסאפ, זמן תגובה מהיר.' },
                { icon: '🔗', title: 'אינטגרציות', desc: 'חיבור למערכות קיימות — Shopify, CRM, בנקים, גוגל, וואטסאפ.' },
                { icon: '🎨', title: 'התאמה אישית', desc: 'צריכים פיצ׳ר מותאם? בנק שעות פיתוח תמיד פתוח — 300 ₪ לשעה.' },
                { icon: '📊', title: 'דוח חודשי', desc: 'מקבלים דוח שימוש חודשי — מה עובד, מה אפשר לשפר, ומה חדש.' },
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

      {/* ──── 10. NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה 500 ₪ ולא 60,000?</h2>
            <p>
              כי את הפיתוח כבר עשינו. את ההשקעה הראשונית — ספגנו. את הבאגים — תיקנו.
              אתה מקבל תוכנה מוכנה, נבדקת, עם תמיכה — בלי לעבור את הגהינום של פרויקט פיתוח.
            </p>
            <p>
              500 ₪ לחודש לתוכנה שהייתה עולה עשרות אלפים לפתח מאפס.
              חבילת 3 תוכנות ב-1,000 ₪. שבוע ניסיון חינם. בלי סיכון.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── 11. FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסקים שצריכים כלי עבודה מוכנים בלי לפתח',
          'חנויות eCommerce שרוצות ניהול מלאי חכם',
          'צוותי שיווק שצריכים תוכן AI בעברית',
          'עסקים שרוצים הנהלת חשבונות אוטומטית',
          'בעלי אתרים שצריכים ניטור ותחזוקה',
        ]}
        no={[
          'עסקים שצריכים מערכת מותאמת לחלוטין (יש חבילת פיתוח)',
          'מי שמחפש פיתוח חד-פעמי בלי SaaS (יש בנק שעות)',
          'ארגונים עם צוות פיתוח פנימי שבונה הכל',
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
              <PackageCard pkg={extraPackages[1]} />
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
        'שבוע ניסיון חינם',
        'בלי חוזה',
        'ביטול בכל עת',
        'תמיכה צמודה',
        'עדכונים שוטפים',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* ──── 15. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="שאלות שנשאלות<br>לפני שמתחילים להשתמש." />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="כמה עולה גישה לתוכנה?">
                <p>תוכנה בודדת — 500 ₪ לחודש. חבילת 3 תוכנות — 1,000 ₪ לחודש. כולל תמיכה, עדכונים ודוח חודשי. בלי חוזה.</p>
              </FAQItem>
              <FAQItem question="יש ניסיון חינם?">
                <p>כן. שבוע ניסיון חינם לכל תוכנה. גישה מלאה, בלי כרטיס אשראי, בלי התחייבות.</p>
              </FAQItem>
              <FAQItem question="מה אם צריך פיצ׳ר שלא קיים?">
                <p>בנק שעות פיתוח תמיד פתוח — 300 ₪ לשעה. מאפיינים, בונים, ומוסיפים את הפיצ׳ר לתוכנה שלכם.</p>
              </FAQItem>
              <FAQItem question="איך מתחברים למערכות קיימות?">
                <p>כל תוכנה תומכת באינטגרציות — Shopify, WooCommerce, CRM, גוגל, בנקים, וואטסאפ. ההטמעה כלולה.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם רוצים לבטל?">
                <p>הודעה מראש של 30 יום. בלי קנסות, בלי חוזה. הנתונים שלכם — שלכם.</p>
              </FAQItem>
              <FAQItem question="זה מתאים לעסק קטן?">
                <p>בהחלט. דווקא עסקים קטנים מרוויחים הכי הרבה — כי פיתוח מותאם ב-60,000 ₪ לא אופציה. 500 ₪ לחודש כן.</p>
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
        title="מוכנים לנסות תוכנה שעובדת?"
        subtitle="שבוע ניסיון חינם. גישה מלאה. בלי כרטיס אשראי, בלי התחייבות. ספרו לנו מה העסק צריך ונתאים את התוכנה."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import LeadForm from '../../components/sections/LeadForm';
import { PackageCard, corePackages } from '../../components/sections/Services';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import GrowthReviews from './GrowthReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import GrowthTimeline from './GrowthTimeline';
import GrowthConstellation from '../../components/GrowthConstellation';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על Growth Hacking')}`;

export default function GrowthPageClient() {
  return (
    <div className="service-page">
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow="חבילה 04 · Growth Hacking"
        title="צמיחה שלא תלויה בתקציב.<br/>תלויה בראש."
        subtitle="סוכנויות שיווק זורקות כסף על קמפיינים ומקוות לטוב. הילדים הטובים של עולם הדיגיטל בודקים, מודדים ומשפרים — עם AI שמזהה הזדמנויות צמיחה שאף אחד לא רואה."
        marketPrice="6,000–12,000"
        price="1,250 ₪"
        priceNote="לחודש · בלי חוזה · ביטול בכל עת · בלי דמי הקמה"
        ctaHref={wa}
      />

      {/* ──── 2. NARRATIVE #1 + BURNING MONEY ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נדבר על למה העסק שלך לא גדל.</h2>
              <p>
                הוצאת 10,000 ₪ על קמפיין. לא עבד. אף אחד לא ניתח למה. הוצאת עוד 10,000 על אותו דבר.
                אנשים נכנסים לאתר, ממלאים טופס, חלקם קונים — אבל אין לך מושג איפה אתה מפסיד את רובם.
              </p>
              <p>
                הילדים הטובים לא זורקים כסף. אנחנו בונים מנגנוני צמיחה — ניסויי A/B, אופטימיזציית המרות,
                viral loops, AI chatbots, ו-funnel analysis. כל שבוע ניסוי חדש. כל חודש צמיחה.
              </p>
              <p className="sp-narrative-highlight">
                1,250 ₪ לחודש. AI חתך 60% מהעבודה. הילדים הטובים העבירו את החיסכון אליכם.
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
            title: 'שורפים תקציב בלי ללמוד',
            text: 'הוצאת 10,000 ₪ על קמפיין. לא עבד. אף אחד לא ניתח למה. הילדים הטובים מנתחים כל ניסוי ולומדים ממנו לפני שמשקיעים עוד שקל.',
          },
          {
            title: 'אין מי שמנתח את המשפך',
            text: 'אנשים נכנסים לאתר. חלק קונים. אבל אין לך מושג איפה אתה מפסיד 80% מהם. הילדים הטובים ממפים כל שלב ומתקנים.',
          },
          {
            title: 'צמיחה = עוד תקציב',
            text: 'כל פעם שרוצים לגדול, מגדילים תקציב. אין מנגנון צמיחה אורגני. הילדים הטובים בונים מנגנונים שגורמים ללקוחות להביא עוד לקוחות.',
          },
        ]}
      />

      {/* ──── 4. REVIEWS ──── */}
      <ScrollReveal direction="up">
        <GrowthReviews />
      </ScrollReveal>

      {/* ──── 5. LEAD FORM — SOFT #1 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 6. CONSTELLATION ──── */}
      <GrowthConstellation />

      {/* ──── 7. TIMELINE ──── */}
      <GrowthTimeline />

      {/* ──── 8. SUB-SERVICES (flip cards) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה כלול ב-Growth Hacking</h2>
            <p className="sp2-lead">הילדים הטובים בונים מנגנוני צמיחה שעובדים — עם דאטה, ניסויים ו-AI.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🎯', title: 'אסטרטגיית צמיחה', desc: 'מנתחים את העסק, מזהים הזדמנויות צמיחה עם AI, ובונים תוכנית ניסויים.' },
                { icon: '🧪', title: 'ניסויי A/B', desc: 'כל שבוע ניסוי חדש. כל ניסוי מלמד משהו. המספרים עולים בהתמדה.' },
                { icon: '📊', title: 'Funnel Analysis', desc: 'מאיפה אנשים מגיעים, איפה נופלים, מה גורם להם לסגור. עם מספרים אמיתיים.' },
                { icon: '🔄', title: 'Viral Loops + Referral', desc: 'מנגנונים שגורמים ללקוחות להביא עוד לקוחות. צמיחה אורגנית בלי תקציב.' },
                { icon: '🤖', title: 'AI Chatbot', desc: 'צ\'אטבוט חכם לפלטפורמה לבחירה — פייסבוק, אינסטגרם, לינקדין או אתר. כלול בחבילה.' },
                { icon: '📈', title: 'Growth Metrics + דשבורד', desc: 'מספרים שחשובים, לא מספרים שנראים טוב. דשבורד שמראה ROI אמיתי.' },
                { icon: '🔍', title: 'מחקר מתחרים + מיפוי שוק', desc: 'ניתוח חודשי של מה המתחרים עושים. זיהוי הזדמנויות שהם מפספסים.' },
                { icon: '📅', title: 'פגישה שבועית + דוח חודשי', desc: '30 דקות כל שבוע. דוח מפורט כל חודש. אתה תמיד יודע מה קורה.' },
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

      {/* ──── 9. NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה 1,250 ₪ ולא 8,000?</h2>
            <p>
              כי AI חתך 60% מהעבודה. ניתוח משפכים, מחקר מתחרים, כתיבת ניסויים — מה שלקח שבוע לוקח עכשיו יומיים.
              רוב השוק כיסה על ההפרש. הילדים הטובים העבירו את החיסכון אליכם.
            </p>
            <p>
              1,250 ₪ לחודש על Growth Hacking מלא — אסטרטגיה, ניסויים, AI chatbot, דשבורד ופגישה שבועית. זה לא מבצע, זה מה שהגינות נראית כמוה.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── 11. FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'סטארטאפים שרוצים לצמוח מהר בתקציב סביר',
          'עסקים שמחפשים את הילדים הטובים לבנות מנגנון צמיחה',
          'SaaS שרוצה לשפר activation ו-retention',
          'מי שמוכן לנסות, למדוד ולשפר — לא סתם להוציא כסף',
        ]}
        no={[
          'עסק שרוצה "רק קמפיין בגוגל" (יש חבילת שיווק)',
          'מי שלא מוכן לעבוד עם דאטה ומספרים',
          'מי שמחפש תוצאות בלי להשקיע זמן בפידבק',
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
              <PackageCard pkg={corePackages[3]} />
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
        'אבחון צמיחה ראשוני חינם',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* ──── 15. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="שאלות שנשאלות<br>לפני שמתחילים לצמוח." />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="מה זה Growth Hacking ואיך זה שונה משיווק?">
                <p>שיווק = קמפיינים ותקציב. Growth Hacking = ניסויים, דאטה ומנגנונים אורגניים. הילדים הטובים בונים מנגנוני צמיחה שעובדים גם בלי להגדיל תקציב כל חודש.</p>
              </FAQItem>
              <FAQItem question="כמה עולה Growth Hacking ב-HELIX?">
                <p>החל מ-1,250 ₪ לחודש. כולל אסטרטגיה, ניסויי A/B, funnel analysis, AI chatbot, דוח מתחרים, דשבורד ופגישה שבועית. בלי חוזה, בלי דמי הקמה.</p>
              </FAQItem>
              <FAQItem question="כמה זמן עד שרואים תוצאות?">
                <p>ניסויים ראשונים בשבוע הראשון. תוצאות מדידות תוך 30-60 יום. שיפור ממוצע של 340% בהמרות אחרי 90 יום.</p>
              </FAQItem>
              <FAQItem question="מה ההבדל בין Growth ל-Performance Marketing?">
                <p>Performance = תקציב פרסום + קמפיינים. Growth = מנגנונים שעובדים בלי תקציב. Referral, viral loops, CRO, A/B testing. צמיחה שלא נעצרת כשעוצרים את הכסף.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם רוצים לבטל?">
                <p>הודעה מראש של 30 יום. בלי קנסות, בלי חוזה. כל הדאטה והניסויים — שלכם.</p>
              </FAQItem>
              <FAQItem question="זה מתאים לעסק קטן?">
                <p>דווקא. Growth Hacking נולד בסטארטאפים עם תקציב אפס. 1,250 ₪ זה הרבה פחות ממה שהיית משלם על ניסוי ושגיאה לבד.</p>
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
        title="מוכנים להתחיל לצמוח?"
        subtitle="הילדים הטובים מחכים לשיחה. אבחון צמיחה ראשוני בחינם — נבין איפה ההזדמנויות ונראה לכם את הדרך. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

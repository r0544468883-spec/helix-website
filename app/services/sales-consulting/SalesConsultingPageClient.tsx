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
import SalesConsultingReviews from './SalesConsultingReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import SalesConsultingTimeline from './SalesConsultingTimeline';
import SalesConsultingConstellation from './SalesConsultingConstellation';
import dynamic from 'next/dynamic';

const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
const SalesTeamHeroLottie = dynamic(() => import('../../components/SalesTeamHeroLottie'), { ssr: false });

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על ייעוץ מכירות ופיתוח עסקי')}`;

export default function SalesConsultingPageClient() {
  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow="שירות · מכירות ופיתוח עסקי"
        title="מכונת מכירות.<br/>לא רק אנשי מכירות."
        subtitle="הילדים הטובים של עולם הדיגיטל בונים לכם שיטה — תהליך, תסריטים, CRM ומדידה — כדי שכל ליד יטופל וכל שיחה תיסגר. ומשם, פיתוח עסקי שפותח ערוצי הכנסה חדשים."
        marketPrice="8,000–15,000 חד פעמי"
        price="1,250 ₪"
        priceNote="לחודש · ליווי שוטף · בלי חוזה · בלי דמי הקמה"
        ctaHref={wa}
      >
        <SalesTeamHeroLottie />
      </ServiceHero>

      {/* ──── NARRATIVE #1 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נגיד את מה שכולם יודעים אבל לא אומרים.</h2>
              <p>
                יש לכם מוצר טוב ואנשי מכירות עובדים — אבל כל אחד מוכר אחרת, לידים נכנסים ובורחים,
                ואף אחד לא יודע להגיד איפה בדיוק מפסידים את העסקה. הבעיה היא לא האנשים. היא שאין שיטה.
              </p>
              <p>
                הילדים הטובים בונים מכונת מכירות שלמה — אבחון, אסטרטגיה, תהליך, תסריטים, CRM, הדרכה וליווי.
                החל מ-1,250 ₪ לחודש. בלי חוזה. בלי דמי הקמה.
              </p>
              <p className="sp-narrative-highlight">
                AI ואוטומציה חתכו לנו 60% משעות העבודה. את החיסכון העברנו אליכם — ייעוץ בכיר במחיר שפוי.
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
            title: 'אנשי מכירות בלי שיטה',
            text: 'כל נציג מוכר אחרת, ואין תהליך אחיד או תסריט. התוצאה תלויה במזל. הילדים הטובים בונים שיטה שכל אחד יכול לעבוד לפיה.',
          },
          {
            title: 'לידים נכנסים ובורחים',
            text: 'משקיעים בשיווק, הפניות נכנסות — ואז נעלמות בלי פולואפ. הילדים הטובים מקימים CRM ותהליך שלא נותן לאף ליד ליפול.',
          },
          {
            title: 'אין מספרים, אין שליטה',
            text: 'לא יודעים כמה שיחות, כמה הצעות, כמה נסגר ולמה. הילדים הטובים מקימים דשבורד עם יעדים — לראשונה רואים מה עובד.',
          },
        ]}
      />

      {/* ──── REVIEWS ──── */}
      <ScrollReveal direction="up">
        <SalesConsultingReviews />
      </ScrollReveal>

      {/* ──── LEAD FORM — SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── CONSTELLATION ──── */}
      <SalesConsultingConstellation />

      {/* ──── STEPS TIMELINE ──── */}
      <SalesConsultingTimeline />

      {/* ──── SUB-SERVICES GRID ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בונים</h2>
            <p className="sp2-lead">כל מה שצריך כדי להפוך מכירות מ״תלוי במזל״ ל״מערכת שעובדת״.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🔎', title: 'אבחון תהליך מכירה', desc: 'ממפים מאיפה מגיעים לידים, איך מטפלים בהם ואיפה מפסידים עסקאות. מזהים את נקודות הדליפה ואת ההזדמנויות.' },
                { icon: '🎯', title: 'אסטרטגיה ותמחור', desc: 'אסטרטגיית מכירות ומודל תמחור שמתאימים למוצר ולשוק — כדי שתדעו למי למכור, איך, ובכמה.' },
                { icon: '💬', title: 'תסריטים והתנגדויות', desc: 'תסריטי שיחה לכל שלב, מסרים חדים, וטיפול בהתנגדויות הנפוצות — עד לסגירה.' },
                { icon: '🎓', title: 'הדרכת צוות מכירות', desc: 'מכשירים את הנציגים לעבוד לפי השיטה — תקשורת, שכנוע, וסגירה. הלכה למעשה, לא תיאוריה.' },
                { icon: '🗂', title: 'הקמת CRM ודשבורד', desc: 'מקימים CRM, תהליך פולואפ אוטומטי ודשבורד מכירות עם יעדים ומדדים לכל נציג.' },
                { icon: '🤝', title: 'פיתוח עסקי ושותפויות', desc: 'מיפוי שווקים חדשים, בניית שותפויות וערוצי הכנסה נוספים — צמיחה מעבר למכירה הישירה.' },
                { icon: '🧑‍💼', title: 'גיוס אנשי מכירות', desc: 'מלווים את הגיוס — הגדרת פרופיל, סינון, וקליטה — כדי שהנציג החדש יתחיל לסגור מהר.' },
                { icon: '📈', title: 'ליווי וניהול שוטף', desc: 'פגישה שבועית, מעקב אחר המספרים וכיוונון מתמיד. שותף שנשאר איתכם, לא הרצאה חד-פעמית.' },
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

      {/* ──── FEATURES ──── */}
      <FeaturesSection
        title="מה כלול בליווי"
        lead="הילדים הטובים לא נותנים עצה ונעלמים. בונים איתכם את המערכת ומלווים עד שהיא עובדת."
        stats={[
          { value: 30, label: 'ימים ממוצע עד תהליך מכירה מסודר' },
          { value: 40, suffix: '%', label: 'שיפור ממוצע באחוז הסגירה' },
          { value: 1, suffix: ' / שבוע', label: 'פגישת ליווי וכיוונון' },
        ]}
        features={[
          { title: 'אבחון מכירות מלא', text: 'מיפוי כל תהליך המכירה הקיים וזיהוי נקודות הדליפה — לפני שנוגעים במשהו.' },
          { title: 'אסטרטגיה ותמחור', text: 'תוכנית מכירות ומודל תמחור מותאמים — למי מוכרים, איך, ובכמה.' },
          { title: 'תהליך ותסריטים', text: 'תהליך מכירה מסודר מהפנייה ועד הסגירה, כולל תסריטים וטיפול בהתנגדויות.' },
          { title: 'הכשרת צוות', text: 'הדרכה מעשית לנציגים לעבוד לפי השיטה — עד שזה נכנס לדם.' },
          { title: 'CRM ומדידה', text: 'הקמת CRM, אוטומציית פולואפ ודשבורד עם יעדים ומדדים ברורים.' },
          { title: 'פיתוח עסקי', text: 'שווקים חדשים, שותפויות וערוצי הכנסה — צמיחה שמעבר למכירה היומיומית.' },
        ]}
      />

      {/* ──── NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה 1,250 ₪ לחודש ולא יועץ ב-15,000?</h2>
            <p>
              כי אנחנו לא רק יושבים ומייעצים — אנחנו מקימים את המערכת עצמה, עם אוטומציה ו-AI שחוסכים שעות עבודה.
              יועץ קלאסי גובה על הזמן שלו; אנחנו גובים על התוצאה.
            </p>
            <p>
              ובמודל חודשי אתם מקבלים ליווי שנשאר: פגישה שבועית, מעקב אחר המספרים, וכיוונון מתמיד —
              במקום מסמך המלצות שיושב במגירה.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסקים עם אנשי מכירות בלי תהליך מסודר',
          'עסקים שמקבלים לידים ומאבדים אותם בדרך',
          'מייסדים שצריכים לבנות מכירות מאפס',
          'עסקים שרוצים להיכנס לשוק או ערוץ חדש',
        ]}
        no={[
          'מי שמחפש רק הרצאה חד-פעמית על מכירות',
          'מי שרוצה שנמכור במקומו (יש חבילת SDR אוטומטי)',
          'מי שלא מוכן ליישם ולתת פידבק בדרך',
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
              <PackageCard pkg={corePackages[5]} />
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
        'ליווי שוטף כלול',
        'שיחת אבחון ראשונה חינם',
      ]} />

      {/* ──── FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader
            eyebrow="שאלות נפוצות"
            titleHtml="שאלות שנשאלות<br>לפני שמתחילים."
          />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="במה זה שונה מ-SDR האוטומטי שלכם?">
                <p>ה-SDR האוטומטי מוכר בשבילכם — פנייה יזומה בכל ערוץ. הייעוץ כאן בונה לכם את השיטה, התהליך והצוות שלכם. הרבה עסקים לוקחים את שניהם יחד.</p>
              </FAQItem>
              <FAQItem question="כמה עולה ליווי מכירות ופיתוח עסקי?">
                <p>החל מ-1,250 ₪ לחודש, כולל אבחון, בניית תהליך, הקמת CRM, הדרכה וליווי שוטף. בלי דמי הקמה, בלי חוזה.</p>
              </FAQItem>
              <FAQItem question="כמה זמן עד שרואים תוצאות?">
                <p>תהליך מכירה מסודר עומד תוך כ-30 יום. שיפור באחוזי הסגירה מתחיל להיראות תוך חודש-חודשיים, ככל שהצוות מיישם.</p>
              </FAQItem>
              <FAQItem question="אתם עובדים עם הצוות הקיים שלי?">
                <p>כן. אנחנו בונים את השיטה ומכשירים את הנציגים שכבר יש לכם. ואם צריך לגייס — נלווה גם את הגיוס.</p>
              </FAQItem>
              <FAQItem question="גם מקימים לי CRM?">
                <p>כן. מקימים CRM (HubSpot, Pipedrive, monday ועוד), מחברים אוטומציות פולואפ ובונים דשבורד עם יעדים לכל נציג.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם אני רוצה לבטל?">
                <p>הודעה מראש של 30 יום. בלי קנסות, בלי חוזה. כל מה שבנינו — התהליך, התסריטים וה-CRM — נשאר שלכם.</p>
              </FAQItem>
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="ערן ורון — הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── LEAD FORM — FINAL SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── FINAL CTA ──── */}
      <FinalCTA
        title="תפסיקו למכור לפי מזל."
        subtitle="הילדים הטובים מחכים לשיחה. שיחת אבחון ראשונה בחינם — נבין איפה אתם מפסידים עסקאות ונחזור עם תוכנית. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

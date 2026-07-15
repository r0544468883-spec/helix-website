'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const DevTerminalLottie = dynamic(() => import('../../components/DevTerminalLottie'), { ssr: false });
const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
import ServiceHero from '../../components/service/ServiceHero';
import DevelopmentConstellation from '../../components/DevelopmentConstellation';
import PainSection from '../../components/service/PainSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import LeadForm from '../../components/sections/LeadForm';
import { PackageCard, extraPackages } from '../../components/sections/Services';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import DevelopmentReviews from './DevelopmentReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import DevelopmentTimeline from './DevelopmentTimeline';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על פיתוח תוכנה בהתאמה')}`;

export default function DevelopmentPageClient() {
  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow="פיתוח בהתאמה · בנק שעות"
        title="תוכנה שעובדת בדיוק<br/>כמו שהעסק שלך צריך."
        subtitle="הילדים הטובים של עולם הדיגיטל לא בונים מה שנוח — בונים מה שמתאים. MVP, פיצ׳רים, אינטגרציות, ייעוץ AI. בנק שעות גמיש, בלי חוזה, בלי הפתעות."
        marketPrice="450–600 ₪ לשעה"
        price="300 ₪"
        priceNote="לשעה · חבילות מ-800 ₪ · שיחת אפיון ראשונה חינם"
        ctaHref={wa}
      >
        <DevTerminalLottie />
      </ServiceHero>

      {/* ──── NARRATIVE #1 + BURNING MONEY ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נדבר על מה שקורה בשטח.</h2>
              <p>
                הזמנת מערכת מפיתוח. הבטיחו 3 חודשים. עברה שנה ויש חצי מוצר.
                החשבון עלה פי שלוש. &quot;הייתה מורכבות שלא צפינו.&quot;
                כשביקשת תיקון — הספק כבר עבר לפרויקט אחר.
              </p>
              <p>
                הילדים הטובים עובדים אחרת. בנק שעות שקוף — אתה יודע בדיוק על מה משלם.
                ספרינטים קצרים עם דמו חי בסוף כל שבוע. ואם משהו לא עובד — מתקנים, לא מתעלמים.
              </p>
              <p className="sp-narrative-highlight">
                החל מ-300 ₪ לשעה. חבילות מ-800 ₪. שיחת אפיון ראשונה — חינם.
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
            title: 'ה-MVP שלקח שנה',
            text: 'הזמנת מערכת פשוטה. הספק אמר 3 חודשים. עברה שנה ויש חצי מוצר, חצי באגים, ואפס תיעוד. הילדים הטובים מתחייבים על זמנים — ועומדים בהם.',
          },
          {
            title: 'הספק נעלם עם הקוד',
            text: 'פיתחו לך מערכת. הספק עבר לפרויקט אחר. יש באג ואין מי שיתקן. אצלנו הקוד שלך — תמיד. ואנחנו תמיד כאן.',
          },
          {
            title: 'עלות שפוחתה פי שלוש',
            text: 'הסכמתם על 30,000. החשבון עלה ל-80,000. "הייתה מורכבות." אצלנו יש בנק שעות שקוף — אתה רואה כל שעה, כל משימה, כל שקל.',
          },
        ]}
      />

      {/* ──── REVIEWS ──── */}
      <ScrollReveal direction="up">
        <DevelopmentReviews />
      </ScrollReveal>

      {/* ──── LEAD FORM — SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── DEV TOOLS CONSTELLATION ──── */}
      <DevelopmentConstellation />

      {/* ──── STEPS TIMELINE ──── */}
      <DevelopmentTimeline />

      {/* ──── SUB-SERVICES GRID (flip cards) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בונים</h2>
            <p className="sp2-lead">כל מה שעסק צריך מצד הפיתוח — תחת קורת גג אחת.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🚀', title: 'MVP ומוצרים חדשים', desc: 'מרעיון למוצר עובד. אפיון, עיצוב, פיתוח והשקה. ספרינטים קצרים עם דמו בסוף כל שלב.' },
                { icon: '⚙', title: 'פיצ׳רים למוצר קיים', desc: 'צריך לשדרג מערכת? להוסיף יכולות? אנחנו נכנסים לקוד קיים ומוסיפים בלי לשבור.' },
                { icon: '🔗', title: 'אינטגרציות בין מערכות', desc: 'CRM, ERP, WhatsApp, Stripe, Zapier, n8n — מחברים מערכות שלא מדברות ביניהן.' },
                { icon: '🤖', title: 'פתרונות AI מותאמים', desc: 'צ׳אטבוטים, מנועי סיכום, ניתוח טקסט, אוטומציות חכמות. AI שעובד בשביל העסק שלך.' },
                { icon: '📱', title: 'אפליקציות ו-PWA', desc: 'אפליקציות Web, PWA, ואפליקציות מובייל. חוויית משתמש מעולה בכל מכשיר.' },
                { icon: '🗄', title: 'דשבורדים ומערכות ניהול', desc: 'מערכות back-office, דשבורדים, ניהול לקוחות, דוחות אוטומטיים. כל מה שהעסק צריך.' },
                { icon: '🔒', title: 'אבטחת מידע ותחזוקה', desc: 'קוד נקי, בדיקות אוטומטיות, CI/CD, אבטחת מידע. לא רק בונים — שומרים.' },
                { icon: '💡', title: 'ייעוץ טרנספורמציה ל-AI', desc: 'מיפוי תהליכים, זיהוי הזדמנויות, בחירת כלים והטמעה. מביאים AI לתוך העסק.' },
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

      {/* ──── FEATURES (flip cards) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה כלול בבנק השעות</h2>
            <p className="sp2-lead">משלם על מה שצורך. לא על חבילה שלא מתאימה. כל שעה כוללת פיתוח, אפיון, או ייעוץ — לפי מה שצריך.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🎯', title: 'ספרינטים עם דמו חי', desc: 'כל שבוע-שבועיים אתה רואה מוצר עובד. לא מצגת, לא mockup — קוד אמיתי שרץ.' },
                { icon: '⚡', title: 'Stack מודרני ומוכח', desc: 'React, Next.js, Node.js, Python, .NET, AWS, GCP. בוחרים את הכלי הנכון לפרויקט.' },
                { icon: '🔐', title: 'הקוד שלך — תמיד', desc: 'הקוד נכתב ב-GitHub שלך. תיעוד מלא. אתה לא תלוי בנו ולא נעלם שום דבר.' },
                { icon: '📊', title: 'פגישה שבועית + דוח שעות', desc: '30 דקות כל שבוע עם דמו חי. דוח חודשי שקוף על כל שעה ומשימה.' },
                { icon: '🤖', title: 'AI-first approach', desc: 'משלבים AI בכל שלב — מאפיון ועד ייצור. חוסכים 40-60% מזמן הפיתוח.' },
                { icon: '🛟', title: 'תמיכה אחרי השקה', desc: 'לא נעלמים. באגים, שיפורים, פיצ׳רים חדשים — בנק השעות תמיד פתוח.' },
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

      {/* ──── NARRATIVE: בנק שעות ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה בנק שעות ולא הצעת מחיר סגורה?</h2>
            <p>
              כי פרויקטי פיתוח משתנים. הדרישות מתפתחות. מה שנראה פשוט מתגלה כמורכב,
              ומה שנראה מורכב לפעמים פשוט. בנק שעות נותן לך גמישות מלאה.
            </p>
            <p>
              אתה רואה בדיוק על מה שילמת. אתה יכול לשנות כיוון באמצע. ואתה לא משלם
              על שעות שלא השתמשת בהן. שקיפות מלאה, בכל רגע.
            </p>
            <p className="sp-narrative-highlight">
              שעה בודדת — 300 ₪. חבילת 3 שעות — 800 ₪. ספרינט 5 שעות — 1,250 ₪.
              מעל 10 שעות — 220 ₪ לשעה.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'יזמים שצריכים MVP עובד במהירות',
          'עסקים שצריכים פיצ׳ר חדש למוצר קיים',
          'חברות שרוצות לשלב AI בתהליכי העבודה',
          'מי שצריך אינטגרציה בין מערכות שלא מדברות',
          'פרויקטים עם scope ברור ודדליין',
        ]}
        no={[
          '"יש לי רעיון, תבנה לי פייסבוק" — בלי scope ובלי תקציב',
          'מי שמחפש את המחיר הכי נמוך בלי להתפשר על איכות',
          'פרויקטים בלי בעל מוצר זמין שנותן פידבק',
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
              <PackageCard pkg={{ ...extraPackages[0], href: '#faq' }} />
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
        'שיחת אפיון ראשונה חינם',
        'הצעת מחיר מפורטת לפני התחלה',
        'שקיפות מלאה על שעות',
        'הקוד שלך — תמיד',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* ──── FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader
            eyebrow="שאלות נפוצות"
            titleHtml="שאלות שנשאלות<br>לפני כל פרויקט פיתוח."
          />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="כמה עולה פיתוח ב-HELIX?">
                <p>שעת פיתוח או ייעוץ — 300 ₪. חבילת 3 שעות — 800 ₪ (חוסכים 100 ₪). ספרינט 5 שעות — 1,250 ₪ (חוסכים 250 ₪). מעל 10 שעות — 220 ₪ לשעה.</p>
              </FAQItem>
              <FAQItem question="מה ההבדל בין בנק שעות להצעת מחיר סגורה?">
                <p>בנק שעות נותן גמישות — אפשר לשנות כיוון, להוסיף פיצ׳רים, או לעצור. אתה משלם רק על מה שצרכת. בהצעה סגורה, כל שינוי עולה כסף נוסף.</p>
              </FAQItem>
              <FAQItem question="באיזה טכנולוגיות אתם עובדים?">
                <p>React, Next.js, Node.js, Python, .NET, AWS, GCP, Supabase, ועוד. בוחרים את ה-stack הנכון לפרויקט — לא את מה שנוח לנו.</p>
              </FAQItem>
              <FAQItem question="כמה זמן לוקח לבנות MVP?">
                <p>בממוצע 4-8 שבועות, תלוי בהיקף. כל שבוע אתה רואה התקדמות — דמו חי, לא מצגת. MVP פשוט יכול להיות מוכן תוך 3 שבועות.</p>
              </FAQItem>
              <FAQItem question="מי הבעלים של הקוד?">
                <p>אתה. הקוד נכתב ב-GitHub שלך, עם תיעוד מלא. אתה לא תלוי בנו — יכול להעביר לכל מפתח אחר בכל רגע.</p>
              </FAQItem>
              <FAQItem question="אתם עושים גם ייעוץ AI בלי פיתוח?">
                <p>כן. שעת ייעוץ — 300 ₪. מיפוי תהליכים, זיהוי הזדמנויות לאוטומציה ול-AI, בחירת כלים, והכוונה לטרנספורמציה דיגיטלית.</p>
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
        title="ספרו לנו מה צריך. נחזור עם הצעה."
        subtitle="הילדים הטובים מחכים לשיחה. שיחת אפיון ראשונה בחינם — נבין מה צריך, נחזור עם תוכנית עבודה ואומדן שעות. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

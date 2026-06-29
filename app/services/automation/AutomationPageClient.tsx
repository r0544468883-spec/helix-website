'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
const AutomationHeroLottie = dynamic(() => import('../../components/AutomationHeroLottie'), { ssr: false });
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
import AutomationReviews from './AutomationReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import AutomationTimeline from './AutomationTimeline';
import AutomationConstellation from '../../components/AutomationConstellation';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אוטומציות')}`;

export default function AutomationPageClient() {
  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow="חבילה 03 · אוטומציות"
        title="שהמכונה תעבוד.<br/>לא אתה."
        subtitle="לידים שנופלים בין הכיסאות, CRM ריק, אימיילים ביד. הילדים הטובים של עולם הדיגיטל מסדרים את כל התהליכים שלך — ואתה חוזר לעשות מה שאתה יודע הכי טוב."
        marketPrice="4,000–8,000"
        price="1,250 ₪"
        priceNote="לחודש · בלי חוזה · ביטול בכל עת · בלי דמי הקמה"
        ctaHref={wa}
      >
        <AutomationHeroLottie />
      </ServiceHero>

      {/* ──── NARRATIVE #1 + BURNING MONEY ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נדבר על כמה זמן אתה שורף כל יום.</h2>
              <p>
                אתה שולח מיילים ביד. מעדכן סטטוסים באקסל. עוקב אחרי לידים בראש.
                ליד נכנס ב-3 בלילה — אתה מגיע אליו בצהריים. עד אז הוא כבר סגר עם מישהו אחר.
              </p>
              <p>
                זה לא בגלל שאתה לא טוב. זה בגלל שאתה עובד בלי מערכת.
                אנחנו רואים את זה כל שבוע — עסקים עם מוצר מעולה שמפסידים לקוחות כי התהליך שבור.
              </p>
              <p className="sp-narrative-highlight">
                הילדים הטובים מסדרים את זה ב-1,250 ₪ לחודש. מיפוי, הטמעה, ואופטימיזציה שוטפת. בלי חוזה.
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
            title: 'לידים שנעלמים',
            text: 'מילאו טופס באתר. אף אחד לא חזר אליהם בזמן. עד שהתפנית — הם כבר סגרו עם מישהו אחר. הילדים הטובים דואגים שכל ליד מקבל תשובה תוך דקות, אוטומטית.',
          },
          {
            title: 'CRM ריק או בלאגן',
            text: 'קנית מערכת ב-200 דולר לחודש. אף אחד בצוות לא מזין נתונים. המערכת ריקה ואתה חוזר לאקסל. הילדים הטובים מטמיעים CRM שעובד בפועל — לא רק בתיאוריה.',
          },
          {
            title: 'הכל ידני, הכל לוקח זמן',
            text: 'שולח מיילים ביד, מעדכן סטטוסים ביד, עוקב אחרי לידים ביד. יש לך עסק, לא משרד דואר. הילדים הטובים הופכים את הידני לאוטומטי.',
          },
        ]}
      />

      {/* ──── REVIEWS ──── */}
      <ScrollReveal direction="up">
        <AutomationReviews />
      </ScrollReveal>

      {/* ──── LEAD FORM — SOFT #1 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── AUTOMATION TOOLS CONSTELLATION ──── */}
      <AutomationConstellation />

      {/* ──── STEPS TIMELINE ──── */}
      <AutomationTimeline />

      {/* ──── SUB-SERVICES GRID ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו מחברים</h2>
            <p className="sp2-lead">כל כלי שהעסק שלך צריך — מחובר, אוטומטי, ועובד 24/7.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🔗', title: 'CRM + Pipeline', desc: 'HubSpot, Monday, Pipedrive — הטמעה מלאה עם תהליכי מכירה אוטומטיים. כל ליד במקום הנכון.' },
                { icon: '📧', title: 'Email Automation', desc: 'סדרות מיילים אוטומטיות — welcome, nurturing, follow-up. הליד מחומם עוד לפני שהרמת טלפון.' },
                { icon: '💬', title: 'WhatsApp Business', desc: 'הודעות אוטומטיות, תגובות מיידיות, והודעות follow-up. הלקוח מקבל תשובה גם ב-3 בלילה.' },
                { icon: '⚡', title: 'Zapier / Make', desc: 'חיבור בין כל הכלים. טופס באתר → CRM → מייל → WhatsApp → Google Sheets. אוטומטי.' },
                { icon: '📊', title: 'דוחות ודשבורדים', desc: 'דשבורד שמראה בדיוק מה קורה. כמה לידים, מאיפה, באיזה שלב. בלי לנחש.' },
                { icon: '🤖', title: 'צ\'אטבוטים', desc: 'בוט חכם לאתר, פייסבוק או WhatsApp. עונה על שאלות, אוסף לידים, מתאם פגישות.' },
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
        lead="הילדים הטובים לא מקימים ועוזבים. מיפוי, הטמעה, ניהול שוטף — הכל ב-1,250 ₪ לחודש."
        stats={[
          { value: 73, suffix: '%', label: 'חיסכון בעבודה ידנית' },
          { value: 3, suffix: 'x', label: 'שיפור בזמן תגובה ללידים' },
          { value: 0, suffix: ' ₪', label: 'דמי הקמה' },
        ]}
        features={[
          { title: 'מיפוי תהליכים ואסטרטגיה', text: 'יושבים איתך, מבינים את ה-flow, מזהים איפה אוטומציה תחסוך הכי הרבה זמן ותביא הכי הרבה כסף.' },
          { title: 'הטמעת CRM + Email + Lead Nurturing', text: 'מחברים את הכלים, מגדירים את התהליכים, מוודאים שהכל עובד. לא רק "מתקינים".' },
          { title: 'Funnel אוטומטי מקצה לקצה', text: 'מהרגע שליד נכנס, דרך חימום, ועד סגירה. הכל רץ לבד.' },
          { title: 'מעקב ואופטימיזציה שוטפת', text: 'לא רק מקימים ועוזבים. עוקבים, מודדים, משפרים. כל חודש.' },
          { title: 'דוח חודשי שאפשר להבין', text: 'כמה לידים נכנסו, כמה הומרו, איפה התקועים. מספרים, לא תחושות.' },
          { title: 'פגישה שבועית', text: '30 דקות כל שבוע. אתה יודע מה קורה ויכול לשנות כיוון.' },
        ]}
      />

      {/* ──── NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה 1,250 ₪ ולא 5,000?</h2>
            <p>
              כי AI חתך לנו 60% משעות העבודה. מה שלקח שבוע של הטמעה לוקח עכשיו יומיים.
              רוב השוק ניצל את ההפרש. הילדים הטובים העבירו את החיסכון אליכם.
            </p>
            <p>
              ובמודל חודשי אתם מקבלים משהו שחד-פעמי לא נותן: מישהו שנשאר, מנטר, ומשפר.
              האוטומציה לא רק עולה — היא ממשיכה לעבוד ולהשתפר.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסקים שעושים הכל ביד ורוצים להפסיק לשרוף זמן',
          'מי שיש לו CRM שאף אחד לא משתמש בו',
          'עסקים עם תהליך מכירה שחוזר על עצמו ואפשר לאטמט',
          'מי שמפסיד לידים כי לא מגיב מספיק מהר',
        ]}
        no={[
          'עסק בלי תהליך מכירה ברור (אבל אפשר לבנות אחד)',
          'מי שמחפש "רק לחבר Zapier אחד" (יש את חבילת בנק השעות)',
          'מי שלא מוכן להשקיע שעה בשבוע לפגישה ופידבק',
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
              <PackageCard pkg={corePackages[2]} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── LEAD FORM — STRONG #2 ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── TRUST BAR ──── */}
      <TrustBar items={[
        'בלי חוזה',
        'ביטול בכל עת',
        'בלי דמי הקמה',
        'מיפוי תהליכים ראשוני חינם',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* ──── FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader
            eyebrow="שאלות נפוצות"
            titleHtml="שאלות שנשאלות<br>לפני כל פרויקט אוטומציה."
          />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="כמה עולה אוטומציה ב-HELIX?">
                <p>החל מ-1,250 ₪ לחודש. כולל מיפוי, הטמעה, CRM, אימיילים, ניהול שוטף, דוח חודשי ופגישה שבועית. בלי חוזה, בלי דמי הקמה.</p>
              </FAQItem>
              <FAQItem question="אני כבר משתמש ב-CRM אבל זה לא עובד">
                <p>זה המצב הכי נפוץ. אנחנו לוקחים את מה שיש לכם, מנקים, מגדירים תהליכים, ומוודאים שהצוות באמת משתמש. לא צריך להחליף מערכת — צריך להגדיר אותה נכון.</p>
              </FAQItem>
              <FAQItem question="כמה זמן לוקח להטמיע?">
                <p>אוטומציה בסיסית (לידים → CRM → מייל) מוכנה תוך שבוע. מערכת מלאה עם funnels ו-nurturing לוקחת 2-4 שבועות.</p>
              </FAQItem>
              <FAQItem question="עם אילו כלים אתם עובדים?">
                <p>HubSpot, Monday, Pipedrive, Zapier, Make, SendPulse, WhatsApp Business API, Google Sheets — ועוד. אנחנו מתאימים את הכלי לעסק, לא ההפך.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם אני רוצה לבטל?">
                <p>הודעה מראש של 30 יום. בלי קנסות, בלי חוזה. כל מה שנבנה — שלכם.</p>
              </FAQItem>
              <FAQItem question="אני עסק קטן, זה מתאים לי?">
                <p>בהחלט. דווקא עסקים קטנים מרוויחים הכי הרבה מאוטומציה — כי כל שעה שנחסכת שווה כסף אמיתי.</p>
              </FAQItem>
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="ערן ורון — הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── LEAD FORM — SOFT #3 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── FINAL CTA ──── */}
      <FinalCTA
        title="כמה זמן אתה עוד הולך לעשות הכל ביד?"
        subtitle="הילדים הטובים מחכים לשיחה. מיפוי תהליכים ראשוני בחינם — נבין איפה אתם שורפים זמן ונראה לכם איך לאטמט את זה. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

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
        eyebrow="חבילה 03 · אוטומציות חכמות"
        title="אוטומציות שעובדות ברקע.<br/>בזמן שאתה מנהל עסק."
        subtitle="אוטומציה חכמה הופכת משימות שחוזרות על עצמן לתהליך שעובד לבד. לידים נכנסים, הודעות נשלחות, סטטוסים מתעדכנים — הכל זורם אוטומטית בין המערכות. הילדים הטובים מסדרים את זה."
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
              <h2>בעסק שגדל, אי אפשר להמשיך לעשות הכל ביד.</h2>
              <p>
                אוטומציה טובה לא מחליפה אנשים — היא משחררת אותם מהעבודה השחורה כדי שיוכלו להתעסק
                במכירות, שירות, יצירה וצמיחה. במקום לרדוף אחרי לידים, לשלוח תזכורות ולעדכן אקסלים — המערכת עושה את זה בשבילך.
              </p>
              <p>
                זמן תגובה מתקצר — הלקוח מקבל מענה מיידי. חיסכון בזמן — פחות הודעות ידניות,
                פחות מעקבים. חיסכון בכסף — פחות טעויות, יותר המרות.
              </p>
              <p className="sp-narrative-highlight">
                הילדים הטובים מסדרים את כל זה ב-1,250 ₪ לחודש. בלי חוזה. בלי דמי הקמה.
              </p>
            </ScrollTextHighlight>
            <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
          </div>
        </div>
      </section>

      {/* ──── PAIN POINTS — איך אוטומציות עוזרות ──── */}
      <PainSection
        title="איך אוטומציות חכמות עוזרות ביום יום?"
        cards={[
          {
            title: 'לידים נכנסים ישר ל-CRM',
            text: 'פניות מטפסים, פייסבוק, דפי נחיתה או WhatsApp — הכל נכנס אוטומטית למקום אחד. לא הולך לאיבוד. הילדים הטובים דואגים שכל ליד מקבל תשובה תוך דקות.',
          },
          {
            title: 'הודעות מעקב נשלחות בזמן',
            text: 'תזכורות, אישורי הגעה, תודות אחרי פגישה — הכל נשלח אוטומטית ברגע הנכון. בלי שתזכור, בלי שתשכח.',
          },
          {
            title: 'תהליך מסודר במקום סלט',
            text: 'במקום הודעות, קבצים, אקסלים ותזכורות בטלפון — אתה רואה תהליך ברור. סטטוסים מתעדכנים לבד, נתונים זורמים בין מערכות, ואתה יודע בדיוק מה קורה.',
          },
        ]}
      />

      {/* ──── DASHBOARD STATS ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="דשבורד ביצועים"
              titleHtml="המספרים מדברים."
            />
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.12}>
            <div className="sp-services-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="sp-service-card" style={{ textAlign: 'center' }}>
                <div className="sp-service-icon" style={{ fontSize: '2rem' }}>⚡</div>
                <h3>00:06 שניות</h3>
                <p>זמן תגובה ממוצע. הודעה ראשונה נשלחת אוטומטית לפי טריגר מהאתר או מהוואטסאפ.</p>
              </div>
              <div className="sp-service-card" style={{ textAlign: 'center' }}>
                <div className="sp-service-icon" style={{ fontSize: '2rem' }}>⏱</div>
                <h3>31.5 שעות</h3>
                <p>חיסכון חודשי בממוצע. כולל פולואפים, תיאומים, ועדכון סטטוסים ונתונים אוטומטי.</p>
              </div>
              <div className="sp-service-card" style={{ textAlign: 'center' }}>
                <div className="sp-service-icon" style={{ fontSize: '2rem' }}>💰</div>
                <h3>₪ 11,000</h3>
                <p>חיסכון כספי משוער בחודש. מבוסס על זמן צוות שנחסך וצמצום טעויות בתהליך.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── REVIEWS ──── */}
      <ScrollReveal direction="up">
        <AutomationReviews />
      </ScrollReveal>

      {/* ──── LEAD FORM — SOFT #1 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── AUTOMATION FLOW EXAMPLE ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="דוגמה לזרימה אוטומטית"
              titleHtml="ככה ליד הופך ללקוח<br/>בלי שתגע."
            />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <div className="sp-flow-steps">
              {[
                { icon: '📋', label: 'ליד משאיר פרטים', sub: 'באתר / בפייסבוק / בוואטסאפ' },
                { icon: '→', label: '' },
                { icon: '🔗', label: 'נכנס אוטומטית ל-CRM', sub: 'עם כל הפרטים + מקור הליד' },
                { icon: '→', label: '' },
                { icon: '💬', label: 'נשלחת הודעת WhatsApp', sub: 'סינון ראשוני אוטומטי' },
                { icon: '→', label: '' },
                { icon: '📅', label: 'נקבעת פגישה ביומן', sub: 'אם ענה — תזכורת אוטומטית' },
                { icon: '→', label: '' },
                { icon: '🔄', label: 'פולואפ אם לא ענה', sub: 'תזכורת אחרי 24/48/72 שעות' },
              ].map((step, i) => (
                <div key={i} className={step.label ? 'sp-flow-step' : 'sp-flow-arrow'}>
                  <span className="sp-flow-icon">{step.icon}</span>
                  {step.label && <span className="sp-flow-label">{step.label}</span>}
                  {step.sub && <span className="sp-flow-sub">{step.sub}</span>}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── AUTOMATION TOOLS CONSTELLATION ──── */}
      <AutomationConstellation />

      {/* ──── STEPS TIMELINE ──── */}
      <AutomationTimeline />

      {/* ──── SUB-SERVICES GRID — מה אנחנו בונים ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בונים באוטומציות חכמות</h2>
            <p className="sp2-lead">אוטומציות שמייצרות עסק שעובד יעיל — תגובה מהירה, פולואפים בזמן, ושליטה אמיתית.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🔗', title: 'חיבור בין מערכות', desc: 'CRM, טפסים, פלטפורמות פרסום, WhatsApp, מיילים — הכל מחובר ומסונכרן אוטומטית.' },
                { icon: '📈', title: 'זרימת ליד חדש', desc: 'מרגע שנכנס ועד שהוא נסגר כלקוח משלם — תהליך ברור, אוטומטי, בלי שום דבר נופל.' },
                { icon: '🤝', title: 'Onboarding ללקוחות', desc: 'הודעות, תזכורות, מסמכים ומעקב אוטומטי ללקוחות חדשים. רושם ראשוני מקצועי.' },
                { icon: '🤖', title: 'חיבור לסוכן AI', desc: 'אוטומציות שמתחברות ל-ChatGPT, לדשבורדים ולמערכות קיימות. העתיד כבר כאן.' },
                { icon: '📊', title: 'דשבורדים ודוחות', desc: 'דשבורד שמראה בדיוק מה קורה. כמה לידים, מאיפה, באיזה שלב. בלי לנחש.' },
                { icon: '💬', title: 'WhatsApp + צ\'אטבוטים', desc: 'מענה מיידי 24/7, סינון לידים, תיאום פגישות — הכל אוטומטי דרך WhatsApp.' },
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

      {/* ──── INDUSTRY EXAMPLES ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="לפי ענף"
              titleHtml="אוטומציה מותאמת<br/>לעסק שלך."
            />
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '⚖️', title: 'עורכי דין', desc: 'קליטת לקוח חדש → פתיחת תיק + שליחת מסמכים + תזכורת מעקב. הכל אוטומטי.' },
                { icon: '🏥', title: 'קליניקות ומרפאות', desc: 'קביעת תורים אוטומטית, תזכורות SMS/WhatsApp, סנכרון עם יומן.' },
                { icon: '🛒', title: 'חנויות אונליין', desc: 'הזמנה → עדכון מלאי + הודעת שליחה + בקשת חוות דעת אוטומטית.' },
                { icon: '🏠', title: 'נדל"ן', desc: 'ליד חדש → שיבוץ לסוכן + שליחת נכסים מתאימים + מעקב אוטומטי.' },
                { icon: '🍽', title: 'מסעדות ובתי קפה', desc: 'הזמנות אונליין → מטבח + חשבונית אוטומטית, תזכורות הזמנה, ניהול מלאי.' },
                { icon: '💼', title: 'יועצים ופרילנסרים', desc: 'ליד → הצעת מחיר → חוזה → חשבונית. כל שלב אוטומטי, אתה מתעסק בעבודה עצמה.' },
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

      {/* ──── AUTOMATION vs EMPLOYEE ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="השוואה"
              titleHtml="אוטומציה חכמה<br/>מול עובד נוסף."
            />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <div className="sp-compare-table" dir="rtl">
              <table>
                <thead>
                  <tr>
                    <th>קריטריון</th>
                    <th>עובד נוסף</th>
                    <th className="sp-compare-highlight">אוטומציה חכמה</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>עלות חודשית</td><td>7,000–12,000 ₪</td><td className="sp-compare-highlight">1,250 ₪</td></tr>
                  <tr><td>זמינות</td><td>8–10 שעות/יום</td><td className="sp-compare-highlight">24/7/365</td></tr>
                  <tr><td>טעויות</td><td>אנושיות, לא נמנעות</td><td className="sp-compare-highlight">אפס טעויות</td></tr>
                  <tr><td>סקלאביליות</td><td>מוגבלת</td><td className="sp-compare-highlight">בלתי מוגבלת</td></tr>
                  <tr><td>זמן הכשרה</td><td>2–4 שבועות</td><td className="sp-compare-highlight">3–7 ימי עבודה</td></tr>
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── FEATURES ──── */}
      <FeaturesSection
        title="מה כלול בחבילה"
        lead="הילדים הטובים לא מקימים ועוזבים. מיפוי, הטמעה, ניהול שוטף — הכל ב-1,250 ₪ לחודש."
        stats={[
          { value: 31, suffix: ' שעות', label: 'חיסכון חודשי בממוצע' },
          { value: 6, suffix: ' שניות', label: 'זמן תגובה ממוצע לליד' },
          { value: 11000, suffix: ' ₪', label: 'חיסכון כספי משוער בחודש' },
        ]}
        features={[
          { title: 'מיפוי תהליכים ואסטרטגיה', text: 'יושבים איתך, מבינים את ה-flow, מזהים איפה אוטומציה תחסוך הכי הרבה זמן ותביא הכי הרבה כסף.' },
          { title: 'הטמעת CRM + Email + Lead Nurturing', text: 'מחברים את הכלים, מגדירים את התהליכים, מוודאים שהכל עובד. לא רק "מתקינים".' },
          { title: 'Funnel אוטומטי מקצה לקצה', text: 'מרגע שליד נכנס, דרך חימום ומעקב, ועד סגירה. הכל רץ לבד.' },
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

      {/* ──── MICHAL STORY — SOCIAL PROOF ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>מרגישים כמו מיכל?</h2>
            <p>
              <strong>מיכל, בעלת משרד עורכי דין:</strong> &quot;אני כבר מיואשת. כל יום עשרות פניות, הכל מתפזר לי,
              ואני עושה את אותם דברים שוב ושוב. גם מפספסת לפעמים, ובסוף היום מרגישה שנשאר כסף על הרצפה.&quot;
            </p>
            <p>
              בדיוק כאן נכנסת אוטומציה: פנייה נכנסת, נשמרת מסודר, נפתחת משימה, ונשלחת הודעה בזמן. בלי לרדוף אחרי זה.
              בונים בהתאמה אישית — המטרה שתפסיקו לעשות עבודה כפולה ותקבלו תמונת מצב ברורה.
            </p>
            <p className="sp-narrative-highlight">
              עמוסים? יש כסף על הרצפה? לכאן הילדים הטובים נכנסים — מייעלים את העסק שלכם כדי שתשיגו את הפוטנציאל.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

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
              <FAQItem question="מהי אוטומציה עסקית ואיך היא עובדת?">
                <p>אוטומציה עסקית היא חיבור בין מערכות שונות בעסק כך שמידע זורם ביניהן בצורה חלקה, משימות מתבצעות בזמן הנכון, ולקוחות מקבלים מענה מיידי. לפי McKinsey, עסקים שהטמיעו אוטומציות חוסכים בממוצע 20-35% מזמן העבודה השבועי.</p>
              </FAQItem>
              <FAQItem question="כמה עולה אוטומציה ב-HELIX?">
                <p>החל מ-1,250 ₪ לחודש. כולל מיפוי, הטמעה, CRM, אימיילים, WhatsApp, ניהול שוטף, דוח חודשי ופגישה שבועית. בלי חוזה, בלי דמי הקמה.</p>
              </FAQItem>
              <FAQItem question="כמה כסף אוטומציה חוסכת לעסק?">
                <p>בממוצע 3,000-8,000 ₪ לחודש. החיסכון מגיע משעות צוות שנחסכות, צמצום טעויות, וזמן תגובה מהיר יותר שמגדיל את אחוזי הסגירה פי 3.</p>
              </FAQItem>
              <FAQItem question="אני כבר משתמש ב-CRM אבל זה לא עובד">
                <p>זה המצב הכי נפוץ. אנחנו לוקחים את מה שיש לכם, מנקים, מגדירים תהליכים, ומוודאים שהצוות באמת משתמש. לא צריך להחליף מערכת — צריך להגדיר אותה נכון.</p>
              </FAQItem>
              <FAQItem question="כמה זמן לוקח להטמיע?">
                <p>אוטומציה בסיסית (לידים → CRM → מייל) מוכנה תוך 3-5 ימי עבודה. מערכת מורכבת עם אינטגרציות מרובות — עד 14 ימי עבודה.</p>
              </FAQItem>
              <FAQItem question="עם אילו כלים אתם עובדים?">
                <p>HubSpot, Monday, Pipedrive, Zapier, Make, n8n, SendPulse, WhatsApp Business API, Google Workspace — ועוד. אנחנו מתאימים את הכלי לעסק, לא ההפך.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם משהו נשבר?">
                <p>כל אוטומציה כוללת ניטור ותחזוקה. אם משהו נתקע — אנחנו מתקנים מיד. זה חלק מהחבילה החודשית.</p>
              </FAQItem>
              <FAQItem question="אוטומציה מתאימה לעסק קטן?">
                <p>בהחלט. דווקא עסקים קטנים נהנים הכי הרבה — כי כל שעה שנחסכת משפיעה ישירות על הרווחיות. אפשר להתחיל מאוטומציה אחת ולהרחיב.</p>
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
        title="רוצים לחסוך 30+ שעות בחודש?"
        subtitle="הילדים הטובים מחכים לשיחה. מיפוי תהליכים ראשוני בחינם — נבין איפה אתם שורפים זמן ונראה לכם איך לאטמט את זה. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

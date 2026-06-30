'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const AutomationHeroLottie = dynamic(() => import('../../components/AutomationHeroLottie'), { ssr: false });
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import LeadForm from '../../components/sections/LeadForm';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import AutomationReviews from './AutomationReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import AutomationTimeline from './AutomationTimeline';
import AutomationConstellation from '../../components/AutomationConstellation';
import AutomationCarousel from './AutomationCarousel';
import AILeadForm from './AILeadForm';
import SavingsCalculator from './SavingsCalculator';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אוטומציות וסוכני AI')}`;

export default function AutomationPageClient() {
  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow="חבילה 03 · אוטומציות וסוכני AI"
        title="אוטומציות וסוכני AI<br/>שעובדים בשבילך 24/7."
        subtitle="לידים נכנסים, סוכן AI עונה תוך שניות, הודעות נשלחות, סטטוסים מתעדכנים — הכל אוטומטי. הילדים הטובים מסדרים את התהליכים שלך עם אוטומציות חכמות וסוכני AI שעובדים גם כשאתה ישן."
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
              <h2>בעסק שגדל, אי אפשר להמשיך לעשות הכל ידנית.</h2>
              <p>
                אוטומציה טובה לא מחליפה אנשים — היא משחררת אותם מהעבודה השחורה כדי שיוכלו להתעסק
                במכירות, שירות, יצירה וצמיחה. במקום לרדוף אחרי לידים, לשלוח תזכורות ולעדכן אקסלים — המערכת עושה את זה בשבילך.
              </p>
              <p>
                וב-2026 יש עוד שכבה: סוכני AI שיודעים לענות ללקוחות, לסווג פניות, להמליץ על שירותים,
                ולטפל בבקשות — בלי שאף אחד מהצוות יגע. זמן תגובה של 6 שניות, 24 שעות ביממה.
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
        title="איך אוטומציות וסוכני AI עוזרים ביום יום?"
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
            text: 'במקום הודעות, קבצים, אקסלים ותזכורות בטלפון — אתה רואה תהליך ברור. סטטוסים מתעדכנים לבד, נתונים זורמים בין מערכות.',
          },
          {
            title: 'אף אחד לא עונה ב-3 בלילה',
            text: 'ליד נכנס מחוץ לשעות העבודה. עד הבוקר הוא כבר סגר עם מישהו אחר. סוכן AI עונה תוך 6 שניות — 24/7, בלי חופש, בלי הפסקות.',
          },
        ]}
      />

      {/* ──── DASHBOARD STATS (Tailwind cards) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader eyebrow="דשבורד ביצועים" titleHtml="המספרים מדברים." />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
              {[
                { icon: '⚡', value: '00:06', unit: 'שניות', desc: 'זמן תגובה ממוצע — הודעה ראשונה נשלחת אוטומטית' },
                { icon: '⏱', value: '31.5', unit: 'שעות/חודש', desc: 'חיסכון בזמן — פולואפים, תיאומים ועדכונים אוטומטיים' },
                { icon: '💰', value: '₪11,000', unit: 'חיסכון/חודש', desc: 'זמן צוות שנחסך + צמצום טעויות בתהליך' },
                { icon: '🤖', value: '24/7', unit: 'זמינות סוכן AI', desc: 'הסוכן עונה גם בשבת, גם בחג, גם ב-3 בלילה' },
              ].map((s) => (
                <div key={s.value} className="flex items-center overflow-hidden rounded-lg border border-emerald-900/30 bg-[#0d1512] p-5 gap-4">
                  <span className="text-3xl flex-shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-sm text-emerald-400/70 tracking-wider">{s.unit}</p>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── REVIEWS ──── */}
      <ScrollReveal direction="up">
        <AutomationReviews />
      </ScrollReveal>

      {/* ──── AI LEAD FORM + WHATSAPP CHAT SIM ──── */}
      <ScrollReveal direction="up">
        <AILeadForm />
      </ScrollReveal>

      {/* ──── AUTOMATION FLOW (Steps with arrows) ──── */}
      <section className="sp2-section">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader eyebrow="דוגמה לזרימה אוטומטית" titleHtml="ככה ליד הופך ללקוח<br/>בלי שתגע." />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <div className="grid gap-6 lg:grid-cols-6 sm:grid-cols-2 mt-10" dir="rtl">
              {[
                { n: '01', title: 'ליד משאיר פרטים', desc: 'באתר, בפייסבוק, בדף נחיתה או ב-WhatsApp.', last: false },
                { n: '02', title: 'נכנס אוטומטית ל-CRM', desc: 'עם כל הפרטים, מקור הליד וסטטוס ראשוני.', last: false },
                { n: '03', title: 'הודעת WhatsApp נשלחת', desc: 'סינון ראשוני אוטומטי — הליד מקבל מענה תוך שניות.', last: false },
                { n: '04', title: 'סוכן AI מסנן ומסווג', desc: 'הסוכן שואל שאלות, מזהה צורך, ומעביר רק לידים רלוונטיים לצוות.', last: false },
                { n: '05', title: 'פגישה נקבעת ביומן', desc: 'אם ענה — תזכורת אוטומטית. הסטטוס מתעדכן ב-CRM.', last: false },
                { n: '✓', title: 'פולואפ אוטומטי', desc: 'אם לא ענה — תזכורות אחרי 24/48/72 שעות עד לתגובה.', last: true },
              ].map((step) => (
                <div key={step.n}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={`text-2xl font-bold ${step.last ? 'text-emerald-400' : 'text-white'}`}>{step.n === '✓' ? '✓' : `שלב ${step.n}`}</p>
                    {!step.last && (
                      <svg className="w-6 text-emerald-500/50 transform rotate-90 sm:rotate-180" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <line fill="none" x1="2" y1="12" x2="22" y2="12" />
                        <polyline fill="none" points="15,5 22,12 15,19" />
                      </svg>
                    )}
                    {step.last && (
                      <svg className="w-8 text-emerald-400" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="6,12 10,16 18,8" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
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
            <h2 className="sp2-section-title">מה אנחנו בונים באוטומציות וסוכני AI</h2>
            <p className="sp2-lead">אוטומציות וסוכני AI שמייצרים עסק שעובד יעיל — תגובה מהירה, פולואפים בזמן, ושליטה אמיתית.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🔗', title: 'חיבור בין מערכות', desc: 'CRM, טפסים, פלטפורמות פרסום, WhatsApp, מיילים — הכל מחובר ומסונכרן אוטומטית.' },
                { icon: '📈', title: 'זרימת ליד חדש', desc: 'מרגע שנכנס ועד שהוא נסגר כלקוח משלם — תהליך ברור, אוטומטי, בלי שום דבר נופל.' },
                { icon: '🤖', title: 'סוכני AI מותאמים', desc: 'סוכן AI שמבין את העסק שלך — עונה ללקוחות, מסנן לידים, ממליץ על שירותים. מותאם אישית, לא תבנית.' },
                { icon: '🛒', title: 'סוכן AI למכירות', desc: 'סוכן שמנהל שיחות עם לידים, עונה על שאלות, ומעביר לצוות רק כשהליד מוכן לסגור.' },
                { icon: '🎧', title: 'סוכן AI לשירות לקוחות', desc: 'עונה על שאלות נפוצות, מפנה לאדם כשצריך, לומד ומשתפר עם הזמן.' },
                { icon: '🤝', title: 'Onboarding ללקוחות', desc: 'הודעות, תזכורות, מסמכים ומעקב אוטומטי ללקוחות חדשים. רושם ראשוני מקצועי.' },
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
                { icon: '⚖️', title: 'עורכי דין', desc: 'קליטת לקוח → פתיחת תיק + מסמכים + מעקב. סוכן AI עונה על שאלות ראשוניות 24/7.' },
                { icon: '🏥', title: 'קליניקות ומרפאות', desc: 'בוט AI שקובע תורים, שולח תזכורות, ועונה על שאלות נפוצות. סנכרון אוטומטי עם יומן.' },
                { icon: '🛒', title: 'חנויות אונליין', desc: 'הזמנה → עדכון מלאי + הודעת שליחה + חוות דעת. סוכן AI ממליץ על מוצרים ועוזר ברכישה.' },
                { icon: '🏠', title: 'נדל"ן', desc: 'ליד חדש → שיבוץ לסוכן + שליחת נכסים מתאימים. בוט AI מסנן ושואל שאלות מקדימות.' },
                { icon: '🍽', title: 'מסעדות ובתי קפה', desc: 'הזמנות אונליין → מטבח + חשבונית. בוט AI מקבל הזמנות ועונה על שאלות תפריט.' },
                { icon: '💼', title: 'יועצים ופרילנסרים', desc: 'ליד → הצעת מחיר → חוזה → חשבונית. סוכן AI מסנן פניות ומתאם פגישות.' },
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


      {/* ──── SAVINGS CALCULATOR ──── */}
      <SavingsCalculator />

      {/* ──── FEATURES ──── */}
      <FeaturesSection
        title="מה כלול בחבילה"
        lead="הילדים הטובים לא מקימים ועוזבים. אוטומציות, סוכני AI, מיפוי, הטמעה וניהול שוטף."
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
          { title: 'סוכן AI מותאם לעסק שלך', text: 'סוכן שמבין את המוצרים, השירותים והתהליכים שלך — עונה ללקוחות, מסנן לידים, ומעביר לצוות רק מה שרלוונטי.' },
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
          'עסקים שעושים הכל ידנית ורוצים להפסיק לשרוף זמן',
          'מי שיש לו CRM שאף אחד לא משתמש בו',
          'עסקים עם תהליך מכירה שחוזר על עצמו ואפשר לאטמט',
          'מי שמפסיד לידים כי לא מגיב מספיק מהר',
          'עסק שרוצה שסוכן AI יענה ללקוחות 24/7',
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

      {/* ──── SUB-PACKAGES: 3D Carousel ──── */}
      <section className="sp2-section" id="packages">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="חבילות הקמה"
              titleHtml="מתחילים מתהליך אחד.<br/>גדלים משם."
              description="כל חבילה כוללת הקמה, הטמעה, בדיקות ותיעוד. תשלום חד-פעמי, בלי התחייבות."
            />
          </ScrollReveal>
        </div>
        <AutomationCarousel wa={wa} />
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
              <FAQItem question="מה זה סוכן AI ואיך הוא שונה מצ'אטבוט?">
                <p>צ'אטבוט רגיל עובד לפי תסריט קשיח — שאלה ותשובה. סוכן AI מבין הקשר, לומד מהשיחות, ומקבל החלטות. הוא יכול לסווג פניות, להמליץ על שירותים, ולהעביר לאדם רק כשבאמת צריך.</p>
              </FAQItem>
              <FAQItem question="האם סוכן AI יכול להחליף עובד?">
                <p>לא להחליף — לשחרר. הסוכן מטפל ב-80% מהפניות הפשוטות כדי שהצוות שלך יתמקד ב-20% שדורשים מגע אנושי. התוצאה: פחות עומס, יותר איכות, ואף לקוח לא מחכה.</p>
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

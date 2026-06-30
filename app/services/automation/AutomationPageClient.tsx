'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const AutomationHeroLottie = dynamic(() => import('../../components/AutomationHeroLottie'), { ssr: false });
const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
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
      {/* ──── 1. HERO (no price) ──── */}
      <ServiceHero
        eyebrow="חבילה 03 · אוטומציות וסוכני AI"
        title="אוטומציות וסוכני AI<br/>שעובדים בשבילך 24/7."
        subtitle="לידים נכנסים, סוכן AI עונה תוך שניות, הודעות נשלחות, סטטוסים מתעדכנים — הכל אוטומטי. הילדים הטובים של עולם הדיגיטל מסדרים את התהליכים שלך עם אוטומציות חכמות וסוכני AI שעובדים גם כשאתה ישן."
        ctaHref={wa}
      >
        <AutomationHeroLottie />
      </ServiceHero>

      {/* ──── 2. STATS GRID (right under hero) ──── */}
      <section className="sp2-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:px-8">
              {[
                { icon: '⏱', value: '31', unit: 'שעות', desc: 'חיסכון חודשי בממוצע' },
                { icon: '⚡', value: '6', unit: 'שניות', desc: 'זמן תגובה ממוצע לליד' },
                { icon: '💰', value: '11,000', unit: '₪', desc: 'חיסכון כספי משוער בחודש' },
              ].map((s) => (
                <div key={s.value} className="flex items-center overflow-hidden rounded-lg border border-emerald-900/30 bg-[#0d1512] p-5 gap-4">
                  <span className="text-3xl flex-shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-3xl font-bold text-emerald-400">{s.value} <span className="text-lg font-normal text-emerald-400/70">{s.unit}</span></p>
                    <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 3. NARRATIVE #1 + BURNING MONEY ──── */}
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
                הילדים הטובים מסדרים את כל זה. בלי חוזה. בלי דמי הקמה.
              </p>
            </ScrollTextHighlight>
            <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
          </div>
        </div>
      </section>

      {/* ──── 4. PAIN POINTS ──── */}
      <PainSection
        title="איך אוטומציות וסוכני AI עוזרים ביום יום?"
        cards={[
          {
            title: 'לידים נכנסים ישר ל-CRM',
            text: 'פניות מטפסים, פייסבוק, דפי נחיתה או WhatsApp — הכל נכנס אוטומטית למקום אחד. הילדים הטובים דואגים שכל ליד מקבל תשובה תוך דקות.',
          },
          {
            title: 'הודעות מעקב נשלחות בזמן',
            text: 'תזכורות, אישורי הגעה, תודות אחרי פגישה — הכל נשלח אוטומטית ברגע הנכון. הילדים הטובים בונים את זה פעם אחת והמערכת עושה את השאר.',
          },
          {
            title: 'תהליך מסודר במקום סלט',
            text: 'במקום הודעות, קבצים, אקסלים ותזכורות בטלפון — הילדים הטובים בונים תהליך ברור. סטטוסים מתעדכנים לבד, נתונים זורמים בין מערכות.',
          },
          {
            title: 'אף אחד לא עונה ב-3 בלילה',
            text: 'ליד נכנס מחוץ לשעות העבודה. עד הבוקר הוא כבר סגר עם מישהו אחר. הילדים הטובים שמים סוכן AI שעונה תוך 6 שניות — 24/7.',
          },
        ]}
      />

      {/* ──── 5. AI LEAD FORM + LOTTIE + WHATSAPP CHAT ──── */}
      <ScrollReveal direction="up">
        <AILeadForm />
      </ScrollReveal>

      {/* ──── 6. REVIEWS ──── */}
      <ScrollReveal direction="up">
        <AutomationReviews />
      </ScrollReveal>

      {/* ──── 7. CONSTELLATION ──── */}
      <AutomationConstellation />

      {/* ──── 8. TIMELINE ──── */}
      <AutomationTimeline />

      {/* ──── 9. SUB-SERVICES GRID ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בונים באוטומציות וסוכני AI</h2>
            <p className="sp2-lead">הילדים הטובים בונים אוטומציות וסוכני AI שמייצרים עסק שעובד יעיל — תגובה מהירה, פולואפים בזמן, ושליטה אמיתית.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🔗', title: 'חיבור בין מערכות', desc: 'CRM, טפסים, פלטפורמות פרסום, WhatsApp, מיילים — הכל מחובר ומסונכרן אוטומטית.' },
                { icon: '📈', title: 'זרימת ליד חדש', desc: 'מרגע שנכנס ועד שהוא נסגר כלקוח משלם — תהליך ברור, אוטומטי, בלי שום דבר נופל.' },
                { icon: '🤖', title: 'סוכני AI מותאמים', desc: 'סוכן AI שמבין את העסק שלך — עונה ללקוחות, מסנן לידים, ממליץ על שירותים. מותאם אישית.' },
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

      {/* ──── 10. INDUSTRY EXAMPLES ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader eyebrow="לפי ענף" titleHtml="אוטומציה וסוכני AI<br/>מותאמים לעסק שלך." />
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
                { icon: '🚀', title: 'סטארטאפים', desc: 'פניות קרות ברשתות חברתיות, תגובות על פוסטים, מיילים קרים — סוכן AI שעושה outreach אוטומטי ומביא לידים.' },
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

      {/* ──── 11. SAVINGS CALCULATOR ──── */}
      <SavingsCalculator />

      {/* ──── 12. FOR WHO ──── */}
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

      {/* ──── 13. PACKAGES CAROUSEL + SCISSORS ──── */}
      <section className="sp2-section" id="packages">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="sp-package-with-scissors" style={{ flexDirection: 'column', alignItems: 'center', gap: 0, maxWidth: 'none' }}>
              <div className="sp-scissors-wrap" aria-hidden="true">
                <ScissorsLottie />
              </div>
              <SectionHeader
                eyebrow="חבילות הקמה"
                titleHtml="מתחילים מתהליך אחד.<br/>גדלים משם."
                description="כל חבילה כוללת הקמה, הטמעה, בדיקות ותיעוד. תשלום חד-פעמי, בלי התחייבות."
              />
            </div>
          </ScrollReveal>
        </div>
        <AutomationCarousel wa={wa} />
      </section>

      {/* ──── 14. LEAD FORM — STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── 15. TRUST BAR ──── */}
      <TrustBar items={[
        'בלי חוזה',
        'ביטול בכל עת',
        'בלי דמי הקמה',
        'מיפוי תהליכים ראשוני חינם',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* ──── 16. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="שאלות שנשאלות<br>לפני כל פרויקט אוטומציה." />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="מהי אוטומציה עסקית ואיך היא עובדת?">
                <p>אוטומציה עסקית היא חיבור בין מערכות שונות בעסק כך שמידע זורם ביניהן בצורה חלקה. הילדים הטובים מטמיעים את זה כך שמשימות מתבצעות בזמן הנכון ולקוחות מקבלים מענה מיידי.</p>
              </FAQItem>
              <FAQItem question="כמה עולה אוטומציה ב-HELIX?">
                <p>חבילות הקמה חד-פעמיות מ-300 ₪. בלי חוזה, בלי דמי הקמה. מיפוי תהליכים ראשוני חינם.</p>
              </FAQItem>
              <FAQItem question="כמה כסף אוטומציה חוסכת לעסק?">
                <p>בממוצע 3,000-11,000 ₪ לחודש. החיסכון מגיע משעות צוות שנחסכות, צמצום טעויות, וזמן תגובה מהיר שמגדיל סגירות פי 3.</p>
              </FAQItem>
              <FAQItem question="אני כבר משתמש ב-CRM אבל זה לא עובד">
                <p>זה המצב הכי נפוץ. הילדים הטובים לוקחים את מה שיש, מנקים, מגדירים תהליכים, ומוודאים שהצוות באמת משתמש.</p>
              </FAQItem>
              <FAQItem question="כמה זמן לוקח להטמיע?">
                <p>אוטומציה בסיסית מוכנה תוך 3-5 ימי עבודה. מערכת מורכבת — עד 14 ימי עבודה.</p>
              </FAQItem>
              <FAQItem question="עם אילו כלים אתם עובדים?">
                <p>HubSpot, Monday, Pipedrive, Zapier, Make, n8n, ChatGPT API, Claude API, Voiceflow, WhatsApp Business API — ועוד. מתאימים את הכלי לעסק.</p>
              </FAQItem>
              <FAQItem question="מה זה סוכן AI ואיך הוא שונה מצ׳אטבוט?">
                <p>צ׳אטבוט רגיל עובד לפי תסריט קשיח. סוכן AI מבין הקשר, לומד, ומקבל החלטות — מסווג פניות, ממליץ, ומעביר לאדם רק כשצריך.</p>
              </FAQItem>
              <FAQItem question="האם סוכן AI יכול להחליף עובד?">
                <p>לא להחליף — לשחרר. הסוכן מטפל ב-80% מהפניות הפשוטות כדי שהצוות יתמקד ב-20% שדורשים מגע אנושי.</p>
              </FAQItem>
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="ערן ורון — הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── 17. LEAD FORM — SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 18. FINAL CTA ──── */}
      <FinalCTA
        title="רוצים לחסוך 30+ שעות בחודש?"
        subtitle="הילדים הטובים מחכים לשיחה. מיפוי תהליכים ראשוני בחינם — נבין איפה אתם שורפים זמן ונראה לכם איך לאטמט את זה. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

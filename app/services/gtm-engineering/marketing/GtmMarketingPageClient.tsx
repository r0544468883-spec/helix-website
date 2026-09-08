'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';
import { EmojiIcon } from '@/lib/emoji-icon';
import ServiceHero from '../../../components/service/ServiceHero';
import PainSection from '../../../components/service/PainSection';
import FeaturesSection from '../../../components/service/FeaturesSection';
import ForWhoSection from '../../../components/service/ForWhoSection';
import TrustBar from '../../../components/service/TrustBar';
import FinalCTA from '../../../components/service/FinalCTA';
import LeadForm from '../../../components/sections/LeadForm';
import ScrollReveal from '../../../components/ScrollReveal';
import ScrollTextHighlight from '../../../components/ScrollTextHighlight';
import FAQItem from '../../../components/FAQItem';
import SectionHeader from '../../../components/SectionHeader';
import GtmLogoStrip from '../../../components/GtmLogoStrip';
import GtmReviews from '../../../components/GtmReviews';
import GtmTimeline from '../../../components/GtmTimeline';
import GtmConstellation from '../../../components/GtmConstellation';
import GtmEngagementCard from '../../../components/GtmEngagementCard';
import GtmRelatedService from '../../../components/GtmRelatedService';
import GtmUntangle from '../../../components/GtmUntangle';
import GtmCaseTeaser from '../../../components/GtmCaseTeaser';
import GtmGuides from '../../../components/GtmGuides';
import { getCaseStudy } from '../case-studies-data';

const DigitalMarketingLottie = dynamic(() => import('../../../components/DigitalMarketingLottie'), { ssr: false });

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על GTM Engineering לשיווק')}`;

const TOOLS = [
  { name: 'HubSpot', sub: 'CRM', icon: '🧡', x: 35, y: 8 },
  { name: 'Salesforce', sub: 'CRM ארגוני', icon: '☁️', x: 65, y: 10 },
  { name: 'Zoho', sub: 'CRM', icon: '🟥', x: 15, y: 16 },
  { name: 'Clay', sub: 'העשרת דאטה', icon: '🧱', x: 85, y: 18 },
  { name: 'Apollo', sub: 'סורסינג', icon: '🚀', x: 10, y: 32 },
  { name: 'Marketo', sub: 'Marketing Automation', icon: '📨', x: 45, y: 26 },
  { name: 'Segment', sub: 'CDP', icon: '🧩', x: 75, y: 30 },
  { name: 'GA4', sub: 'Analytics', icon: '📊', x: 25, y: 42 },
  { name: 'Make', sub: 'אוטומציה', icon: '⚙️', x: 55, y: 40 },
  { name: 'n8n', sub: 'אוטומציה', icon: '⚡', x: 82, y: 46 },
  { name: 'ChatGPT', sub: 'AI Agents', icon: '✦', x: 12, y: 56 },
  { name: 'Claude', sub: 'AI Agents', icon: '◈', x: 42, y: 58 },
  { name: 'HubSpot Flows', sub: 'Nurture', icon: '🔄', x: 68, y: 60 },
  { name: 'Looker', sub: 'דשבורדים', icon: '📈', x: 30, y: 72 },
  { name: 'GTM', sub: 'Tag Manager', icon: '🏷', x: 58, y: 74 },
  { name: 'UTM', sub: 'Attribution', icon: '🧭', x: 82, y: 72 },
];

const REVIEWS = [
  { name: 'מיכל ברנע', role: 'VP Marketing, חברת SaaS', headline: 'הלידים נכנסו בלי מקור ובלי שלב', text: 'היו לנו אלפי אנשי קשר ב-HubSpot בלי מקור ובלי שלב. HELIX בנו מודל דאטה, ניקוד ו-attribution. לראשונה אנחנו יודעים איזה קמפיין באמת מייצר pipeline.' },
  { name: 'עידו פלד', role: 'Head of Growth, פינטק', headline: 'שילמנו על מדיה בלי לדעת מה מחזיר', text: 'שרפנו תקציב מדיה בלי דיווח אמיתי. חיברו לנו קמפיין-לליד-לעסקה, והזזנו תקציב לפי מה שבאמת סוגר. ה-CAC ירד בחודשיים.' },
  { name: 'רותם אלוני', role: 'RevOps Lead, חברת סייבר', headline: 'שיווק ומכירות רבו על כל ליד', text: 'לא הייתה הגדרה מוסכמת של ליד איכותי. בנו lifecycle stages וניקוד, ועכשיו יש שפה אחת. ההעברות בין שיווק למכירות הפסיקו להיות מלחמה.' },
  { name: 'דנה כספי', role: 'מנהלת שיווק, B2B תעשייה', headline: 'הכל היה ידני והכל נפל', text: 'הצוות העתיק לידים ידנית בין מערכות. עכשיו יש העשרה אוטומטית עם Clay ו-nurture שרץ לבד. חסכנו יום עבודה בשבוע לכל אחד.' },
  { name: 'אסף מזרחי', role: 'מייסד, סטארטאפ Series A', headline: 'רצינו תשתית שתחזיק צמיחה', text: 'ידענו שנצמח מהר וצריך תשתית. HELIX הקימו מודל דאטה נקי מההתחלה, כך שכשגייסנו לא נשברנו. משלוח ראשון תוך שבוע.' },
  { name: 'נועה שגב', role: 'Marketing Ops, חברת בריאות', headline: 'הדוחות לא אמרו כלום', text: 'קיבלנו דוחות עם חשיפות וקליקים. עכשיו יש דשבורד שמראה החזר לכל ערוץ. ההנהלה סוף סוף מבינה מה עובד.' },
];

const STEPS = [
  { n: '01', title: 'אבחון', text: 'ממפים את הסטאק, מודל הדאטה ונקודות הדליפה במשפך השיווק. בלי פאזת אפיון של חודשיים.' },
  { n: '02', title: 'ארכיטקטורה', text: 'מתכננים מודל דאטה, lifecycle stages, ניקוד ואוטומציות, חוצה HubSpot, Salesforce ו-Zoho.' },
  { n: '03', title: 'בנייה', text: 'בונים לכידה, העשרה, nurture ו-attribution, מחברים אינטגרציות ומטמיעים AI. משלוחים שבועיים.' },
  { n: '04', title: 'אופטימיזציה', text: 'מודדים, מכווננים ומרחיבים. שותף שנשאר ומשפר לאורך זמן, לא פרויקט שנעלם.' },
];

export default function GtmMarketingPageClient() {
  return (
    <div className="service-page">
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow="GTM Engineering · משפך שיווק"
        title="שיווק זה לא רק קמפיינים.<br/>זו תשתית שצריך להנדס."
        subtitle="הצד הטכני של השיווק, שרוב החברות מדלגות עליו. לכידת לידים, העשרת דאטה, ניקוד, אוטומציות nurture ו-attribution, מהונדס על HubSpot, Salesforce או Zoho. כך שכל ליד נקלט נכון, מסווג, ומטופל אוטומטית, ואתם יודעים מאיפה באמת מגיעה ההכנסה."
        price="אבחון ארכיטקטורה חינם"
        priceNote="פרויקט חד-פעמי או ריטיינר חודשי · תמחור לפי היקף"
        ctaHref={wa}
        ctaText="לאבחון חינם"
        highlights={['HubSpot', 'Salesforce', 'Zoho', 'Clay', 'Marketo']}
        highlightsLabel="עובדים על"
      >
        <DigitalMarketingLottie />
      </ServiceHero>

      {/* ──── LOGO STRIP ──── */}
      <GtmLogoStrip variant="marketing" />

      {/* ──── 2. NARRATIVE #1 + VIDEO ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נגיד את מה שכל מנהל שיווק יודע.</h2>
              <p>
                שמתם עוד תקציב על קמפיינים, הלידים נכנסים למערכת, ואז מה? חצי מהם בלי מקור,
                שליש בלי שלב, ואף אחד לא באמת יודע להגיד אילו קמפיינים מייצרים הכנסה ואילו שורפים כסף.
              </p>
              <p>
                הבעיה כמעט אף פעם היא לא הקריאייטיב. היא התשתית. מודל דאטה שבור, אין ניקוד,
                אין nurture אוטומטי, וה-attribution הוא ניחוש. זה בדיוק מה שאנחנו מהנדסים.
              </p>
              <p className="sp-narrative-highlight">
                אנחנו לא סוכנות קמפיינים. אנחנו מהנדסים את המערכת שמאחורי הקמפיינים, על הפלטפורמה שכבר יש לכם.
              </p>
            </ScrollTextHighlight>
            <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
          </div>
        </div>
      </section>

      {/* ──── 3. PAIN ──── */}
      <PainSection
        title="מכירים את הסיפור?"
        cards={[
          {
            title: 'לידים נכנסים בלי מקור ובלי שלב',
            text: '30 עד 60 אחוז מהאנשי-קשר במערכת בלי מקור ברור או שלב במחזור-החיים. אי אפשר לנקד, אי אפשר לנתב, ואי אפשר למדוד. אנחנו בונים מודל דאטה עם הגדרות מוסכמות.',
          },
          {
            title: 'אין ניקוד, אז הכל דחוף באותה מידה',
            text: 'מכירות רודפות אחרי כל ליד באותה מרץ, כי אין דירוג. סריקת באדג׳ בכנס ושיחה אמיתית נראים אותו דבר. אנחנו בונים ניקוד רב-שכבתי שמסמן מי חם באמת.',
          },
          {
            title: 'ה-attribution הוא ניחוש',
            text: '"הגענו ל-80,000 חשיפות". יופי, וכמה הכנסה זה ייצר? אנחנו מחברים קמפיין-לליד-לעסקה, כדי שתדעו איזה ערוץ מחזיר ואיזה שורף תקציב.',
          },
        ]}
      />

      {/* ──── 4. REVIEWS ──── */}
      <ScrollReveal direction="up">
        <GtmReviews
          reviews={REVIEWS}
          eyebrow="לקוחות GTM"
          titleHtml="מה קרה אחרי שהנדסו<br>מחדש את משפך השיווק."
          description="חברות B2B, SaaS וסטארטאפים שהפכו CRM מבולגן למנוע שיווק שאפשר לסמוך עליו."
        />
      </ScrollReveal>

      {/* ──── CASE STUDY TEASER ──── */}
      <GtmCaseTeaser cs={getCaseStudy('saas-15-tools-to-hubspot')!} />

      {/* ──── 5. LEAD FORM, SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 6. CONSTELLATION ──── */}
      <GtmConstellation
        tools={TOOLS}
        title="הסטאק שאנחנו מהנדסים"
        subtitle="משפך שיווק מודרני מורכב מעשרות כלים שצריכים לדבר אחד עם השני. הנה חלק מהם."
      />

      {/* ──── BEFORE / AFTER (untangle) ──── */}
      <GtmUntangle
        variant="marketing"
        title="ממשפך שבור למשפך מהונדס"
        beforeLabel="לפני · חיווט מסובך"
        afterLabel="אחרי · תהליך ב-HubSpot"
      />

      {/* ──── 7. TIMELINE ──── */}
      <GtmTimeline
        steps={STEPS}
        titleHtml="איך הנדסת משפך<br/>שיווק עובדת אצלנו."
        description="ארבעה שלבים, ליווי שנשאר. משלוחים ראשונים תוך ימים."
      />

      {/* ──── 8. SUB-SERVICES GRID (3+3) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו מהנדסים</h2>
            <p className="sp2-lead">כל החלקים הטכניים של משפך השיווק, חוצה כל הפלטפורמות.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid sp-grid-3">
              {[
                { icon: '📥', title: 'לכידת לידים וטפסים', desc: 'טפסים חכמים, landing pages ו-tracking שמזרים כל ליד ישר למערכת עם המקור, הקמפיין וה-UTM.' },
                { icon: '💎', title: 'העשרת דאטה', desc: 'העשרה אוטומטית עם Clay ו-Apollo. פרטי חברה, תפקיד, טכנולוגיות וסיגנלים, מולאים לבד על כל רשומה.' },
                { icon: '🎯', title: 'ניקוד ומחזור-חיים', desc: 'ניקוד רב-שכבתי לפי פרופיל והתנהגות, ו-lifecycle stages עם הגדרות מוסכמות בין שיווק למכירות.' },
                { icon: '🔄', title: 'אוטומציות Nurture', desc: 'סדרות אוטומטיות לפי שלב והתנהגות, כולל החייאת לידים רדומים. שום ליד לא נופל בין הכיסאות.' },
                { icon: '📊', title: 'Attribution ודשבורדים', desc: 'חיבור קמפיין-לליד-לעסקה ודשבורדים שמראים החזר לכל ערוץ, לא רק חשיפות וקליקים.' },
                { icon: '🔌', title: 'אינטגרציות ו-AI', desc: 'חיבור Marketo, Pardot וכלי הדאטה אל ה-CRM, וסוכני AI שמעשירים, מסכמים וכותבים פרסונליזציה.' },
              ].map((svc) => (
                <div key={svc.title} className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <span className="flip-card-icon"><EmojiIcon e={svc.icon} /></span>
                      <h3>{svc.title}</h3>
                    </div>
                    <div className="flip-card-back">
                      <span className="flip-card-icon"><EmojiIcon e={svc.icon} /></span>
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

      {/* ──── 9. FEATURES (3+3) ──── */}
      <FeaturesSection
        title="למה זה משנה"
        lead="משפך שיווק מהונדס נכון הופך את אותו תקציב מדיה ליותר לידים איכותיים, פחות בזבוז, וראייה ברורה של מה עובד."
        gridClassName="sp-grid-3"
        stats={[
          { value: 40, suffix: '%', label: 'פחות זמן טיפול ידני בלידים' },
          { value: 3, suffix: 'x', label: 'יותר לידים מוכנים למכירות' },
          { value: 5, suffix: ' ימים', label: 'למשלוח הראשון' },
        ]}
        features={[
          { title: 'כל ליד מסווג אוטומטית', text: 'מקור, קמפיין, שלב וניקוד, מולאים לבד ברגע הכניסה. בלי עבודה ידנית.' },
          { title: 'שיווק ומכירות בשפה אחת', text: 'הגדרות מוסכמות של lifecycle stages וניקוד. סוף לוויכוח על מהו ליד איכותי.' },
          { title: 'attribution אמין', text: 'רואים איזה ערוץ מייצר הכנסה אמיתית, ומזיזים תקציב בהתאם.' },
          { title: 'חוצה פלטפורמות', text: 'HubSpot, Salesforce, Zoho, מחוברים ומסונכרנים. לא נעולים על ספק אחד.' },
          { title: 'AI שחוסך שעות', text: 'סוכנים שמעשירים, מסכמים וכותבים פרסונליזציה, במקום העתק-הדבק ידני.' },
          { title: 'ליווי שנשאר', text: 'לא בונים ונעלמים. מודדים, מכווננים ומרחיבים לאורך זמן.' },
        ]}
      />

      {/* ──── 10. NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה לא פשוט לשכור עוד אחד ב-Ops?</h2>
            <p>
              כי איש Ops בודד לוקח חודשים ללמוד את המערכת, ואז עוזב עם כל הידע. אנחנו מגיעים עם
              תבניות מוכחות, מהנדסים את התשתית תוך שבועות, ומשאירים לכם מערכת מתועדת שהצוות שלכם יודע להפעיל.
            </p>
            <p>
              ובמודל ליווי אתם לא נשארים לבד: מדידה, כיוונון והרחבה שוטפים, במקום פרויקט חד-פעמי שמתיישן.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── 11. FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'סטארטאפ B2B / SaaS עם CRM שלא ממצה את היכולת שלו',
          'חברה שמשקיעה במדיה אבל לא יודעת מה מחזיר',
          'ארגון עם דאטה שבורה בין שיווק למכירות',
          'צוות שיווק שטובע בעבודה ידנית של לידים',
        ]}
        no={[
          'מי שמחפש רק ניהול קמפיינים בלי תשתית',
          'מי שאין לו עדיין שום מוצר או תנועת שיווק',
          'מי שלא מוכן לגעת במודל הדאטה שלו',
        ]}
      />

      {/* ──── 12. ENGAGEMENT / PRICING ──── */}
      <GtmEngagementCard
        options={[
          {
            tag: 'פרויקט',
            name: 'הקמה חד-פעמית',
            desc: 'מהנדסים את משפך השיווק מקצה לקצה, ומשאירים לכם מערכת מתועדת שהצוות מפעיל לבד.',
            points: ['אבחון ומודל דאטה', 'ניקוד, lifecycle ו-nurture', 'attribution ודשבורדים', 'הדרכת צוות ומסירה'],
          },
          {
            tag: 'ריטיינר',
            name: 'ליווי חודשי',
            desc: 'שותף GTM שנשאר. משלוחים שבועיים, מדידה, כיוונון והרחבה מתמשכים של המערכת.',
            points: ['הכל מהפרויקט, מתמשך', 'משלוחים שבועיים', 'אופטימיזציה ומדידה שוטפת', 'סוכני AI ואוטומציות חדשות'],
            featured: true,
          },
        ]}
        ctaHref={wa}
      />

      {/* ──── 13. LEAD FORM, STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── 14. TRUST BAR ──── */}
      <TrustBar items={[
        'חוצה HubSpot · Salesforce · Zoho',
        'אבחון ארכיטקטורה ראשוני חינם',
        'משלוחים שבועיים',
        'ליווי שוטף',
        'הדאטה והמערכת נשארים שלכם',
      ]} />

      {/* ──── RELATED SERVICE (internal link) ──── */}
      <GtmRelatedService
        icon="📣"
        title="צריכים גם את הקמפיינים עצמם?"
        desc="GTM Engineering בונה את התשתית. שירות השיווק הדיגיטלי שלנו מפעיל את הקמפיינים, התוכן וה-SEO שרצים עליה."
        href="/services/marketing"
        linkLabel="לשירות השיווק הדיגיטלי"
      />

      {/* ──── 15. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="שאלות שנשאלות<br>בכל שיחה ראשונה." />
          <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
            <FAQItem question="על אילו פלטפורמות אתם עובדים?">
              <p>HubSpot, Salesforce, Zoho ו-Pipedrive, וגם מערכות marketing automation כמו Marketo ו-Pardot. אנחנו מהנדסים חוצה-פלטפורמות ומחברים ביניהן, לא נעולים על כלי אחד.</p>
            </FAQItem>
            <FAQItem question="מה זה בעצם GTM Engineering לשיווק?">
              <p>הצד הטכני של השיווק. במקום עוד קמפיינים, אנחנו בונים את התשתית שמאחוריהם: לכידת לידים, העשרת דאטה, ניקוד, אוטומציות nurture, שלבי מחזור-חיים ומדידת attribution. כך שכל ליד נקלט נכון, מסווג, ומטופל אוטומטית.</p>
            </FAQItem>
            <FAQItem question="יש לנו כבר HubSpot. אתם עדיין רלוונטיים?">
              <p>בדיוק אז אנחנו רלוונטיים. רוב החברות משתמשות בחלק קטן מהיכולת. אנחנו עושים אבחון, מסדרים את מודל הדאטה, בונים את האוטומציות שחסרות ומחברים את הכלים שכבר יש לכם.</p>
            </FAQItem>
            <FAQItem question="כמה זמן עד שרואים תוצאות?">
              <p>משלוחים ראשונים תוך ימים ספורים, בלי פאזת discovery אינסופית. משפך העשרה וניקוד עומד תוך שבועות, ומשם ממשיכים לכוונן ולהרחיב בליווי שוטף.</p>
            </FAQItem>
            <FAQItem question="כמה זה עולה?">
              <p>לפי היקף. פרויקט חד-פעמי או ריטיינר חודשי. השיחה הראשונה ואבחון הארכיטקטורה הם ללא עלות, ואז חוזרים עם תמחור ברור.</p>
            </FAQItem>
            <FAQItem question="מה ההבדל בינכם לבין שירות השיווק הדיגיטלי שלכם?">
              <p>GTM Engineering בונה את התשתית הטכנית של המשפך. שירות השיווק הדיגיטלי מפעיל את הקמפיינים, התוכן וה-SEO. הרבה לקוחות לוקחים את שניהם יחד.</p>
            </FAQItem>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── GUIDES ──── */}
      <GtmGuides
        title="מדריכי GTM Engineering לשיווק"
        subtitle="מדריכי עומק על הצד ההנדסי של השיווק, מבוססי שיטה."
        guides={[
          { title: 'GTM Engineering לשיווק: הצד ההנדסי שאף אחד לא מדבר עליו', href: '/articles/gtm-marketing-what-is', readTime: '9 דקות קריאה' },
          { title: 'איך לאחד 15 כלי שיווק לתוך HubSpot אחד', href: '/articles/consolidate-marketing-hubspot', readTime: '8 דקות קריאה' },
          { title: 'מודל ניקוד לידים: 40% התנהגות, 30% התאמה, 30% כוונה', href: '/articles/lead-scoring-40-30-30', readTime: '8 דקות קריאה' },
          { title: 'שלבי Lifecycle: מ-Subscriber ל-SQL עם קריטריון מעבר', href: '/articles/lifecycle-stages-mql-sql', readTime: '7 דקות קריאה' },
        ]}
      />

      {/* ──── 16. LEAD FORM, SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 17. FINAL CTA ──── */}
      <FinalCTA
        title="הקמפיינים שלכם ראויים לתשתית שתעבוד."
        subtitle="הילדים הטובים מחכים לשיחה. נתחיל באבחון ארכיטקטורה חינם, נמפה את מודל הדאטה והמשפך, ונחזור עם תוכנית הנדסית. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

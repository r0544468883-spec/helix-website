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

const SalesTeamHeroLottie = dynamic(() => import('../../../components/SalesTeamHeroLottie'), { ssr: false });

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על GTM Engineering למכירות')}`;

const TOOLS = [
  { name: 'HubSpot', sub: 'CRM', icon: '🧡', x: 35, y: 8 },
  { name: 'Salesforce', sub: 'CRM ארגוני', icon: '☁️', x: 65, y: 10 },
  { name: 'Zoho', sub: 'CRM', icon: '🟥', x: 15, y: 16 },
  { name: 'Pipedrive', sub: 'CRM', icon: '🟢', x: 85, y: 18 },
  { name: 'Clay', sub: 'Outbound', icon: '🧱', x: 10, y: 32 },
  { name: 'Apollo', sub: 'סורסינג', icon: '🚀', x: 45, y: 26 },
  { name: 'LinkedIn', sub: 'Sales Navigator', icon: '💼', x: 75, y: 30 },
  { name: 'Aircall', sub: 'טלפוניה', icon: '📞', x: 25, y: 42 },
  { name: 'PandaDoc', sub: 'CPQ וחתימה', icon: '📝', x: 55, y: 40 },
  { name: 'Stripe', sub: 'חיוב', icon: '💳', x: 82, y: 46 },
  { name: 'Make', sub: 'אוטומציה', icon: '⚙️', x: 12, y: 56 },
  { name: 'Claude', sub: 'AI Agents', icon: '◈', x: 42, y: 58 },
  { name: 'Fathom', sub: 'Call Intelligence', icon: '🎙', x: 68, y: 60 },
  { name: 'Forecast', sub: 'תחזית', icon: '🔮', x: 30, y: 72 },
  { name: 'Routing', sub: 'ניתוב לידים', icon: '🧭', x: 58, y: 74 },
  { name: 'SLA', sub: 'Speed-to-Lead', icon: '⚡', x: 82, y: 72 },
];

const REVIEWS = [
  { name: 'תומר רז', role: 'VP Sales, חברת SaaS', headline: 'לידים חמים ישבו שעות עד שמישהו ענה', text: 'בלי ניתוב אוטומטי, לידים ישבו שעות. HELIX בנו routing ו-SLA, וזמן המגע הראשון ירד מדקות שעות לדקות. אחוז הסגירה עלה תוך חודש.' },
  { name: 'ליאור אבידן', role: 'מנהל מכירות, פינטק', headline: 'ה-forecast היה בדיחה', text: 'שלבי הדיל היו מבולגנים וה-forecast השתנה כל שבוע. הנדסו שלבים עם קריטריוני מעבר, ניקו את ה-pipeline, ועכשיו התחזית מבוססת דאטה.' },
  { name: 'שירה גולן', role: 'RevOps, חברת סייבר', headline: '40 אחוז מהרשומות היו בלי בעלים', text: 'המון דילים בלי owner ובלי שלב. בנו ניתוב, אוטומציות והתראות SLA. שום דיל כבר לא נופל בין הכיסאות.' },
  { name: 'אורי בן-חיים', role: 'מייסד, סטארטאפ B2B', headline: 'בנינו outbound מאפס', text: 'רצינו pipeline יזום בלי לנפח צוות. HELIX הקימו מנוע Clay עם העשרה, סיגנלים וסוכני AI. פגישות מוכשרות נכנסות כל שבוע.' },
  { name: 'מאיה פרץ', role: 'Sales Ops, תעשייה', headline: 'הנציגים בזבזו חצי יום על הקלדה', text: 'עדכון ידני של שדות ומשימות אכל זמן מכירה. עכשיו אוטומציות מזיזות דילים ויוצרות משימות לבד. הנציגים חזרו למכור.' },
  { name: 'יונתן שור', role: 'CRO, חברת בריאות', headline: 'לא הייתה נראות על שום דבר', text: 'ההנהלה לא ראתה מה קורה ב-pipeline. בנו דשבורדים ותחזית אמינה. עכשיו אנחנו מנהלים לפי מספרים, לא לפי תחושה.' },
];

const STEPS = [
  { n: '01', title: 'אבחון', text: 'ממפים את ה-pipeline, הניתוב ונקודות הדליפה בתהליך המכירה. בלי פאזת אפיון של חודשיים.' },
  { n: '02', title: 'ארכיטקטורה', text: 'מתכננים שלבי דיל, ניתוב, SLA ואוטומציות, חוצה HubSpot, Salesforce, Zoho ו-Pipedrive.' },
  { n: '03', title: 'בנייה', text: 'בונים routing, אוטומציות, outbound עם Clay, CPQ ו-forecasting, ומטמיעים AI. משלוחים שבועיים.' },
  { n: '04', title: 'אופטימיזציה', text: 'מודדים, מכווננים ומרחיבים. שותף שנשאר ומשפר לאורך זמן, לא פרויקט שנעלם.' },
];

export default function GtmSalesPageClient() {
  return (
    <div className="service-page">
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow="GTM Engineering · משפך מכירה"
        title="מכירות זה לא רק אנשים.<br/>זו מערכת שצריך להנדס."
        subtitle="הצד הטכני של המכירות. ארכיטקטורת pipeline, ניתוב לידים ו-speed-to-lead, אוטומציות מכירה, outbound מבוסס סיגנלים ו-forecasting, מהונדס על HubSpot, Salesforce או Zoho. שכל ליד יטופל בזמן, כל שלב יהיה נקי, וה-forecast יהיה אמין."
        price="אבחון ארכיטקטורה חינם"
        priceNote="פרויקט חד-פעמי או ריטיינר חודשי · תמחור לפי היקף"
        ctaHref={wa}
        ctaText="לאבחון חינם"
        highlights={['HubSpot', 'Salesforce', 'Zoho', 'Pipedrive', 'Clay']}
        highlightsLabel="עובדים על"
      >
        <SalesTeamHeroLottie />
      </ServiceHero>

      {/* ──── LOGO STRIP ──── */}
      <GtmLogoStrip variant="sales" />

      {/* ──── 2. NARRATIVE #1 + VIDEO ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נגיד את מה שכל מנהל מכירות יודע.</h2>
              <p>
                יש לכם אנשי מכירות טובים ו-CRM, אבל לידים יושבים שעות עד שמישהו נוגע בהם,
                20 עד 40 אחוז מהרשומות בלי בעלים, שלבי הדיל מבולגנים, וה-forecast הוא בעצם משאלה.
              </p>
              <p>
                הבעיה היא לא האנשים. היא שאין תשתית. אין ניתוב אוטומטי, אין SLA, אין אוטומציות
                שמזיזות דילים, ואין מבנה pipeline נקי. זה בדיוק מה שאנחנו מהנדסים.
              </p>
              <p className="sp-narrative-highlight">
                אנחנו לא מחליפים את צוות המכירות. אנחנו בונים את המערכת שמכפילה את מה שהוא כבר יודע לעשות.
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
            title: 'לידים יושבים שעות עד שמישהו עונה',
            text: 'כשליד חם מחכה שעה, הוא כבר קר. בלי ניתוב אוטומטי ו-SLA, המהירות תלויה במזל. אנחנו בונים ניתוב שהופך ימים לדקות, עם התראה כשליד יושב בלי טיפול.',
          },
          {
            title: 'ה-pipeline מבולגן, ה-forecast ניחוש',
            text: '30 עד 60 אחוז מהרשומות בלי שלב, דילים תקועים בלי סיבה, וה-forecast משתנה לפי מצב הרוח. אנחנו מהנדסים שלבי דיל נקיים עם קריטריוני מעבר ברורים.',
          },
          {
            title: 'הכל ידני, אז דברים נופלים',
            text: 'נציגים מעדכנים ידנית, שוכחים פולואפ, וכל אחד עובד אחרת. אנחנו בונים אוטומציות שמזיזות דילים, יוצרות משימות ושומרות שהתהליך רץ לבד.',
          },
        ]}
      />

      {/* ──── 4. REVIEWS ──── */}
      <ScrollReveal direction="up">
        <GtmReviews
          reviews={REVIEWS}
          eyebrow="לקוחות GTM"
          titleHtml="מה קרה אחרי שהנדסו<br>מחדש את משפך המכירה."
          description="חברות B2B, SaaS וסטארטאפים שהפכו pipeline מבולגן למערכת מכירה שאפשר לסמוך עליה."
        />
      </ScrollReveal>

      {/* ──── CASE STUDY TEASER ──── */}
      <GtmCaseTeaser cs={getCaseStudy('ai-saas-outbound-engine')!} />

      {/* ──── 5. LEAD FORM, SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 6. CONSTELLATION ──── */}
      <GtmConstellation
        tools={TOOLS}
        title="הסטאק שאנחנו מהנדסים"
        subtitle="מערכת מכירה מודרנית מורכבת מעשרות כלים שצריכים לדבר אחד עם השני. הנה חלק מהם."
      />

      {/* ──── BEFORE / AFTER (untangle) ──── */}
      <GtmUntangle
        variant="sales"
        title="מ-Pipeline מבולגן למערכת מכירה מהונדסת"
        beforeLabel="לפני · חיווט מסובך"
        afterLabel="אחרי · תהליך מהונדס"
      />

      {/* ──── 7. TIMELINE ──── */}
      <GtmTimeline
        steps={STEPS}
        titleHtml="איך הנדסת משפך<br/>מכירה עובדת אצלנו."
        description="ארבעה שלבים, ליווי שנשאר. משלוחים ראשונים תוך ימים."
      />

      {/* ──── 8. SUB-SERVICES GRID (3+3) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו מהנדסים</h2>
            <p className="sp2-lead">כל החלקים הטכניים של משפך המכירה, חוצה כל הפלטפורמות.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid sp-grid-3">
              {[
                { icon: '🏗️', title: 'ארכיטקטורת Pipeline', desc: 'שלבי דיל עם קריטריוני מעבר מוסכמים, מבנה נקי ותצוגה שכל נציג ומנהל מבינים באותה צורה.' },
                { icon: '🧭', title: 'ניתוב ו-Speed-to-Lead', desc: 'ניתוב אוטומטי לפי טריטוריה, תפקיד ועומס, עם התראות SLA ומענה לכל ליד בדקות.' },
                { icon: '⚙️', title: 'אוטומציות מכירה', desc: 'משימות אוטומטיות, פולואפ, הזזת דילים ועדכוני שדות. הנציג מוכר, המערכת מנהלת.' },
                { icon: '🛰️', title: 'Outbound Engineering', desc: 'מנוע outbound עם Clay: מקורות רשימה, העשרה, סיגנלים וסוכני AI לפרסונליזציה בסקייל.' },
                { icon: '🔮', title: 'Forecasting ונראות', desc: 'דשבורדים ותחזית אמינה לפי דאטה נקייה. מנהלים רואים את המספרים האמיתיים בזמן אמת.' },
                { icon: '🧾', title: 'CPQ ו-Enablement', desc: 'הצעות מחיר וחתימה אוטומטיים עם PandaDoc, ותסריטים ו-playbooks בתוך ה-CRM בכל שלב.' },
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
        lead="משפך מכירה מהונדס נכון אומר שאף ליד לא נופל, כל דיל נראה, וה-forecast מבוסס דאטה במקום תקווה."
        gridClassName="sp-grid-3"
        stats={[
          { value: 90, suffix: '%', label: 'קיצור זמן עד המגע הראשון' },
          { value: 40, suffix: '%', label: 'שיפור ממוצע באחוז הסגירה' },
          { value: 5, suffix: ' ימים', label: 'למשלוח הראשון' },
        ]}
        features={[
          { title: 'אף ליד לא נופל', text: 'ניתוב אוטומטי ו-SLA שמבטיחים שכל ליד מקבל בעלים ומענה בזמן.' },
          { title: 'pipeline נקי ואמין', text: 'שלבי דיל עם קריטריונים ברורים, כך שה-forecast מבוסס מציאות ולא הרגשה.' },
          { title: 'הנציגים מוכרים, לא מקלידים', text: 'אוטומציות שמעדכנות שדות, יוצרות משימות ומזיזות דילים לבד.' },
          { title: 'outbound בסקייל', text: 'מנוע Clay וסוכני AI שמייצרים pipeline בלי לנפח את הצוות.' },
          { title: 'חוצה פלטפורמות', text: 'HubSpot, Salesforce, Zoho, Pipedrive, בנוי ומחובר למערכת שיש לכם.' },
          { title: 'ליווי שנשאר', text: 'לא בונים ונעלמים. מודדים, מכווננים ומרחיבים לאורך זמן.' },
        ]}
      />

      {/* ──── 10. NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה לא פשוט לשכור עוד אחד ב-Sales Ops?</h2>
            <p>
              כי איש Ops בודד לוקח חודשים ללמוד את המערכת, ואז עוזב עם כל הידע. אנחנו מגיעים עם
              תבניות מוכחות, מהנדסים את התשתית תוך שבועות, ומשאירים לכם מערכת מתועדת שהצוות שלכם מפעיל.
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
          'סטארטאפ B2B / SaaS שבונה תנועת מכירות מסודרת',
          'צוות מכירות עם CRM שלא ממצה את היכולת שלו',
          'ארגון עם pipeline מבולגן ו-forecast לא אמין',
          'חברה שרוצה להוסיף outbound מבוסס דאטה',
        ]}
        no={[
          'מי שמחפש רק שנמכור במקומו (יש חבילת SDR אוטומטי)',
          'מי שאין לו עדיין שום מוצר או תנועת מכירות',
          'מי שלא מוכן לגעת בתהליך המכירה הקיים',
        ]}
      />

      {/* ──── 12. ENGAGEMENT / PRICING ──── */}
      <GtmEngagementCard
        options={[
          {
            tag: 'פרויקט',
            name: 'הקמה חד-פעמית',
            desc: 'מהנדסים את משפך המכירה מקצה לקצה, ומשאירים לכם מערכת מתועדת שהצוות מפעיל לבד.',
            points: ['אבחון וארכיטקטורת pipeline', 'ניתוב, SLA ואוטומציות', 'forecasting ודשבורדים', 'הדרכת צוות ומסירה'],
          },
          {
            tag: 'ריטיינר',
            name: 'ליווי חודשי',
            desc: 'שותף GTM שנשאר. משלוחים שבועיים, מדידה, כיוונון והרחבה מתמשכים, כולל outbound.',
            points: ['הכל מהפרויקט, מתמשך', 'משלוחים שבועיים', 'מנוע outbound וסוכני AI', 'אופטימיזציה ומדידה שוטפת'],
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
        'התהליך וה-CRM נשארים שלכם',
      ]} />

      {/* ──── RELATED SERVICE (internal link) ──── */}
      <GtmRelatedService
        icon="🤝"
        title="צריכים גם לבנות את צוות המכירות עצמו?"
        desc="GTM Engineering בונה את התשתית. שירות המכירות ופיתוח עסקי שלנו בונה את השיטה, התסריטים ומכשיר את הצוות שמפעיל אותה."
        href="/services/sales-consulting"
        linkLabel="לשירות המכירות ופיתוח עסקי"
      />

      {/* ──── 15. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="שאלות שנשאלות<br>לפני שמתחילים." />
          <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
            <FAQItem question="על אילו פלטפורמות אתם עובדים?">
              <p>HubSpot, Salesforce, Zoho ו-Pipedrive. בונים את ה-pipeline, האוטומציות והדשבורדים בתוך המערכת שכבר יש לכם, ומחברים אליה כלי outbound והעשרה כמו Clay ו-Apollo.</p>
            </FAQItem>
            <FAQItem question="מה ההבדל בין זה לבין HELIX SDR האוטומטי?">
              <p>ה-SDR האוטומטי מבצע outbound בשבילכם. GTM Engineering למכירות בונה את התשתית: ה-pipeline, ניתוב הלידים, האוטומציות וה-forecasting שבתוך ה-CRM. הרבה חברות לוקחות את שניהם יחד.</p>
            </FAQItem>
            <FAQItem question="יש לנו כבר Salesforce מסובך. אתם נכנסים לזה?">
              <p>כן. אנחנו עושים אבחון, מסדרים את שלבי הדיל, בונים את האוטומציות והניתוב שחסרים, ומנקים את ה-pipeline כך שה-forecast יהיה אמין. בלי לשבור את מה שעובד.</p>
            </FAQItem>
            <FAQItem question="כמה זמן עד שרואים תוצאות?">
              <p>משלוחים ראשונים תוך ימים ספורים. ניתוב וקיצור speed-to-lead נכנסים לפעולה מהר, ותהליך pipeline מסודר עומד תוך שבועות. משם מכווננים בליווי שוטף.</p>
            </FAQItem>
            <FAQItem question="כמה זה עולה?">
              <p>לפי היקף. פרויקט חד-פעמי או ריטיינר חודשי. השיחה הראשונה ואבחון הארכיטקטורה הם ללא עלות, ואז חוזרים עם תמחור ברור.</p>
            </FAQItem>
            <FAQItem question="מה ההבדל בינכם לבין שירות המכירות ופיתוח עסקי שלכם?">
              <p>GTM Engineering בונה את התשתית הטכנית של המכירות. שירות המכירות ופיתוח עסקי בונה את השיטה, התסריטים ומכשיר את הצוות. הרבה לקוחות לוקחים את שניהם יחד.</p>
            </FAQItem>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── GUIDES ──── */}
      <GtmGuides
        title="מדריכי GTM Engineering למכירות"
        subtitle="מדריכי עומק על הצד ההנדסי של המכירות, מבוססי שיטה."
        guides={[
          { title: 'GTM Engineering למכירות: להנדס את ה-Pipeline', href: '/articles/gtm-sales-what-is', readTime: '9 דקות קריאה' },
          { title: 'Speed-to-Lead: למה דקות שוות עסקאות', href: '/articles/speed-to-lead-sla', readTime: '7 דקות קריאה' },
          { title: 'Outbound Engineering עם Clay: מסיגנל לפנייה', href: '/articles/outbound-engineering-clay', readTime: '9 דקות קריאה' },
          { title: 'Pipeline נקי ו-Forecast אמין: הנדסת שלבי דיל', href: '/articles/pipeline-forecast-hygiene', readTime: '8 דקות קריאה' },
        ]}
      />

      {/* ──── 16. LEAD FORM, SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 17. FINAL CTA ──── */}
      <FinalCTA
        title="תפסיקו לאבד דילים בגלל התשתית."
        subtitle="הילדים הטובים מחכים לשיחה. נתחיל באבחון ארכיטקטורה חינם, נמפה את ה-pipeline והניתוב, ונחזור עם תוכנית הנדסית. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

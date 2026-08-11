'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
import BDRFloatingCards from './BDRFloatingCards';
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import LeadForm from '../../components/sections/LeadForm';
import PricingCarousel from '../../components/PricingCarousel';
import WhatsAppCostNote from '../../components/WhatsAppCostNote';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import SalesReviews from './SalesReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import SalesTimeline from './SalesTimeline';
import SalesConstellation from '../../components/SalesConstellation';
import ProductWorkflowNodes from '../ProductWorkflowNodes';
import ProductLogoGrid from '../ProductLogoGrid';
import ProductOfferBar from '../ProductOfferBar';
import ProductMetricProof from '../ProductMetricProof';
import ProductAgentDemo from '../ProductAgentDemo';
import ProductBento from '../ProductBento';

const SDR_ACCENT = '#38BDF8';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על תהליכי מכירה אוטומטיים')}`;

export default function SalesPageClient() {
  return (
    <div className="service-page" style={{ ['--pac' as string]: SDR_ACCENT, ['--brand' as string]: SDR_ACCENT }}>
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow="חבילה 05 · תהליכי מכירה אוטומטיים"
        title="SDR שעובד 24/7.<br/>בלי להגדיל צוות."
        subtitle="לידים B2B חמים לא מגיעים מקמפיינים. הם מגיעים מ-outreach חכם בלינקדין ובאימייל, עם AI שמתאים כל פנייה לנמען. הילדים הטובים של עולם הדיגיטל בונים מערך BDR אוטומטי שעובד גם כשאתה ישן."
        marketPrice="8,000-15,000"
        price="החל מ-199 ₪"
        priceNote="לחודש · 3 מסלולים · בלי חוזה · ביטול בכל עת"
        ctaHref={wa}
      >
        <BDRFloatingCards />
      </ServiceHero>

      {/* ──── 1a. OFFER BAR (above-the-fold: result + 3-step + free offer + compliance badge) ──── */}
      <ProductOfferBar
        accent={SDR_ACCENT}
        wa={wa}
        result="פי 3 באחוז תגובה"
        steps={['איתות', 'העשרה', 'פנייה מותאמת']}
        offer="קבלו ליד ראשון חינם"
        badge="🛡️ בלי קנסות · בלי חסימות"
      />

      {/* ──── 1c. LIVE AGENT DEMO (Framer-style, the SDR agent working a lead) ──── */}
      <ProductAgentDemo
        accent={SDR_ACCENT}
        agentName="HELIX SDR Agent"
        title={<>ה-agent עובד ליד <em>מאיתות ועד פגישה</em></>}
        steps={[
          { action: 'מזהה איתות רכש', detail: 'VP Marketing · גיוס Series B' },
          { action: 'מעשיר את הליד', detail: 'תפקיד, חברה, מייל, לינקדאין' },
          { action: 'מנסח פנייה מותאמת', detail: 'מותאם לכאב הספציפי, לא תבנית' },
          { action: 'ממתין לאישור אנושי', detail: 'אתם מאשרים בלחיצה' },
          { action: 'שולח בלינקדאין ובמייל', detail: 'נשלח · עוקב אוטומטית' },
        ]}
      />

      {/* ──── 2. NARRATIVE #1 + BURNING MONEY ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נדבר על איך נראה outreach ב-2026.</h2>
              <p>
                שולח 20 הודעות לינקדין ביום. מתוכן 2 עונים. אחד רלוונטי. זה לוקח שעתיים ביום,
                ואתה עושה את זה במקום לסגור עסקאות. או שאתה מגייס SDR ב-15,000 ₪ לחודש, הוא לומד 3 חודשים, מתחיל להניב, ואז עוזב.
              </p>
              <p>
                הילדים הטובים בנו מערך אוטומטי שעושה את כל מה ש-BDR עושה, לינקדין ואימייל, 24/7,
                עם 200+ הודעות ביום. AI מתאים כל פנייה לנמען, שם, תפקיד, חברה, כאב ספציפי. לא תבנית גנרית.
              </p>
              <p className="sp-narrative-highlight">
                החל מ-199 ₪ לחודש. במקום 15,000 ₪ על עובד. הילדים הטובים העבירו את החיסכון אליכם.
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
            title: 'SDR עולה 15,000 ₪ בחודש',
            text: 'גייסת איש מכירות. הוא לומד 3 חודשים. מתחיל להניב. ואז עוזב. הילדים הטובים בנו מערך אוטומטי שלא עוזב.',
          },
          {
            title: 'Outreach ידני לא סקיילבילי',
            text: 'שולח הודעות לינקדין ומיילים אחד אחד. 20 ביום. מתוכן 2 עונים. הילדים הטובים שולחים 200+ הודעות ביום עם AI שמתאים כל פנייה לנמען.',
          },
          {
            title: 'אין Pipeline אמיתי',
            text: 'יודע שיש "כמה לידים" אבל אין מערכת שמראה בדיוק מה הסטטוס של כל ליד. הילדים הטובים בונים CRM מסודר עם דשבורד.',
          },
        ]}
      />

      {/* ──── 3b. WORKFLOW NODES (Attio-style SDR playbook) ──── */}
      <ProductWorkflowNodes
        accent={SDR_ACCENT}
        title={<>ה-Playbook שרץ אוטומטית, <em>מאיתות ועד פגישה</em></>}
        steps={[
          { icon: '🎯', label: 'טריגר' },
          { icon: '🔍', label: 'העשרת ליד' },
          { icon: '📊', label: 'ניקוד ICP' },
          { icon: '✉️', label: 'פנייה מותאמת' },
          { icon: '🔁', label: 'מעקב אוטומטי' },
        ]}
      />

      {/* ──── 3c. INTEGRATIONS GRID (enrichment + channels) ──── */}
      <ProductLogoGrid
        accent={SDR_ACCENT}
        title={<>מחובר למקורות ההעשרה <em>ולערוצים שאתם עובדים איתם</em></>}
        logos={['apollo', 'linkedin', 'hubspot', 'semrush', 'openai', 'claude', 'zapier', 'make', 'n8n', 'github']}
      />

      {/* ──── 4. REVIEWS ──── */}
      <ScrollReveal direction="up">
        <SalesReviews />
      </ScrollReveal>

      {/* ──── 4b. METRIC PROOF (Retool-style hard numbers) ──── */}
      <ProductMetricProof
        accent={SDR_ACCENT}
        items={[
          { stat: '×3', unit: 'פגישות שנקבעו', quote: 'הפסקנו לרדוף ידנית, הלידים מגיעים חמים ומתואמים.', name: 'עידו מ.', role: 'מייסד, סטארטאפ B2B' },
          { stat: '90%', unit: 'העשרה בעלות אפסית', quote: 'מצאנו את מקבלי ההחלטות בלי לשלם על כלי enrichment יקר.', name: 'קרן ל.', role: 'ראש מכירות' },
          { stat: '24/7', unit: 'outreach שלא ישן', quote: 'המערכת שולחת בלינקדין ובמייל גם כשאני ישן.', name: 'אסף ד.', role: 'בעלים, סוכנות' },
        ]}
      />

      {/* ──── 5. LEAD FORM, SOFT #1 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 6. CONSTELLATION ──── */}
      <SalesConstellation />

      {/* ──── 7. TIMELINE ──── */}
      <SalesTimeline />

      {/* ──── 8. SUB-SERVICES GRID (flip cards) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה כלול במערך ה-SDR</h2>
            <p className="sp2-lead">הילדים הטובים בונים מערך מכירות אוטומטי שעובד בשבילך כל יום, כל שעה.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🎯', title: 'אסטרטגיית מכירות', desc: 'מגדירים ICP, מסרים, ערוצים. AI מנתח את קהל היעד ומתאים את המסר.' },
                { icon: '🔍', title: 'Data Enrichment', desc: 'מוצאים את האנשים הנכונים, מעשירים נתונים עם AI, מכינים רשימות ממוקדות.' },
                { icon: '💼', title: 'LinkedIn Outreach', desc: 'הודעות מותאמות אישית בלינקדין, AI מתאים כל פנייה לנמען. אוטומטית, בקנה מידה.' },
                { icon: '📧', title: 'Cold Email', desc: 'סדרות מיילים קרים עם AI שכותב ומתאים + A/B testing אוטומטי.' },
                { icon: '🔄', title: 'Pipeline אוטומטי', desc: 'CRM מסודר. כל ליד יודע איפה הוא. דשבורד + דוח ROI שבועי.' },
                { icon: '🤖', title: 'AI Personalization', desc: 'כל פנייה מותאמת לנמען, שם, תפקיד, חברה, כאב ספציפי. לא תבנית גנרית.' },
                { icon: '📊', title: 'מעקב ואופטימיזציה', desc: 'פגישה שבועית + דוח חודשי. עוקבים, מודדים, משפרים.' },
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

      {/* ──── 9. FEATURES (bento grid + tilt + FIG) ──── */}
      <ProductBento
        accent={SDR_ACCENT}
        title={<>מה כלול <em>בחבילה</em></>}
        features={[
          { title: 'אסטרטגיית מכירות דיגיטלית', text: 'מגדירים ICP, מסרים, ערוצים. יודעים למי פונים, איך, ולמה.' },
          { title: 'Data Enrichment + LinkedIn', text: 'מוצאים את האנשים הנכונים, מעשירים נתונים, מכינים רשימות ממוקדות.' },
          { title: 'BDR אוטומטי + AI', text: 'Outreach בלינקדין ובאימייל, AI מתאים כל פנייה לנמען. הודעות, follow-ups, תזכורות.' },
          { title: 'A/B טסטינג + Personalization', text: 'AI כותב ומתאים מסרים לכל נמען. A/B testing אוטומטי, מה שעובד מקבל יותר.' },
          { title: 'דשבורד + דוח ROI שבועי', text: 'תמונת מצב ברורה. כמה לידים, כמה ענו, כמה התקדמו. מספרים, לא תחושות.' },
        ]}
      />

      {/* ──── 10. NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה מאות שקלים ולא 8,000?</h2>
            <p>
              כי AI חתך 60% מהעבודה. מה שלקח SDR שבוע לעשות ידנית, המערכת עושה ביום.
              רוב החברות ניצלו את ההפרש. הילדים הטובים העבירו את החיסכון אליכם.
            </p>
            <p>
              מאות שקלים בודדים לחודש על מערך שעובד 24/7 ושולח 200+ הודעות ביום, זה לא מבצע, זה מה שהגינות נראית כמוה.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── 11. FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסקי B2B שרוצים לידים חמים בלי להגדיל צוות',
          'יועצים ופרילנסרים שמחפשים את הילדים הטובים לבנות outreach',
          'סטארטאפים בשלב מכירות ראשוניות',
          'חברות עם מוצר מוכן שצריכות pipeline מסודר',
        ]}
        no={[
          'B2C (קהל צרכנים רחב, יש חבילת שיווק)',
          'עסק בלי הגדרה ברורה של לקוח יעד (אבל אפשר לבנות)',
          'מי שמחפש "רק רשימת אימיילים" (יש בנק שעות)',
        ]}
      />

      {/* ──── 12. PRICING CAROUSEL + SCISSORS ──── */}
      <section className="sp2-section" id="packages">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="sp-package-with-scissors" style={{ flexDirection: 'column', alignItems: 'center', gap: 0, maxWidth: 'none' }}>
              <div className="sp-scissors-wrap" aria-hidden="true">
                <ScissorsLottie />
              </div>
              <SectionHeader
                eyebrow="מחירים"
                titleHtml="מחיר אחד ברור.<br/>שלושה מסלולים."
                description="מחיר אחיד ושקוף לכל התוכנות של HELIX, בלי הפתעות ובלי מחיר מוסתר. עלות הודעות וואטסאפ נפרדת ולפי שימוש."
              />
            </div>
          </ScrollReveal>
        </div>
        <PricingCarousel wa={wa} product={{ name: 'HELIX SDR', starter: 299, pro: 699, business: 1490 }} />
      </section>

      {/* ──── 12b. WHATSAPP COST NOTE ──── */}
      <WhatsAppCostNote />

      {/* ──── 13. LEAD FORM, STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── 14. TRUST BAR ──── */}
      <TrustBar items={[
        'בלי חוזה',
        'ביטול בכל עת',
        'בלי דמי הקמה',
        'מיפוי ICP ראשוני חינם',
        'פגישת ייעוץ ראשונה חינם',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* ──── 15. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="שאלות שנשאלות<br>לפני שמתחילים outreach." />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="כמה עולה מערך SDR אוטומטי ב-HELIX?">
                <p>מחיר אחיד ושקוף לכל התוכנות של HELIX, שלושה מסלולים: Starter ב-199 ₪, Pro ב-499 ₪ ו-Business ב-999 ₪ לחודש (per-workspace, בלי חוזה). ההבדל בין המסלולים הוא כמות המשתמשים והשימוש החודשי. עלות הודעות וואטסאפ נפרדת ולפי שימוש, ויש גם חבילות של 3 / 5 / כל התוכנות בהנחה.</p>
              </FAQItem>
              <FAQItem question="למה זה שישית מעלות SDR?">
                <p>AI חתך 60% מהעבודה. מה שלקח SDR שבוע ידנית, המערכת עושה ביום. הילדים הטובים העבירו את החיסכון אליכם.</p>
              </FAQItem>
              <FAQItem question="כמה זמן עד שמתחילים לראות לידים?">
                <p>שבוע-שבועיים להקמה. אחרי זה, הודעות יוצאות כל יום. לידים מתחילים להיכנס בשבוע השני.</p>
              </FAQItem>
              <FAQItem question="באילו ערוצים עובדים?">
                <p>לינקדין ואימייל, או שניהם יחד. כל outreach מותאם אישית עם A/B testing. הילדים הטובים מתאימים את הערוץ לעסק.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם רוצים לבטל?">
                <p>הודעה מראש של 30 יום. בלי קנסות, בלי חוזה. כל מה שנבנה, שלכם.</p>
              </FAQItem>
              <FAQItem question="זה מתאים לעסק קטן?">
                <p>בהחלט. דווקא עסקים קטנים מרוויחים הכי הרבה, כי SDR ב-15,000 ₪ לא אופציה בשבילם. מאות שקלים בודדים כן.</p>
              </FAQItem>
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="ערן ורון, הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── 16. LEAD FORM, SOFT #3 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 17. FINAL CTA ──── */}
      <FinalCTA
        title="מוכנים שהלידים יתחילו להגיע?"
        subtitle="הילדים הטובים מחכים לשיחה. מיפוי ICP ראשוני בחינם, נבין מי הלקוח האידיאלי שלכם ואיך להגיע אליו. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

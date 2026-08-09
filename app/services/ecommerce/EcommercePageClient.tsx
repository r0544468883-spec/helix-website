'use client';

import { SITE } from '@/lib/site';
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import FeaturesSection from '../../components/service/FeaturesSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import AddonsSection from '../../components/service/AddonsSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import LeadForm from '../../components/sections/LeadForm';
import { PackageCard, corePackages } from '../../components/sections/Services';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import EcommerceReviews from './EcommerceReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import EcommerceTimeline from './EcommerceTimeline';
import EcommerceConstellation from './EcommerceConstellation';
import dynamic from 'next/dynamic';

const WebsitesHeroLottie = dynamic(() => import('../../components/WebsitesHeroLottie'), { ssr: false });
const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על בניית חנות איקומרס')}`;

export default function EcommercePageClient() {
  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow="חבילה 03 · איקומרס"
        title="חנות שמוכרת.<br/>לא חנות שמחכה."
        subtitle="הילדים הטובים של עולם הדיגיטל בונים חנויות אונליין שמביאות הכנסות — לא כאלה שיושבות בפינה. חנות, שיווק, תשלומים ואוטומציה. הכל כלול."
        marketPrice="15,000–30,000 חד פעמי"
        price="250 ₪"
        priceNote="לחודש · כולל תחזוקה ואופטימיזציה · בלי דמי הקמה · בלי חוזה"
        ctaHref={wa}
      >
        <WebsitesHeroLottie />
      </ServiceHero>

      {/* ──── NARRATIVE #1 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נגיד את מה שכולם יודעים אבל לא אומרים.</h2>
              <p>
                שילמת 20,000 שקל על חנות אונליין מהממת. המוצרים בפנים, העיצוב יפהפה —
                אבל אף אחד לא קונה. כי אף אחד לא הסביר שחנות בלי תנועה זו חנות סגורה,
                ושבלי תהליך שחזור עגלות אתה מאבד 70% מהלקוחות בדרך לקופה.
              </p>
              <p>
                הילדים הטובים עושים את זה אחרת. חנות מלאה — עיצוב, פיתוח, תשלומים, משלוחים,
                אוטומציות ואופטימיזציית מכירות שוטפת. החל מ-250 ₪ לחודש. בלי דמי הקמה. בלי חוזה.
              </p>
              <p className="sp-narrative-highlight">
                AI חתך לנו 60% משעות העבודה. הילדים הטובים לא מכסים על ההפרש — מעבירים את החיסכון אליכם.
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
            title: 'חנות יפה, אפס מכירות',
            text: 'השקעת 20,000 על עיצוב. המוצרים בפנים. אבל אף אחד לא קונה, כי אף אחד לא הביא תנועה. הילדים הטובים בונים חנות שגם נמצאת וגם מוכרת.',
          },
          {
            title: 'נטישת עגלות של 70%',
            text: 'אנשים מוסיפים מוצרים לעגלה ונעלמים. אף אחד לא בנה תהליך שחזור או אימיילים אוטומטיים. הילדים הטובים מחזירים את העגלות שברחו.',
          },
          {
            title: 'עלות תחזוקה שמשתלטת',
            text: 'Shopify, אפליקציות, תוספים, עדכונים — כל חודש עוד 200 דולר פה, עוד 50 שם. הילדים הטובים כוללים תחזוקה ואופטימיזציה במחיר קבוע.',
          },
        ]}
      />

      {/* ──── REVIEWS ──── */}
      <ScrollReveal direction="up">
        <EcommerceReviews />
      </ScrollReveal>

      {/* ──── LEAD FORM — SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── CONSTELLATION ──── */}
      <EcommerceConstellation />

      {/* ──── STEPS TIMELINE ──── */}
      <EcommerceTimeline />

      {/* ──── SUB-SERVICES GRID ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בונים</h2>
            <p className="sp2-lead">כל סוג חנות שעסק צריך — תחת קורת גג אחת.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🛒', title: 'חנות Shopify', desc: 'הקמה מלאה על Shopify — קטלוג, עגלה, תשלומים ומשלוחים. הפלטפורמה המובילה בעולם, מותאמת לשוק הישראלי.' },
                { icon: '🛍', title: 'חנות WooCommerce', desc: 'חנות על גבי WordPress עם שליטה מלאה. אידיאלי למי שרוצה גמישות, בלוג משולב ובעלות מלאה על הקוד.' },
                { icon: '⚙️', title: 'חנות בהתאמה אישית', desc: 'חנות מפותחת בקוד (Next.js) לביצועים מקסימליים ולוגיקה עסקית ייחודית. כשהפלטפורמות המוכנות לא מספיקות.' },
                { icon: '📦', title: 'דפי מוצר שממירים', desc: 'עיצוב ותוכן של דפי מוצר לפי עקרונות המרה — גלריה, ביקורות, urgency, ו-CTA ברור שמוביל לקנייה.' },
                { icon: '🔗', title: 'תשלומים ואינטגרציות', desc: 'Stripe, PayPal, Bit, חברות משלוחים, ניהול מלאי, CRM ופיקסלים — הכל מחובר ועובד מיום ראשון.' },
                { icon: '✉️', title: 'דיוור ואוטומציות', desc: 'עגלה נטושה, אישור הזמנה, follow-up ו-flows של שימור. Klaviyo / Mailchimp — הכל אוטומטי, מוכר בשבילכם.' },
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
        title="מה כלול בחנות שלכם"
        lead="הילדים הטובים לא עושים חצי עבודה. מהקמה ועד מכירה ראשונה — ומשם, אופטימיזציה שוטפת."
        stats={[
          { value: 21, label: 'ימים ממוצע עד חנות פעילה' },
          { value: 0, suffix: ' ₪', label: 'דמי הקמה' },
          { value: 35, suffix: '%', label: 'שיפור ממוצע ב-conversion' },
        ]}
        features={[
          { title: 'אפיון חנות ומוצרים', text: 'מבנה קטגוריות, תהליך רכישה, ודפי מוצר שממירים. חנות שבנויה למכור, לא רק להיראות.' },
          { title: 'Shopify / WooCommerce / Custom', text: 'בוחרים את הפלטפורמה שמתאימה לך — ולא דוחפים אותך למשהו שלא צריך.' },
          { title: 'עיצוב חנות שמוכרת', text: 'UX שמוביל לקנייה. מהיר, נקי, ורספונסיבי מלא במובייל — שם רוב הקונים.' },
          { title: 'תשלומים + משלוחים + מלאי', text: 'Stripe, PayPal, Bit, משלוחים וניהול מלאי. הכל עובד מיום ראשון.' },
          { title: 'אימיילים אוטומטיים', text: 'עגלה נטושה, אישור הזמנה, follow-up ושימור. הכל אוטומטי — מוכר בזמן שאתה ישן.' },
          { title: 'אופטימיזציה + דוחות', text: 'פגישה שבועית. דוח חודשי. מכירות, conversion ו-AOV — ושיפור מתמיד.' },
        ]}
      />

      {/* ──── NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה 250 ₪ לחודש ולא 25,000 חד פעמי?</h2>
            <p>
              כי AI חתך לנו 60% משעות העבודה. מה שלקח חודש לוקח שבוע.
              רוב השוק המשיך לגבות כרגיל. הילדים הטובים העבירו את החיסכון אליכם.
            </p>
            <p>
              ובמודל חודשי אתם מקבלים משהו שחד-פעמי לא נותן: תחזוקה, עדכונים, ואופטימיזציית מכירות שוטפת.
              החנות לא רק עולה — היא ממשיכה למכור יותר כל חודש.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסקים שרוצים למכור אונליין ברצינות',
          'מותגי DTC שצריכים חנות מקצועית שממירה',
          'חנויות קיימות שרוצות לשדרג ולהאיץ מכירות',
          'בעלי מוצר שרוצים להשיק מהר, בלי דמי הקמה',
        ]}
        no={[
          'מי שרוצה רק דף תדמית בלי מכירות (יש חבילת אתרים)',
          'מרקטפלייס עם אלפי מוכרים (יש חבילת פיתוח נפרדת)',
          'מי שמחפש חנות ב-Wix בחינם (לא מתאים לנו)',
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

      {/* ──── LEAD FORM — STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── ADD-ONS ──── */}
      <AddonsSection addons={[
        { name: 'עמוד מוצר/קטגוריה נוסף', price: '480 ₪' },
        { name: 'חיבור CRM למערכת הזמנות', price: 'החל מ-650 ₪' },
        { name: 'הקמת מערכת דיוור', price: '750 ₪' },
        { name: 'סדרת אימיילים אוטומטית', price: '350 ₪ / שעה' },
        { name: 'תרגום חנות לשפה נוספת', price: '480 ₪ / עמוד' },
      ]} />

      {/* ──── TRUST BAR ──── */}
      <TrustBar items={[
        'בלי חוזה',
        'ביטול בכל עת',
        'בלי דמי הקמה',
        'תחזוקה ואופטימיזציה כלולות',
        'שיחת אפיון ראשונה חינם',
      ]} />

      {/* ──── FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader
            eyebrow="שאלות נפוצות"
            titleHtml="שאלות שנשאלות<br>לפני כל חנות."
          />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="כמה עולה להקים חנות איקומרס ב-HELIX?">
                <p>החל מ-250 ₪ לחודש. כולל הקמה, עיצוב, תשלומים, משלוחים, אוטומציות ותחזוקה שוטפת. בלי דמי הקמה, בלי חוזה.</p>
              </FAQItem>
              <FAQItem question="למה מודל חודשי ולא תשלום חד-פעמי?">
                <p>כי חנות זה לא פרויקט חד-פעמי — היא צריכה תחזוקה, עדכונים ואופטימיזציית מכירות מתמדת. במודל חודשי אתם מקבלים שותף שנשאר, לא ספק שנעלם אחרי ההשקה.</p>
              </FAQItem>
              <FAQItem question="על איזו פלטפורמה תבנו לי את החנות?">
                <p>Shopify, WooCommerce, או קוד מותאם — לפי מה שמתאים לעסק שלכם. נמליץ בכנות, בלי לדחוף אתכם למשהו שלא צריך.</p>
              </FAQItem>
              <FAQItem question="כמה זמן עד שהחנות באוויר?">
                <p>בממוצע 3 שבועות. תלוי בכמות המוצרים ובמורכבות — חנות בסיסית יכולה לעלות תוך שבועיים.</p>
              </FAQItem>
              <FAQItem question="אתם עוזרים גם עם השיווק והתנועה?">
                <p>כן. חנות בלי תנועה זו חנות סגורה. אנחנו מחברים SEO, פיקסלים ואוטומציות, ואפשר להוסיף ניהול קמפיינים ודיוור כחבילה משלימה.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם אני רוצה לבטל?">
                <p>הודעה מראש של 30 יום. בלי קנסות, בלי חוזה. החנות שלכם — אתם מקבלים את כל הקבצים והגישה.</p>
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
        title="250 ₪ לחודש. חנות שמוכרת."
        subtitle="הילדים הטובים מחכים לשיחה. אפיון ראשוני בחינם — נבין מה אתם מוכרים ולמי, ונחזור עם כיוון ברור. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

'use client';

import { SITE } from '@/lib/site';
import { EmojiIcon } from '@/lib/emoji-icon';
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
import GeoReviews from './GeoReviews';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import GeoTimeline from './GeoTimeline';
import GeoConstellation from './GeoConstellation';
import dynamic from 'next/dynamic';

const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
const SearchLottie = dynamic(() => import('../../components/SearchLottie'), { ssr: false });

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על קידום ב-AI, GEO ו-AEO')}`;

// GEO package lives at the end of corePackages (hidden from the homepage grid).
const geoPkg = corePackages.find((p) => p.href === '/services/geo') ?? corePackages[corePackages.length - 1];

export default function GeoPageClient() {
  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow="שירות · קידום ב-AI, GEO ו-AEO"
        title="שהעסק יצוץ ב-ChatGPT,<br/>לא רק בגוגל."
        subtitle="הלקוחות שלכם כבר שואלים את ChatGPT, את Gemini ואת Perplexity לפני שהם קונים. הילדים הטובים של עולם הדיגיטל דואגים שהתשובה תהיה אתם, לא המתחרה."
        marketPrice="6,000-15,000"
        price="1,250 ₪"
        priceNote="לחודש · ליווי שוטף · בלי חוזה · בלי דמי הקמה"
        ctaHref={wa}
      >
        <SearchLottie />
      </ServiceHero>

      {/* ──── NARRATIVE #1 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נגיד את מה שכבר קורה, גם אם לא שמת לב.</h2>
              <p>
                הלקוח שלך כבר לא פותח גוגל ומדפדף עשרה קישורים. הוא שואל את ChatGPT
                &rdquo;מי הכי טוב בתחום הזה?&ldquo; ומקבל תשובה אחת, עם שם אחד. אם זה לא השם שלך, הפסדת את הלקוח
                עוד לפני שידעת שהוא קיים.
              </p>
              <p>
                הילדים הטובים בונים לך נוכחות שמנועי ה-AI מבינים ומצטטים, מבנה תוכן, Schema,
                ביסוס ישויות ומדידה. החל מ-1,250 ₪ לחודש. בלי חוזה. בלי דמי הקמה.
              </p>
              <p className="sp-narrative-highlight">
                AI ואוטומציה חתכו לנו 60% משעות העבודה. את החיסכון העברנו אליכם, קידום שסוכנות גובה עליו 6,000₪+.
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
            title: 'שואלים AI, ולא מופיעים',
            text: 'לקוחות שואלים את ChatGPT או Gemini המלצה בתחום שלכם, ואתם פשוט לא שם. הילדים הטובים בונים תוכן שה-AI יודע לצטט.',
          },
          {
            title: 'המתחרה מצוטט במקומכם',
            text: 'כששואלים את Perplexity, קופץ דווקא המתחרה. לא כי הוא יותר טוב, אלא כי הוא בנוי נכון ל-AI. הילדים הטובים מחזירים אתכם למשחק.',
          },
          {
            title: 'עשיתם SEO, וזה לא מספיק',
            text: 'דירגתם יפה בגוגל, אבל ב-AI אתם שקופים. זה עולם אחר עם חוקים אחרים. הילדים הטובים עושים את שניהם, SEO וגם GEO.',
          },
        ]}
      />

      {/* ──── REVIEWS ──── */}
      <ScrollReveal direction="up">
        <GeoReviews />
      </ScrollReveal>

      {/* ──── LEAD FORM, SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── CONSTELLATION ──── */}
      <GeoConstellation />

      {/* ──── STEPS TIMELINE ──── */}
      <GeoTimeline />

      {/* ──── SUB-SERVICES GRID ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בונים</h2>
            <p className="sp2-lead">כל מה שצריך כדי שמנועי ה-AI יכירו אתכם, יסמכו עליכם, ויצטטו אתכם.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🔎', title: 'אבחון נראות ב-AI', desc: 'בודקים איך ChatGPT, Gemini ו-Perplexity עונים על השאלות של הלקוחות שלכם, מי מצוטט היום ואיפה אתם נעדרים.' },
                { icon: '🎯', title: 'ארכיטקטורת Hub-and-Spoke', desc: 'עמוד-על אחד שמרכז נושא, ומאמרי לוויין מקושרים סביבו. מבנה שה-AI מבין כסמכות, לא אוסף מאמרים מבודדים.' },
                { icon: '🏷', title: 'Schema ו-FAQ (JSON-LD)', desc: 'מסמנים לכל עמוד את המבנה הטכני שמנועי ה-AI קוראים: שאלות, תשובות, מוצרים וישויות. ככה הם מצטטים אתכם בביטחון.' },
                { icon: '💡', title: 'כתיבה Answer-first', desc: 'פסקת תשובה חדה בראש כל נושא, בדיוק הפורמט שה-AI אוהב להרים כציטוט. בלי מים, ישר לעניין.' },
                { icon: '🧩', title: 'ביסוס ישויות ו-Knowledge Graph', desc: 'עמוד-ישויות, חיבור Wikidata וסימון מי אתם. מנועי ה-AI לומדים להכיר את העסק כגורם אמין בתחום.' },
                { icon: '📌', title: 'עמוד-סטטיסטיקות מתוארך', desc: 'נתונים עם מקור ותאריך, הפורמט הכי מצוטט ב-AI ומגנט לקישורים. הופך אתכם למקור שמפנים אליו.' },
                { icon: '📄', title: 'llms.txt ותשתית טכנית', desc: 'קובץ ייעודי שמנחה את מנועי ה-AI, לצד sitemap ותקינות טכנית. רענון שוטף ככל שהמנועים מתעדכנים.' },
                { icon: '📈', title: 'מדידת Citation Share', desc: 'דוח חודשי: כמה פעמים אתם מצוטטים ב-AI מול המתחרים, על אילו שאלות, ואיפה הפער שצריך לסגור.' },
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

      {/* ──── FEATURES ──── */}
      <FeaturesSection
        title="מה כלול בליווי"
        lead="הילדים הטובים לא מגישים דוח ונעלמים. בונים איתכם את הנוכחות ב-AI ומלווים עד שאתם התשובה."
        stats={[
          { value: 4, suffix: ' מנועים', label: 'ChatGPT · Gemini · Perplexity · AI Overviews' },
          { value: 60, suffix: '%', label: 'מהחיפושים עוברים לתשובות AI' },
          { value: 1, suffix: ' / שבוע', label: 'פגישת ליווי וכיוונון' },
        ]}
        features={[
          { title: 'אבחון נראות מלא', text: 'מיפוי איפה אתם מוזכרים היום ב-AI ואיפה המתחרה תופס את מקומכם, לפני שנוגעים במשהו.' },
          { title: 'ארכיטקטורת תוכן', text: 'מבנה Hub-and-Spoke: עמוד-על ומאמרי לוויין מקושרים, שה-AI קורא כסמכות בתחום.' },
          { title: 'Schema ו-Answer-first', text: 'סימון טכני (JSON-LD) וכתיבה בפורמט שמנועי ה-AI אוהבים לצטט, בכל עמוד.' },
          { title: 'ביסוס ישויות', text: 'עמוד-ישויות, Wikidata ו-Knowledge Graph, שה-AI יידע מי אתם ויסמוך עליכם.' },
          { title: 'תשתית GEO/AEO', text: 'llms.txt, עמוד-סטטיסטיקות מתוארך ותקינות טכנית, רענון שוטף ככל שהמנועים משתנים.' },
          { title: 'מדידת Citation Share', text: 'דוח חודשי שקוף, כמה אתם מצוטטים מול המתחרים, לא impressions.' },
        ]}
      />

      {/* ──── NARRATIVE #2 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>למה 1,250 ₪ לחודש, כשסוכנות גובה 6,000 ומעלה?</h2>
            <p>
              בדקנו. בעולם, שירות GEO לעסק קטן מתחיל ב-3,000 ₪ לחודש וכמעט תמיד עם חוזה של שנה.
              אצלנו זה מתחיל ב-1,250 ₪, חודש-בחודש, בלי התחייבות. ההבדל הוא לא באיכות, הוא בשיטה.
            </p>
            <p>
              אנחנו לא מתמחרים לפי שעות של כותב תוכן. AI ואוטומציה עושים את העבודה השחורה, המחקר,
              הטיוטות והסימון הטכני, ואנחנו שומרים את הזמן האנושי לאסטרטגיה ולביקורת. את החיסכון
              אתם מקבלים במחיר, לא אנחנו ברווח.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסקים שהלקוחות שלהם שואלים AI לפני שהם קונים',
          'עסקים שעשו SEO ורוצים גם להופיע בתשובות AI',
          'עסקים שמגלים שהמתחרה מצוטט במקומם',
          'מייסדים שרוצים להיות התשובה בקטגוריה שלהם מההתחלה',
        ]}
        no={[
          'מי שרוצה רק בדיקה חד-פעמית (יש בדיקת נראות ב-AI חינם)',
          'מי שמצפה להופיע בכל תשובה כבר מחר, זה תהליך',
          'מי שלא מוכן לפרסם תוכן חדש לאורך זמן',
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
              <PackageCard pkg={geoPkg} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── LEAD FORM, STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── TRUST BAR ──── */}
      <TrustBar items={[
        'בלי חוזה',
        'ביטול בכל עת',
        'בלי דמי הקמה',
        'ליווי שוטף כלול',
        'בדיקת נראות ב-AI ראשונה חינם',
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
              <FAQItem question="מה ההבדל בין GEO, AEO ו-SEO רגיל?">
                <p>SEO מקדם אתכם בגוגל הקלאסי. AEO דואג שתהיו התשובה במנועי-תשובות (כמו AI Overviews). GEO דואג שתצוטטו ב-AI גנרטיבי (ChatGPT, Gemini, Perplexity). אנחנו עושים את שלושתם, כי הלקוחות שלכם כבר עברו לשם.</p>
              </FAQItem>
              <FAQItem question="כמה עולה קידום ב-AI?">
                <p>החל מ-1,250 ₪ לחודש, כולל אבחון, בניית תוכן, Schema, ביסוס ישויות ומדידה חודשית. בלי דמי הקמה, בלי חוזה. לשם השוואה, בעולם שירות דומה לעסק קטן מתחיל ב-3,000 ₪ לחודש, בדרך כלל עם חוזה שנתי.</p>
              </FAQItem>
              <FAQItem question="כמה זמן עד שרואים תוצאות?">
                <p>אבחון ותשתית ראשונית עומדים תוך כ-30 יום. ציטוטים ראשונים ב-AI מתחילים להופיע תוך חודש-חודשיים, ומתחזקים ככל שמצטבר תוכן. זה תהליך, לא כפתור.</p>
              </FAQItem>
              <FAQItem question="איך בכלל מודדים הופעה ב-AI?">
                <p>אנחנו שולחים למנועי ה-AI את השאלות שהלקוחות שלכם שואלים, ובודקים מי מצוטט בתשובה. הדוח החודשי מראה Citation Share, כמה פעמים אתם מופיעים מול המתחרים, ועל אילו נושאים.</p>
              </FAQItem>
              <FAQItem question="כבר עשיתי SEO, זה מתנגש?">
                <p>להפך, זה משלים. חלק מהעבודה (תוכן איכותי, Schema, מבנה) מחזק גם את הדירוג בגוגל. אנחנו בונים נכס אחד שעובד גם לחיפוש הקלאסי וגם ל-AI.</p>
              </FAQItem>
              <FAQItem question="מה קורה אם אני רוצה לבטל?">
                <p>הודעה מראש של 30 יום. בלי קנסות, בלי חוזה. כל מה שבנינו, התוכן, העמודים וה-Schema, נשאר שלכם וממשיך לעבוד.</p>
              </FAQItem>
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="ערן ורון, הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── LEAD FORM, FINAL SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── FINAL CTA ──── */}
      <FinalCTA
        title="תהיו התשובה, לא הערת שוליים."
        subtitle="הילדים הטובים מחכים לשיחה. בדיקת נראות ב-AI ראשונה בחינם, נראה לכם איפה אתם מופיעים היום ואיפה לא, ונחזור עם תוכנית. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

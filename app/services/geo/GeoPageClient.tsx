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
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import GeoTimeline from './GeoTimeline';
import GeoConstellation from './GeoConstellation';
import dynamic from 'next/dynamic';

const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
const SearchLottie = dynamic(() => import('../../components/SearchLottie'), { ssr: false });

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על פיילוט קידום ב-AI (GEO)')}`;

// GEO pilot package lives at the end of corePackages (hidden from the homepage grid).
const geoPkg = corePackages.find((p) => p.href === '/services/geo') ?? corePackages[corePackages.length - 1];

export default function GeoPageClient() {
  return (
    <div className="service-page">
      {/* ──── HERO ──── */}
      <ServiceHero
        eyebrow="שירות · קידום ב-AI (GEO)"
        title="עכשיו, בזמן שאתה קורא את זה, מישהו שאל את ChatGPT על עסק כמו שלך.<br/>וקיבל שם אחד. לא שלך."
        subtitle="הוא לא יותר טוב ממך. הוא פשוט דאג שהבינה המלאכותית תכיר אותו, ואתה לא. אנחנו הילדים הטובים של עולם הדיגיטל, ואנחנו עושים לך בדיוק את זה: לוקחים את התוכן שכבר יש לך באתר, הופכים אותו למשהו ש-ChatGPT בוחר להמליץ עליו, ואומרים לך מראש כמה כתבות אתה מקבל ובכמה. בלי חוזה, בלי דמי הקמה."
        marketPrice="6,000-15,000"
        price="החל מ-1,250 ₪"
        priceNote="לחודש · פיילוט 3 חודשים · בלי חוזה · בלי דמי הקמה"
        ctaHref="#check"
        ctaText="בדיקת נראות חינם"
      >
        <SearchLottie />
      </ServiceHero>

      {/* ──── NARRATIVE #1 ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>בוא נגיד את מה שאף אחד לא טרח לספר לך.</h2>
              <p>
                בנית אתר. אולי גם עשית קצת גוגל, קצת פרסום, והשקעת שנים בלהיות טוב במה שאתה עושה.
                ואז, בשקט, בלי שאף אחד הודיע, הלקוחות שלך הפסיקו לגלול עשרה קישורים בגוגל. הם פשוט
                שואלים את ChatGPT, ומקבלים תשובה אחת. עם שם אחד.
              </p>
              <p>
                זה לא שאתה פחות טוב מהמתחרה. זה שהמתחרה, במקרה או לא, בנוי בצורה שהבינה המלאכותית יודעת
                לקרוא ולהמליץ עליו. אתה פשוט לא שם. ואתה אפילו לא יודע את זה, כי אף אחד לא מראה לך את
                השיחות האלה.
              </p>
              <p>
                ומה שבאמת מטריד זה לא עוד ליד שהלך. זה שכל מה שבנית נהיה לאט בלתי נראה, רק בגלל שהעולם
                החליף ערוץ.
              </p>
              <p className="sp-narrative-highlight">
                הילדים הטובים דואגים שתהיה התשובה. מתחילים מהתוכן שכבר יש לך, בשפה שאתה מבין, בלי חוזה לשנה.
              </p>
            </ScrollTextHighlight>
            <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
          </div>
        </div>
      </section>

      {/* ──── GEO / AEO, בשפה פשוטה ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>רגע, מה זה בכלל GEO? ומה זה AEO?</h2>
            <p>שתי מילים שכולם זורקים ואף אחד לא טורח להסביר. אז בפשטות, בלי לאלץ אותך ללמוד מילון חדש:</p>
            <p><strong>GEO</strong> זה שכשמישהו שואל את ChatGPT, את Gemini או את Claude המלצה בתחום שלך, השם שלך יעלה בתשובה.</p>
            <p><strong>AEO</strong> זה שתהיה התשובה הקצרה והישירה, זו שגוגל והבינה המלאכותית שולפים לראש העמוד, עוד לפני כל הקישורים.</p>
            <p className="sp-narrative-highlight">ובמשפט אחד: גוגל הביא אותך לרשימה. GEO ו-AEO דואגים שתהיה התשובה עצמה.</p>
            <p>ואתה לא צריך לזכור את הראשי תיבות. בשביל זה אנחנו כאן. שלך זה להמשיך לעשות את מה שאתה טוב בו. (רוצה את כל המונחים? יש לנו <a href="/glossary">מילון שלם בעברית</a>.)</p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── בדיקת נראות חינם (מוטמעת) ──── */}
      <section className="sp2-section" id="check">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">אל תאמין לי. תבדוק בעצמך.</h2>
            <p className="sp2-lead">
              במקום להבטיח לך, בוא נראה לך. הכנס את כתובת האתר שלך, ותוך כמה שניות תדע אם ChatGPT, Gemini
              ו-Claude מכירים אותך או שולחים את הלקוחות שלך למישהו אחר. חינם, בלי להשאיר פרטים, בלי התחייבות.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up">
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              {/* הבדיקה המלאה חיה כבר ב-/ai-checker. בשלב הבא היא מוטמעת כאן inline (אותו רכיב, אותן תוצאות). */}
              <a href="/ai-checker" className="sp-hero-cta">בדיקת נראות חינם</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── PAIN POINTS ──── */}
      <PainSection
        title="מכירים את הסיפור?"
        cards={[
          {
            title: 'שואלים AI, ואתה לא בתשובה',
            text: 'לקוח שואל את ChatGPT או Gemini המלצה בתחום שלך, ומקבל שלושה שמות. שלך לא ביניהם. ולא ידעת שזה קורה, כי אף אחד לא מראה לך את השיחות האלה. הילדים הטובים דואגים שתהיה בתשובה.',
          },
          {
            title: 'המתחרה מקבל את הלקוח במקומך',
            text: 'זה לא שהוא יותר טוב ממך. הוא פשוט בנוי בצורה שהבינה המלאכותית יודעת להמליץ עליו. אתה עובד קשה, והפנייה הולכת אליו. הילדים הטובים מחזירים אותך למשחק.',
          },
          {
            title: 'עשית SEO, וזה כבר לא מספיק',
            text: 'השקעת בגוגל, דאגת שיהיה לך אתר, וזה היה נכון. אבל הלקוחות כבר לא גוללים עשרה קישורים, הם שואלים את ה-AI. זה עולם אחר עם חוקים אחרים. הילדים הטובים עושים את שניהם, גם גוגל וגם AI.',
          },
        ]}
      />

      {/* ──── בלי המלצות מזויפות ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader eyebrow="שקיפות" titleHtml="בלי סיפורים<br>מומצאים." />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <p className="sp2-lead" style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
              בוא נהיה כנים, כי אנחנו הילדים הטובים של עולם הדיגיטל. GEO חדש וטרי, אז לא תמצא כאן עשרים
              ביקורות נלהבות שכתבנו לעצמנו. מה שכן יש: כבר כמה לקוחות שאנחנו עושים להם GEO ממש עכשיו.
              וברגע שיהיו תוצאות אמיתיות לספר עליהן, הן יופיעו כאן, עם שם ועם מספר. עד אז, עדיף לנו
              להגיד לך את האמת מאשר למכור לך סיפור.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── LEAD FORM, SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── CONSTELLATION ──── */}
      <GeoConstellation />

      {/* ──── STEPS TIMELINE ──── */}
      <GeoTimeline />

      {/* ──── מה בדיוק מקבלים (3 תוצרים) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה בדיוק אתה מקבל</h2>
            <p className="sp2-lead">בלי "אסטרטגיה" מעורפלת ובלי הבטחות באוויר. שלושה דברים שאתה יכול לספור.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '📝', title: 'כתבות שה-AI בוחר לצטט', desc: 'כל חודש אנחנו כותבים לך תוכן בדיוק במבנה שגורם ל-ChatGPT, ל-Gemini ול-Claude לבחור דווקא בך כשהם עונים ללקוח. ואתה יודע מראש כמה כתבות אתה מקבל.' },
                { icon: '🔧', title: 'שיפוץ התוכן שכבר יש לך', desc: 'לא זורקים את מה שהשקעת בו. לוקחים את העמודים שכבר קיימים באתר שלך ומסדרים אותם מחדש כך שהבינה המלאכותית תבין ותצטט, בלי לכתוב הכל מאפס.' },
                { icon: '📊', title: 'פגישת מעקב ודוח שאתה מבין', desc: 'פעם בחודש נשב יחד, תראה בדיוק כמה פעמים הוזכרת מול המתחרים, ונחליט מה הצעד הבא. בלי ז׳רגון, רק מספרים אמיתיים.' },
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

      {/* ──── FEATURES, מה כלול בפיילוט ──── */}
      <FeaturesSection
        title="מה כלול בפיילוט"
        lead="בלי כוכביות ובלי הפתעות. זה מה שאתה מקבל, חודש בחודשו."
        stats={[
          { value: 3, suffix: ' מנועים', label: 'ChatGPT · Gemini · Claude' },
          { value: 3, suffix: ' חודשים', label: 'פיילוט להוכחת תוצאות' },
          { value: 1, suffix: ' / חודש', label: 'דוח ופגישת מעקב' },
        ]}
        features={[
          { title: 'בדיקת פתיחה מלאה', text: 'נקודת הבסיס שממנה מודדים, איפה אתה עומד היום ב-ChatGPT, Gemini ו-Claude.' },
          { title: 'כתבות מותאמות-AI', text: 'תוכן חדש בכל חודש, במבנה שהבינה המלאכותית בוחרת לצטט.' },
          { title: 'שיפוץ התוכן הקיים', text: 'מסדרים מחדש את העמודים שכבר יש לך כך שה-AI יבין ויצטט.' },
          { title: 'כל הסימון הטכני', text: 'Schema, קובץ הכוונה ל-AI ועוד, נעשה מאחורי הקלעים, בלי שתתעסק.' },
          { title: 'דוח חודשי מול המתחרים', text: 'כמה פעמים הוזכרת מול המתחרים, שחור על גבי לבן.' },
          { title: 'פגישת מעקב וכיוונון', text: 'פעם בחודש נשב, נראה את המספרים, ונחליט מה הלאה.' },
        ]}
      />

      {/* ──── NARRATIVE #2, הפיילוט ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>אל תתחייב על משהו שעוד לא ראית עובד. פיילוט של 3 חודשים.</h2>
            <p>
              GEO זה חדש, וזה בסדר גמור להיות סקפטי. אז במקום שתחתום על חוזה ארוך ותקווה לטוב, אנחנו
              מתחילים בפיילוט. שלושה חודשים, יעד אחד ברור: לגרום לבינה המלאכותית להתחיל להמליץ עליך.
            </p>
            <p>
              בסוף שלושת החודשים תדע בדיוק כמה השתפרת. כמה פעמים ה-AI מזכיר אותך היום לעומת היום
              שהתחלנו. מספר, לא תחושה. ואז אתה מחליט אם להמשיך, בלי לחץ ובלי שאף אחד "נעלם" עם הכסף.
            </p>
            <p className="sp-narrative-highlight">
              החל מ-1,250 ₪ לחודש, פיילוט 3 חודשים. במקום 6,000-15,000 שגובים בשוק. בלי דמי הקמה, בלי חוזה ארוך.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'הלקוחות שלך כבר שואלים AI לפני שהם קונים',
          'כבר יש לך אתר ותוכן שחבל שיתבזבזו',
          'אתה רוצה מחיר ברור, בלי חוזה ובלי הפתעות',
          'אתה עצמאי או עסק קטן ורוצה להקדים את המתחרים',
        ]}
        no={[
          'אתה מחפש קסם של לילה אחד, זה תהליך ולא כפתור',
          'אין לך אתר בכלל (אז קודם בונים, ויש לנו גם את זה)',
          'אתה רוצה שנבטיח לך מקום ראשון, אף אחד לא יכול להבטיח את זה בכנות',
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
        'בלי חוזה ארוך',
        'אפשר לעצור בכל רגע',
        'בלי דמי הקמה',
        'בדיקת נראות ב-AI ראשונה חינם',
        '20% הנחה לעצמאים ועסקים קטנים',
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
              <FAQItem question="מה זה GEO בשורה אחת?">
                <p>שכשלקוח שואל את ChatGPT, Gemini או Claude המלצה בתחום שלך, השם שלך יעלה בתשובה. גוגל הביא אותך לרשימה, GEO דואג שתהיה התשובה עצמה.</p>
              </FAQItem>
              <FAQItem question="במה זה שונה מ-SEO רגיל?">
                <p>SEO דואג שתדורג בגוגל. GEO דואג שתצוטט בתשובה של ה-AI, איפה שכבר אין רשימת קישורים ללחוץ עליה. אנחנו עושים את שניהם, הם משלימים זה את זה.</p>
              </FAQItem>
              <FAQItem question="כמה זמן עד שרואים תוצאות?">
                <p>בדיקת הפתיחה והתשתית תוך השבועות הראשונים. אזכורים ראשונים ב-AI מתחילים להופיע תוך חודש-חודשיים ומתחזקים ככל שמצטבר תוכן. בשביל זה הפיילוט הוא שלושה חודשים, מספיק כדי לראות אם זה זז.</p>
              </FAQItem>
              <FAQItem question="כמה זה עולה?">
                <p>החל מ-1,250 ₪ לחודש, פיילוט של שלושה חודשים. בלי דמי הקמה, בלי חוזה ארוך. לשם השוואה, בשוק שירות דומה מתחיל ב-6,000 ומעלה.</p>
              </FAQItem>
              <FAQItem question="זה מתאים לעסק קטן כמו שלי?">
                <p>דווקא עסק קטן יכול לנצח כאן. השוק עוד חדש, רוב המתחרים שלך עדיין לא עושים את זה. מי שמקדים, תופס את המקום בתשובה.</p>
              </FAQItem>
              <FAQItem question="אתם מבטיחים שאהיה ראשון?">
                <p>לא, ומי שמבטיח לך את זה משקר. מה שאנחנו מבטיחים: לעבוד בשיטה, ולהראות לך מספר אמיתי כל חודש כמה התקדמת. אתה מחליט לפי התוצאות.</p>
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
        title="בוא נראה איפה אתה עומד היום."
        subtitle="הילדים הטובים מחכים. התחל בבדיקת נראות חינם, ותראה בעצמך אם ChatGPT, Gemini ו-Claude מכירים אותך או שולחים את הלקוחות שלך למתחרה. בלי התחייבות, בלי טלפון מכירות אגרסיבי."
        ctaHref={wa}
        ctaText="בדיקת נראות חינם"
      />
    </div>
  );
}

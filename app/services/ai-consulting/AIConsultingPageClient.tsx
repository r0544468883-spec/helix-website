'use client';

import dynamic from 'next/dynamic';
import { SITE } from '@/lib/site';

const AIHeroLottie = dynamic(() => import('../../components/CompassLottie'), { ssr: false });
const ScissorsLottie = dynamic(() => import('../../components/ScissorsLottie'), { ssr: false });
import ServiceHero from '../../components/service/ServiceHero';
import PainSection from '../../components/service/PainSection';
import ForWhoSection from '../../components/service/ForWhoSection';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import LeadForm from '../../components/sections/LeadForm';
import ScrollReveal from '../../components/ScrollReveal';
import ScrollTextHighlight from '../../components/ScrollTextHighlight';
import FAQItem from '../../components/FAQItem';
import SectionHeader from '../../components/SectionHeader';
import AIConsultingReviews from './AIConsultingReviews';
import AIConsultingTimeline from './AIConsultingTimeline';
import AIConsultingConstellation from '../../components/AIConsultingConstellation';
import { PackageCard, corePackages } from '../../components/sections/Services';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על ליווי והטמעת AI בעסק/בארגון')}`;

export default function AIConsultingPageClient() {
  return (
    <div className="service-page">
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow="ליווי והטמעה · בינה מלאכותית לעסקים וארגונים"
        title="ליווי והטמעת AI בעסק —<br/>מבלגן של כלים לתהליך שעובד."
        subtitle="לכולם יש ChatGPT פתוח בטאב וכולם עדיין עובדים אותו דבר. הילדים הטובים של עולם הדיגיטל עושים לך סדר: מיפוי, בחירת הכלים הנכונים, סדנאות לצוות, ומדיניות ברורה — עד ש-AI באמת חוסך לך זמן וכסף."
        marketPrice="6,000–20,000"
        price="החל מ-400 ₪"
        priceNote="לחודש · ליווי שוטף או פרויקט הטמעה חד-פעמי · בלי חוזה ארוך · ביטול בכל עת"
        ctaHref={wa}
      >
        <AIHeroLottie />
      </ServiceHero>

      {/* ──── 2. STATS GRID ──── */}
      <section className="sp2-section" style={{ paddingTop: '24px' }}>
        <div className="container">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:px-8">
            {[
              { icon: '⏱', value: '25+', unit: 'שעות', desc: 'חיסכון חודשי לעובד בממוצע', d: 0 },
              { icon: '🚀', value: '3', unit: 'שבועות', desc: 'עד ל-Quick Win ראשון מדיד', d: 0.15 },
              { icon: '📈', value: '80', unit: '%', desc: 'מהצוות עובד עם AI אחרי ההטמעה', d: 0.3 },
            ].map((s) => (
              <ScrollReveal key={s.desc} direction="up" delay={s.d}>
                <div className="flex items-center overflow-hidden rounded-lg border border-emerald-900/30 bg-[#0d1512] p-5 gap-4">
                  <span className="text-3xl flex-shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-3xl font-bold text-emerald-400">{s.value} <span className="text-lg font-normal text-emerald-400/70">{s.unit}</span></p>
                    <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── 3. NARRATIVE #1 + BURNING MONEY ──── */}
      <section className="sp-narrative">
        <div className="container">
          <div className="sp-narrative-with-video">
            <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
              <h2>כולם &quot;עושים AI&quot;. כמעט אף אחד לא מרוויח מזה.</h2>
              <p>
                האמת? רוב העסקים היום כבר קנו מנוי ל-ChatGPT, ניסו כלי או שניים, ונתקעו. כל אחד עובד לבד,
                אף אחד לא יודע מה מותר, והחיסכון האמיתי — לא הגיע. AI הפך לעוד טאב פתוח, לא ליתרון.
              </p>
              <p>
                הטמעה טובה היא לא &quot;עוד כלי&quot;. זה תהליך: להבין איפה AI ייצר לך הכי הרבה ערך,
                לבחור נכון, להכשיר את האנשים, ולהגדיר כללים ברורים לאבטחת מידע. ואז — למדוד שזה באמת עובד.
              </p>
              <p className="sp-narrative-highlight">
                הילדים הטובים לוקחים אותך מ&quot;מנסים&quot; ל&quot;עובד&quot;. בלי חוזה. בלי הרצאות באוויר.
              </p>
            </ScrollTextHighlight>
            <video className="sp-burn-video" src="/burning-money.mp4" autoPlay loop muted playsInline />
          </div>
        </div>
      </section>

      {/* ──── 4. PAIN POINTS ──── */}
      <PainSection
        title="למה רוב הטמעות ה-AI נכשלות?"
        cards={[
          {
            title: 'קנו כלים, אף אחד לא משתמש',
            text: 'מנוי ל-ChatGPT Teams יושב ריק. הצוות חוזר להרגלים הישנים כי אף אחד לא הראה להם איך זה עוזר להם ספציפית. הילדים הטובים מטמיעים דרך הכאב האמיתי של כל תפקיד.',
          },
          {
            title: 'פחד מדליפת מידע',
            text: 'עובדים מדביקים מסמכים רגישים ל-AI ציבורי בלי לחשוב. בלי מדיניות ברורה זו פצצת זמן. הילדים הטובים בונים כללי שימוש ואבטחת מידע לפני שמרחיבים.',
          },
          {
            title: 'הרבה רעש, אפס מדידה',
            text: 'שמעתם על 50 כלים ולא יודעים במה להתחיל. בלי מיפוי ומדידה זה נשאר תחושה. הילדים הטובים מדרגים לפי אימפקט מול מאמץ ומראים תוצאות במספרים.',
          },
          {
            title: 'הדרכה חד-פעמית שנשכחת',
            text: 'עשו סדנה אחת, כולם התלהבו, ואחרי שבוע חזרו לשגרה. הטמעה זה תהליך מלווה, לא אירוע. הילדים הטובים נשארים עד שזה הופך להרגל.',
          },
        ]}
      />

      {/* ──── 5. LEAD FORM — SOFT #1 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 6. REVIEWS ──── */}
      <ScrollReveal direction="up">
        <AIConsultingReviews />
      </ScrollReveal>

      {/* ──── 7. CONSTELLATION ──── */}
      <AIConsultingConstellation />

      {/* ──── 8. TIMELINE ──── */}
      <AIConsultingTimeline />

      {/* ──── 9. SUB-SERVICES — FLIP CARDS ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה כולל הליווי וההטמעה</h2>
            <p className="sp2-lead">הילדים הטובים מלווים אותך מהאסטרטגיה ועד שכל צוות עובד עם AI בביטחון.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '🗺', title: 'אבחון ומפת הזדמנויות', desc: 'סקירת תהליכים, זיהוי איפה AI ייצר ערך, ודירוג לפי אימפקט מול מאמץ. יוצאים עם roadmap ברור.' },
                { icon: '🎯', title: 'אסטרטגיית AI', desc: 'מגדירים יעדים, מדדי הצלחה, ותקציב. AI שמשרת את מטרות העסק — לא גימיק.' },
                { icon: '🧑‍🏫', title: 'סדנאות והכשרות', desc: 'סדנאות מעשיות לצוותים ולהנהלה — לפי תפקיד. יוצאים יודעים לעבוד, לא רק מתלהבים.' },
                { icon: '📚', title: 'ספריית פרומפטים', desc: 'פרומפטים מוכנים לתהליכים החוזרים של הארגון. כל אחד מקבל תוצאה איכותית מהיום הראשון.' },
                { icon: '🤖', title: 'GPTs וסוכנים ייעודיים', desc: 'עוזרי AI מותאמים לעסק — עם הידע, הטון והכללים שלך. מחוברים למידע הפנימי (RAG).' },
                { icon: '🔐', title: 'מדיניות ואבטחת מידע', desc: 'כללי שימוש ברורים, מה מותר ומה אסור, והגנה על מידע רגיש. שקט נפשי להנהלה.' },
                { icon: '⚙️', title: 'חיבור למערכות', desc: 'שילוב AI ב-CRM, מייל, מסמכים ותהליכי עבודה קיימים — בלי לשבור את מה שעובד.' },
                { icon: '📊', title: 'ליווי ומדידה שוטפים', desc: 'פגישות ליווי + דוח תוצאות. מודדים שעות שנחסכו, מרחיבים, ומעדכנים כשהכלים משתנים.' },
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

      {/* ──── 10. FEATURES — "מה כלול" + FLIP CARDS ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader eyebrow="לפי מחלקה" titleHtml="AI מותאם<br/>לכל צוות בארגון." />
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {[
                { icon: '💼', title: 'מכירות', desc: 'סיכומי שיחות, הצעות מחיר, פולואפים והכנה לפגישות — בשבריר מהזמן. יותר זמן למכור.' },
                { icon: '📣', title: 'שיווק ותוכן', desc: 'רעיונות, כתיבה, יצירת תמונות ווידאו, ותרגום — פייפליין תוכן שלם ברוטינה שבועית.' },
                { icon: '🎧', title: 'שירות לקוחות', desc: 'טיוטות תשובות, סיכומי פניות ובסיס ידע חכם. מענה מהיר ואחיד בלי לוותר על אנושיות.' },
                { icon: '🧾', title: 'פיננסים ותפעול', desc: 'ניתוח נתונים, דוחות, סיכומי ישיבות ואוטומציה של עבודה ידנית חוזרת.' },
                { icon: '👥', title: 'משאבי אנוש', desc: 'סינון קורות חיים, ניסוח משרות, וחומרי הדרכה. פחות ביורוקרטיה, יותר אנשים.' },
                { icon: '⚖️', title: 'הנהלה ומשפט', desc: 'סיכומי מסמכים, מחקר, ותמיכה בהחלטות — עם כללי סודיות ואבטחת מידע מובנים.' },
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

      {/* ──── 11. NARRATIVE #2 — "למה המחיר הזה?" ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>&quot;למה זה לא עולה כמו שחברת ייעוץ גדולה גובה?&quot;</h2>
            <p>
              כי אנחנו לא מוכרים מצגת של 80 עמודים ונעלמים. אנחנו יושבים איתך עד שזה עובד בשטח,
              משתמשים ב-AI כדי לעשות את העבודה מהר יותר, ומעבירים לך את החיסכון.
            </p>
            <p className="sp-narrative-highlight">
              הילדים הטובים גובים על תוצאה, לא על שעות של יועצים בחליפות.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── 12. FOR WHO ──── */}
      <ForWhoSection
        yes={[
          'עסקים וארגונים שיודעים ש-AI חשוב אבל תקועים ב"איפה מתחילים"',
          'הנהלה שרוצה תוצאה מדידה, לא עוד הרצאת השראה',
          'צוותים שמנסים כלים לבד וזה לא מתרומם',
          'ארגונים שחוששים מדליפת מידע ורוצים מדיניות ברורה',
          'עסק שרוצה יתרון תחרותי אמיתי מ-AI, לא רק "להיות בטרנד"',
        ]}
        no={[
          'מי שמחפש רק "כלי אחד" בלי ליווי (יש את חבילת האוטומציות/בנק השעות)',
          'מי שלא מוכן לשחרר לצוות זמן ללמידה והטמעה',
          'ארגון שמחפש חותמת "עשינו AI" בלי כוונה באמת לשנות',
        ]}
      />

      {/* ──── 13. PACKAGE CARD (identical to homepage) ──── */}
      <section className="sp2-section" id="packages">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="sp-package-with-scissors">
              <div className="sp-scissors-wrap" aria-hidden="true">
                <ScissorsLottie />
              </div>
              <PackageCard pkg={corePackages[5]} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 14. LEAD FORM — STRONG ──── */}
      <ScrollReveal direction="up">
        <LeadForm />
      </ScrollReveal>

      {/* ──── 15. TRUST BAR ──── */}
      <TrustBar items={[
        'בלי חוזה ארוך',
        'ביטול בכל עת',
        'אבחון ומיפוי ראשוני חינם',
        'מדיניות אבטחת מידע כלולה',
        '20% הנחה לסטארטאפים ועסקים קטנים',
      ]} />

      {/* ──── 16. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="שאלות שנשאלות<br>לפני כל הטמעת AI." />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="מה זה בעצם ליווי והטמעת AI?">
                <p>זה תהליך שלוקח את הארגון מ&quot;שמענו על AI&quot; ל&quot;עובדים איתו כל יום ומרוויחים ממנו&quot;: אבחון הזדמנויות, בחירת כלים, סדנאות לצוות, מדיניות אבטחת מידע, ומדידת תוצאות.</p>
              </FAQItem>
              <FAQItem question="כמה עולה ליווי והטמעה ב-HELIX?">
                <p>מתחילים באבחון ומיפוי ראשוני חינם. אחרי זה — ליווי חודשי או פרויקט הטמעה חד-פעמי, לפי גודל הארגון והיקף. בלי חוזה ארוך.</p>
              </FAQItem>
              <FAQItem question="כמה זמן עד שרואים תוצאה?">
                <p>ה-Quick Win הראשון בדרך כלל תוך 2-3 שבועות. הטמעה מלאה בכל המחלקות היא תהליך של כמה חודשים, בקצב שהארגון יכול לעכל.</p>
              </FAQItem>
              <FAQItem question="אנחנו מודאגים מדליפת מידע רגיש">
                <p>זו הדאגה הכי חשובה ואנחנו מתחילים ממנה. בונים מדיניות שימוש ברורה, מגדירים מה מותר ומה אסור, ובמידת הצורך מטמיעים פתרונות ארגוניים/פרטיים (Azure OpenAI, מודלים מקומיים) שלא חושפים מידע החוצה.</p>
              </FAQItem>
              <FAQItem question="הצוות שלנו לא טכנולוגי, זה יעבוד?">
                <p>דווקא בגלל זה צריך ליווי. הסדנאות מותאמות לפי תפקיד ולא דורשות רקע טכני. מתחילים מהכאב האמיתי של כל אחד ומראים לו איך AI עוזר לו ספציפית.</p>
              </FAQItem>
              <FAQItem question="במה זה שונה מלקנות מנוי ל-ChatGPT?">
                <p>מנוי זה כלי. הטמעה זה שיטה. אנחנו דואגים שהכלי באמת יכנס לתהליכי העבודה, שכולם ידעו להשתמש בו נכון ובבטחה, ושתמדדו שזה מחזיר ערך — במקום עוד טאב פתוח שאף אחד לא נוגע בו.</p>
              </FAQItem>
            </ScrollTextHighlight>
            <div className="faq-image-side">
              <img src="/faq-team.png" alt="ערן ורון — הצוות של HELIX" className="faq-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ──── 17. LEAD FORM — SOFT #3 ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 18. FINAL CTA ──── */}
      <FinalCTA
        title="רוצים ש-AI באמת יעבוד אצלכם?"
        subtitle="הילדים הטובים מחכים לשיחה. אבחון ומיפוי ראשוני בחינם — נראה לכם איפה AI ייצר לכם את הערך הכי גדול, ואיך מתחילים בלי סיכון. בלי התחייבות."
        ctaHref={wa}
        ctaText="בואו נדבר"
      />
    </div>
  );
}

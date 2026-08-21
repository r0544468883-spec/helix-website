'use client';

import { SITE } from '@/lib/site';
import { EmojiIcon } from '@/lib/emoji-icon';
import ServiceHero from '../components/service/ServiceHero';
import PainSection from '../components/service/PainSection';
import ForWhoSection from '../components/service/ForWhoSection';
import TrustBar from '../components/service/TrustBar';
import FinalCTA from '../components/service/FinalCTA';
import LeadForm from '../components/sections/LeadForm';
import ScrollReveal from '../components/ScrollReveal';
import ScrollTextHighlight from '../components/ScrollTextHighlight';
import FAQItem from '../components/FAQItem';
import SectionHeader from '../components/SectionHeader';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  'שלום, ראיתי את תכנית השותפים של HELIX ורציתי לשמוע איך מצטרפים ומרוויחים',
)}`;

// שלושת מסלולי השותפות
const tracks = [
  {
    icon: '🤝',
    name: 'שגריר',
    who: 'לקוח מרוצה שממליץ',
    desc: 'כבר משתמשים ואוהבים? כל חבר שתביאו מזכה אתכם באחוז חודשי, כקרדיט שמקזז לכם את המנוי או כמזומן. הם מקבלים חודש ראשון חינם.',
    reward: 'אחוז חודשי, קרדיט או מזומן',
  },
  {
    icon: '🎯',
    name: 'שותף מפנה',
    who: 'יועץ או איש מכירות עצמאי',
    desc: 'יש לכם לקוח שצריך את HELIX? מפנים אותנו, ואנחנו סוגרים, מחייבים ותומכים. אתם מקבלים אחוז חודשי כל עוד הלקוח פעיל, בלי לגעת בתפעול.',
    reward: 'עד 25% תמלוג חודשי',
    featured: true,
  },
  {
    icon: '🏷️',
    name: 'White-Label',
    who: 'סוכנות שיווק או דיגיטל',
    desc: 'רוצים למכור את הכלים במותג שלכם? קונים בסיטונאי, מתמחרים ללקוח כרצונכם, ומרוויחים את ההפרש. הלקוח רואה אתכם, לא אותנו.',
    reward: 'עד 45% מרווח סיטונאי',
  },
];

// מדרגות התמלוג (הכנסה חוזרת)
const royaltyTiers = [
  { medal: '🥉', name: 'Bronze', range: '1 עד 5 לקוחות פעילים', rate: '15%' },
  { medal: '🥈', name: 'Silver', range: '6 עד 15 לקוחות פעילים', rate: '20%' },
  { medal: '🥇', name: 'Gold', range: '16 לקוחות ומעלה', rate: '25%', featured: true },
];

// מדרגות White-Label (מרווח סיטונאי)
const wlTiers = [
  { name: 'Registered', range: '1 עד 5 לקוחות', rate: '40%' },
  { name: 'Gold', range: '6 עד 20 לקוחות', rate: '43%' },
  { name: 'Platinum', range: '21 לקוחות ומעלה', rate: '45%', featured: true },
];

const steps = [
  { icon: '📝', title: 'מצטרפים בחינם', desc: 'בלי עלות הצטרפות ובלי חוזה. ממלאים טופס קצר ומקבלים גישה.' },
  { icon: '🔗', title: 'מקבלים לינק וקוד', desc: 'לינק מעקב אישי וקוד ייחודי. כל לקוח שמגיע דרככם משויך אליכם אוטומטית.' },
  { icon: '🚀', title: 'מפנים לקוחות', desc: 'לתוכנות או לליווי. הלקוח מקבל חודש ראשון חינם, אתם מקבלים אשראי על ההפניה.' },
  { icon: '💸', title: 'מקבלים תמלוג חודשי', desc: 'אחוז מכל לקוח פעיל, כל חודש. ככל שתביאו יותר, האחוז על כולם עולה.' },
];

export default function PartnersPageClient() {
  return (
    <div className="service-page">
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow="תכנית שותפים · הרוויחו יחד עם HELIX"
        title='הביאו לנו לקוחות,<br/>קבלו הכנסה חודשית שגדלה.'
        subtitle="יועצים, סוכנויות ואנשי מכירות: כל לקוח שאתם מביאים לתוכנות או לליווי של HELIX מכניס לכם אחוז כל חודש, כל עוד הוא לקוח. ככל שתביאו יותר, האחוז על כולם עולה."
        marketPrice="0 עלות הצטרפות"
        price="עד 25% תמלוג חודשי"
        priceNote="או עד 45% מרווח במסלול White-Label · בלי חוזה · משלמים לכם רק על הצלחה"
        highlights={['אחוז חודשי חוזר', 'מדרגות שעולות עם הכמות', 'מותג לבן לסוכנויות']}
        highlightsLabel="מה מקבלים"
        ctaHref={wa}
        ctaText="בואו נדבר על שותפות"
      />

      {/* ──── 2. STATS GRID ──── */}
      <section className="sp2-section" style={{ paddingTop: '24px' }}>
        <div className="container">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:px-8">
            {[
              { icon: '📈', value: '25', unit: '%', desc: 'תמלוג חודשי על כל לקוח, עולה עם הכמות', d: 0 },
              { icon: '🏷️', value: '45', unit: '%', desc: 'מרווח לסוכנויות במסלול White-Label', d: 0.15 },
              { icon: '🎁', value: '₪0', unit: '', desc: 'עלות הצטרפות. בלי חוזה, בלי סיכון', d: 0.3 },
            ].map((s) => (
              <ScrollReveal key={s.desc} direction="up" delay={s.d}>
                <div className="flex items-center overflow-hidden rounded-lg border border-emerald-900/30 bg-[#0d1512] p-5 gap-4">
                  <span className="text-3xl flex-shrink-0"><EmojiIcon e={s.icon} /></span>
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

      {/* ──── 3. NARRATIVE #1, הכלל האחד ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>כלל אחד. בלי אותיות קטנות.</h2>
            <p>
              רוב תכניות השותפים מסבכות אתכם עם טבלאות אחוזים שונות לכל מוצר. אצלנו יש כלל אחד שאתם מבינים בשנייה:
              הבאתם לקוח שמשלם כל חודש, אתם מקבלים אחוז כל חודש. הבאתם עבודה חד-פעמית, אתם מקבלים עמלה חד-פעמית.
            </p>
            <p className="sp-narrative-highlight">
              מנוי תוכנה או ליווי חודשי? תמלוג חודשי חוזר. פרויקט הקמה? עמלת הפניה חד-פעמית. זהו.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── 4. שלושת המסלולים ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader eyebrow="בחרו את המסלול שלכם" titleHtml="שלוש דרכים<br/>להרוויח יחד איתנו." />
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {tracks.map((t, i) => (
              <ScrollReveal key={t.name} direction="up" delay={i * 0.1}>
                <div
                  className="h-full rounded-xl border p-6 flex flex-col"
                  style={{
                    borderColor: t.featured ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.2)',
                    background: t.featured ? 'rgba(16,185,129,0.08)' : '#0d1512',
                  }}
                >
                  <span className="text-4xl"><EmojiIcon e={t.icon} /></span>
                  <h3 className="text-xl font-bold text-white mt-3">{t.name}</h3>
                  <p className="text-sm text-emerald-400 mt-1">{t.who}</p>
                  <p className="text-sm text-gray-400 mt-3 flex-grow leading-relaxed">{t.desc}</p>
                  <p className="text-emerald-300 font-semibold mt-4 pt-4 border-t border-emerald-900/40">{t.reward}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── 5. LEAD FORM, SOFT ──── */}
      <ScrollReveal direction="up">
        <LeadForm variant="soft" />
      </ScrollReveal>

      {/* ──── 6. מדרגות התמלוג ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader eyebrow="ככל שתביאו יותר, תרוויחו יותר על כולם" titleHtml="מדרגות תמלוג<br/>שעולות עם הכמות." />
            <p className="sp2-lead">
              המדרגות רטרואקטיביות: ברגע שעליתם מדרגה, האחוז החדש חל על כל הלקוחות שלכם, גם הישנים. מדרגה אחת לכל המוצרים והליווי.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {royaltyTiers.map((t, i) => (
              <ScrollReveal key={t.name} direction="up" delay={i * 0.1}>
                <div
                  className="text-center rounded-xl border p-6"
                  style={{
                    borderColor: t.featured ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.2)',
                    background: t.featured ? 'rgba(16,185,129,0.08)' : '#0d1512',
                  }}
                >
                  <span className="text-4xl"><EmojiIcon e={t.medal} /></span>
                  <h3 className="text-lg font-bold text-white mt-2">{t.name}</h3>
                  <p className="text-6xl font-black text-emerald-400 my-3">{t.rate}</p>
                  <p className="text-sm text-gray-400">{t.range}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* דוגמת רווח */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-8 rounded-xl border border-emerald-900/30 bg-[#0d1512] p-6 text-center">
              <p className="text-gray-300 leading-relaxed">
                <span className="text-emerald-400 font-bold">דוגמה:</span> יועץ עם 8 לקוחות ליווי במדרגת Silver מרוויח
                <span className="text-white font-bold"> כ-2,000 ₪ בחודש</span>. חצה 16 לקוחות ועלה ל-Gold, וכל 16 קופצים ל-25%, כלומר
                <span className="text-white font-bold"> כ-5,000 ₪ בחודש</span>. זה הכוח של המדרגה הרטרואקטיבית.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 7. מדרגות White-Label ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <SectionHeader eyebrow="לסוכנויות שרוצות מותג משלהן" titleHtml="White-Label,<br/>מוכרים במותג שלכם." />
            <p className="sp2-lead">
              קונים את הכלים בסיטונאי, מתמחרים ללקוח כרצונכם, ומרוויחים את ההפרש. ככל שתגדילו נפח, המחיר הסיטונאי יורד והמרווח שלכם עולה.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {wlTiers.map((t, i) => (
              <ScrollReveal key={t.name} direction="up" delay={i * 0.1}>
                <div
                  className="text-center rounded-xl border p-6"
                  style={{
                    borderColor: t.featured ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.2)',
                    background: t.featured ? 'rgba(16,185,129,0.08)' : '#0d1512',
                  }}
                >
                  <h3 className="text-lg font-bold text-white">{t.name}</h3>
                  <p className="text-6xl font-black text-emerald-400 my-3">{t.rate}</p>
                  <p className="text-xs text-emerald-400/70 -mt-2 mb-2">מרווח לסוכנות</p>
                  <p className="text-sm text-gray-400">{t.range}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── 8. איך זה עובד ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד, ב-4 צעדים</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <div key={s.title} className="rounded-xl border border-emerald-900/30 bg-[#0d1512] p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl"><EmojiIcon e={s.icon} /></span>
                    <span className="text-2xl font-black text-emerald-400/40">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="text-white font-bold mt-3">{s.title}</h3>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 9. PAIN, למה השותפים בוחרים בנו ──── */}
      <PainSection
        title="למה שותפים בוחרים ב-HELIX"
        cards={[
          {
            title: 'סוויטה שלמה, לא מוצר בודד',
            text: 'תוכנות שיווק, מכירות, SEO, דשבורדים וגם ליווי אנושי. יש לכם מה להציע לכל לקוח, ותמלוג על כל אחד מהם.',
          },
          {
            title: 'אחוז חוזר, לא עמלה חד-פעמית',
            text: 'לקוח טוב שמביא ערך כל חודש מכניס לכם כסף כל חודש. ההכנסה שלכם מצטברת ככל שהתיק גדל.',
          },
          {
            title: 'עברית, וואטסאפ, מחיר הוגן',
            text: 'כלים שנבנו לשוק הישראלי במחיר שקל להצדיק ללקוח. קל לכם לסגור, קשה ללקוח לנטוש.',
          },
          {
            title: 'אנחנו עושים את העבודה הקשה',
            text: 'במסלול ההפניה אנחנו סוגרים, מחייבים ותומכים. אתם מביאים את הקשר, אנחנו את השאר.',
          },
        ]}
      />

      {/* ──── 10. למי זה מתאים ──── */}
      <ForWhoSection
        yes={[
          'יועצים עסקיים ויועצי שיווק שרוצים ערוץ הכנסה נוסף',
          'סוכנויות דיגיטל ושיווק שמחפשות מוצר להוסיף לסל',
          'אנשי מכירות ופיתוח עסקי עצמאיים',
          'לקוחות מרוצים שרוצים להרוויח מהמלצה',
          'משרדי רו"ח, ייעוץ והדרכה עם קהל עסקים',
        ]}
        no={[
          'מי שמחפש רווח מהיר בלי קשר אמיתי ללקוחות',
          'מי שלא מוכן ללוות את הלקוח לרגע הערך',
          'ספאם והפניות מזויפות, יש לנו בקרת איכות',
        ]}
      />

      {/* ──── 11. TRUST BAR ──── */}
      <TrustBar
        items={[
          'בלי עלות הצטרפות',
          'בלי חוזה',
          'תשלום חודשי',
          'תמלוג רטרואקטיבי',
          'ליווי והדרכה לשותפים',
        ]}
      />

      {/* ──── 12. FAQ ──── */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="כל מה שרציתם לדעת<br/>לפני שמצטרפים." />
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="כמה אני מרוויח?">
                <p>אחוז חודשי חוזר על כל לקוח פעיל שהבאתם, החל מ-15% ועד 25%, לפי כמות הלקוחות. המדרגות רטרואקטיביות, כך שמעבר מדרגה מעלה את האחוז על כל הלקוחות שלכם. סוכנויות במסלול White-Label מרוויחות מרווח סיטונאי של עד 45%.</p>
              </FAQItem>
              <FAQItem question="יש עלות הצטרפות או חוזה?">
                <p>אין. ההצטרפות חינם, בלי חוזה ובלי מינימום. אנחנו משלמים לכם רק כשאתם מביאים לקוח שמשלם, אז אין לכם שום סיכון.</p>
              </FAQItem>
              <FAQItem question="מה ההבדל בין המסלולים?">
                <p>שותף מפנה מפנה אלינו לקוח, ואנחנו מחייבים ותומכים, הוא מקבל תמלוג חודשי. סוכנות White-Label קונה בסיטונאי, מוכרת במותג שלה וקובעת את המחיר ללקוח. לקוח קיים יכול להיות שגריר ולקבל אחוז על חברים שהוא מביא.</p>
              </FAQItem>
              <FAQItem question="אני צריך למכור ולתמוך בעצמי?">
                <p>לא במסלול ההפניה. אתם מביאים את הקשר, ואנחנו סוגרים את העסקה, מחייבים ונותנים תמיכה. רק אם בחרתם במסלול White-Label אתם מחזיקים בקשר הלקוח ובחיוב.</p>
              </FAQItem>
              <FAQItem question="מתי ואיך אני מקבל תשלום?">
                <p>תשלום חודשי, כל עוד הלקוח פעיל. אפשר לקבל במזומן או, אם אתם לקוחות, כקרדיט שמקזז לכם את המנוי. יש סף תשלום מינימלי נמוך שמצטבר לחודש הבא אם לא הגעתם אליו.</p>
              </FAQItem>
              <FAQItem question="מה קורה עם ליווי ושירותים, לא רק תוכנה?">
                <p>אותו כלל: ליווי חודשי שוטף הוא הכנסה חוזרת, אז אתם מקבלים עליו תמלוג חודשי בדיוק כמו על תוכנה. פרויקט הקמה חד-פעמי מזכה בעמלת הפניה חד-פעמית.</p>
              </FAQItem>
            </ScrollTextHighlight>
          </div>
        </div>
      </section>

      {/* ──── 13. FINAL CTA ──── */}
      <FinalCTA
        title="מוכנים להרוויח יחד איתנו?"
        subtitle="הצטרפות חינם, בלי חוזה. נראה לכם בדיוק כמה תוכלו להרוויח ואיך מתחילים."
        ctaHref={wa}
        ctaText="בואו נדבר על שותפות"
      />
    </div>
  );
}

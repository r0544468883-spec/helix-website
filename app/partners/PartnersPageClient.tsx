'use client';

import { SITE } from '@/lib/site';
import { EmojiIcon } from '@/lib/emoji-icon';
import ServiceHero from '../components/service/ServiceHero';
import PainSection from '../components/service/PainSection';
import ForWhoSection from '../components/service/ForWhoSection';
import TrustBar from '../components/service/TrustBar';
import FinalCTA from '../components/service/FinalCTA';
import ScrollReveal from '../components/ScrollReveal';
import ScrollTextHighlight from '../components/ScrollTextHighlight';
import FAQItem from '../components/FAQItem';
import PartnerApplyForm from './PartnerApplyForm';

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  'שלום, ראיתי את תכנית השותפים של HELIX ורציתי לשמוע איך מצטרפים ומרוויחים',
)}`;

// שלושת מסלולי השותפות (flip-cards: אייקון + כותרת בחזית, הפרטים בגב)
const tracks = [
  {
    icon: '🤝',
    title: 'שגריר',
    desc: 'כבר לקוח ואוהב? כל חבר שתחבר אלינו מזכה אותך באחוז חודשי, כקרדיט שמקזז לך את המנוי או כמזומן. הוא מקבל חודש ראשון חינם.',
  },
  {
    icon: '🎯',
    title: 'שותף מפנה',
    desc: 'יש לך לקוח שצריך את HELIX? מפנה אלינו, ואנחנו סוגרים, מחייבים ותומכים. אתה מקבל עד 25% כל חודש, כל עוד הוא פעיל, בלי לגעת בתפעול.',
  },
  {
    icon: '🏷',
    title: 'White-Label',
    desc: 'רוצה למכור את הכלים כמותג שלך? קונה בסיטונאי, קובע ללקוח מחיר משלך, וגוזר את ההפרש. הלקוח רואה אותך, לא אותנו.',
  },
];

// מדרגות התמלוג (הכנסה חוזרת), flip-cards
const royaltyTiers = [
  { icon: '⭐', title: 'Bronze', desc: '15% על כל לקוח, כשיש לך בין לקוח אחד לחמישה פעילים.' },
  { icon: '🏆', title: 'Silver', desc: '20% על כל לקוח, כשיש לך בין 6 ל-15 לקוחות פעילים.' },
  { icon: '👑', title: 'Gold', desc: '25% על כל לקוח, מ-16 לקוחות פעילים ומעלה. זו התקרה.' },
];

// מדרגות White-Label (מרווח סיטונאי), flip-cards
const wlTiers = [
  { icon: '🏷', title: 'Registered', desc: '40% מרווח, עד 5 לקוחות פעילים במותג שלך.' },
  { icon: '💠', title: 'Gold', desc: '43% מרווח, בין 6 ל-20 לקוחות פעילים.' },
  { icon: '👑', title: 'Platinum', desc: '45% מרווח, מ-21 לקוחות ומעלה.' },
];

const steps = [
  { icon: '📝', title: 'מצטרפים', desc: 'בלי עלות ובלי חוזה. טופס קצר, ואתה בפנים.' },
  { icon: '🔗', title: 'מקבלים לינק', desc: 'לינק אישי וקוד מעקב. כל לקוח שמגיע דרכך משויך אליך אוטומטית.' },
  { icon: '🚀', title: 'מפנים', desc: 'לתוכנה או לליווי. הלקוח מקבל חודש ראשון חינם, אתה מקבל קרדיט על ההפניה.' },
  { icon: '💰', title: 'מקבלים תמלוג', desc: 'אחוז מכל לקוח פעיל, כל חודש. מביא יותר, האחוז על כולם עולה.' },
];

// מה HELIX נותנת לשותף, flip-cards, 3+3
const provides = [
  { icon: '🎓', title: 'הדרכה והסמכה', desc: 'אנחנו מלמדים אותך את המוצרים, המחירים, ואיך למכור. יוצא מוכן, לא צריך להיות מומחה AI.' },
  { icon: '📚', title: 'חומרי מכירה מוכנים', desc: 'מצגות, דפי מוצר, מקרי הצלחה ותבניות פנייה. לא מתחילים מדף לבן.' },
  { icon: '🎧', title: 'התמיכה שלנו מאחוריך', desc: 'צוות HELIX סוגר, מחייב ותומך בלקוח. אתה לא לבד מול השאלות הקשות.' },
  { icon: '🧲', title: 'אנחנו מפנים אליך לקוחות', desc: 'שותפים פעילים מקבלים מאיתנו לידים מתאימים לפי אזור ותחום ההתמחות.' },
  { icon: '📊', title: 'דשבורד שקוף', desc: 'רואה בכל רגע כמה לקוחות פעילים יש לך, כמה תרוויח החודש, ומתי משלמים.' },
  { icon: '🏆', title: 'תג, קהילה וגישה מוקדמת', desc: 'שותף מוסמך מקבל תג, מקום בדף השותפים, וגישה מוקדמת למוצרים חדשים.' },
];

// flip-card grid זהה לשאר האתר. three=3 עמודות (מונע עמודה רביעית ריקה ב-3/6 קלפים)
function FlipGrid({ items, three }: { items: { icon: string; title: string; desc: string }[]; three?: boolean }) {
  return (
    <ScrollReveal direction="up" stagger staggerDelay={0.08}>
      <div className={`sp-services-grid${three ? ' sp-grid-3' : ''}`}>
        {items.map((it) => (
          <div key={it.title} className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <span className="flip-card-icon"><EmojiIcon e={it.icon} /></span>
                <h3>{it.title}</h3>
              </div>
              <div className="flip-card-back">
                <span className="flip-card-icon"><EmojiIcon e={it.icon} /></span>
                <h3>{it.title}</h3>
                <p>{it.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}

export default function PartnersPageClient() {
  return (
    <div className="service-page">
      {/* ──── 1. HERO ──── */}
      <ServiceHero
        eyebrow="תכנית שותפים · הצטרפו למחזור המייסד"
        title="כל לקוח שתביא,<br/>משלם לך כל חודש."
        subtitle="יש לך לקוחות שצריכים כלי AI בעברית או ליווי מקצועי? חבר אותם לילדים הטובים של עולם הדיגיטל, וקבל אחוז חוזר כל חודש, כל עוד הם לקוחות. ככל שתביא יותר, האחוז על כולם עולה."
        price="עד 25% כל חודש"
        priceNote="או עד 45% מרווח כסוכנות White-Label. בלי עלות הצטרפות, בלי חוזה."
        highlights={['אחוז חוזר על כל לקוח', 'האחוז עולה עם הכמות', 'מותג לבן לסוכנויות']}
        highlightsLabel="מה מקבלים"
        ctaHref={wa}
        ctaText="בואו נדבר"
      />

      {/* ──── 2. STATS GRID ──── */}
      <section className="sp2-section" style={{ paddingTop: '24px' }}>
        <div className="container">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:px-8">
            {[
              { icon: '📈', value: '25', unit: '%', desc: 'כל חודש על כל לקוח, והאחוז עולה עם הכמות', d: 0 },
              { icon: '🏷', value: '45', unit: '%', desc: 'מרווח לסוכנות שמוכרת את הכלים כמותג שלה', d: 0.15 },
              { icon: '🎁', value: '₪0', unit: '', desc: 'להצטרף. אתה מרוויח רק כשאנחנו מרוויחים', d: 0.3 },
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

      {/* ──── 3. NARRATIVE, הכלל האחד ──── */}
      <section className="sp-narrative">
        <div className="container">
          <ScrollTextHighlight className="sp-narrative-block" dimOpacity={0.12} blurAmount={1.5}>
            <h2>כלל אחד, בלי אותיות קטנות.</h2>
            <p>
              רוב תכניות השותפים מסבכות אותך עם טבלה אחרת לכל מוצר. אצלנו זה פשוט: לקוח שמשלם כל חודש, אתה מקבל אחוז כל חודש.
              עבודה חד-פעמית, עמלה חד-פעמית. זה כל מה שצריך לזכור.
            </p>
            <p>
              אתה מביא את הקשר. הילדים הטובים של עולם הדיגיטל עושים את כל השאר: סוגרים, מטמיעים ותומכים.
            </p>
            <p className="sp-narrative-highlight">
              מנוי תוכנה או ליווי חודשי, אתה גוזר קופון כל חודש. פרויקט הקמה, עמלה פעם אחת. זהו.
            </p>
          </ScrollTextHighlight>
        </div>
      </section>

      {/* ──── 4. שלושת המסלולים (flip) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">שלוש דרכים לעבוד איתנו</h2>
            <p className="sp2-lead">אתה בוחר כמה להיות מעורב. עבור עם העכבר על כל כרטיס כדי לראות מה הוא כולל.</p>
          </ScrollReveal>
          <FlipGrid items={tracks} three />
        </div>
      </section>

      {/* ──── 5. מדרגות התמלוג (flip) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מדרגות שעולות עם הכמות</h2>
            <p className="sp2-lead">
              המדרגות רטרואקטיביות. ברגע שעלית מדרגה, האחוז החדש חל על כל הלקוחות שלך, גם הישנים. מדרגה אחת לכל המוצרים ולליווי.
            </p>
          </ScrollReveal>
          <FlipGrid items={royaltyTiers} three />

          {/* דוגמת רווח */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-8 rounded-xl border border-emerald-900/30 bg-[#0d1512] p-6 text-center" style={{ maxWidth: 720, margin: '32px auto 0' }}>
              <p className="text-gray-300 leading-relaxed">
                <span className="text-emerald-400 font-bold">דוגמה:</span> יועץ עם 8 לקוחות ליווי במדרגת Silver מרוויח
                <span className="text-white font-bold"> כ-2,000 ₪ בחודש</span>. עבר 16 לקוחות ועלה ל-Gold, וכל 16 קפצו ל-25%, כלומר
                <span className="text-white font-bold"> כ-5,000 ₪ בחודש</span>. זה הכוח של המדרגה הרטרואקטיבית.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── 6. מדרגות White-Label (flip) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">White-Label, הכלים במותג שלך</h2>
            <p className="sp2-lead">
              קונה בסיטונאי, מתמחר ללקוח כמה שבא לך, וגוזר את ההפרש. ככל שתגדיל נפח, המחיר הסיטונאי יורד והמרווח שלך עולה.
            </p>
          </ScrollReveal>
          <FlipGrid items={wlTiers} three />
        </div>
      </section>

      {/* ──── 7. איך זה עובד (flip, 4) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד, בארבעה צעדים</h2>
            <p className="sp2-lead">פשוט כמו שזה נשמע.</p>
          </ScrollReveal>
          <FlipGrid items={steps} />
        </div>
      </section>

      {/* ──── 8. מה אתה מקבל מאיתנו (flip, 3+3) ──── */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אתה מקבל מאיתנו</h2>
            <p className="sp2-lead">לא זורקים אותך למים. נכנס לצוות עם כל מה שצריך כדי להצליח.</p>
          </ScrollReveal>
          <FlipGrid items={provides} three />
        </div>
      </section>

      {/* ──── 9. PAIN, למה שותפים נשארים ──── */}
      <PainSection
        title="למה שותפים נשארים איתנו"
        cards={[
          {
            title: 'סוויטה שלמה, לא כלי בודד',
            text: 'תוכנות שיווק, מכירות, SEO ודשבורדים, וגם ליווי אנושי. יש לך מה להציע לכל לקוח, ותמלוג על כל אחד מהם.',
          },
          {
            title: 'אחוז חוזר, לא עמלה שנעלמת',
            text: 'לקוח טוב שמשלם כל חודש מכניס לך כסף כל חודש. התיק שלך גדל, וההכנסה גדלה איתו.',
          },
          {
            title: 'עברית, וואטסאפ, מחיר שקל להצדיק',
            text: 'כלים שנבנו לשוק הישראלי במחיר שקל למכור. קל לך לסגור, וקשה ללקוח לעזוב.',
          },
          {
            title: 'אנחנו עושים את העבודה הקשה',
            text: 'במסלול ההפניה אנחנו סוגרים, מחייבים ותומכים. אתה מביא את הקשר, ואנחנו את השאר.',
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
          'מי שמחפש כסף מהיר בלי קשר אמיתי ללקוחות',
          'מי שלא מוכן ללוות את הלקוח לרגע שבו הכלי מתחיל לעבוד',
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
          <div className="section-header">
            <span className="section-tag">שאלות נפוצות</span>
            <h2 className="section-title">כל מה שרציתם לדעת לפני שמצטרפים</h2>
          </div>
          <div className="faq-with-image">
            <ScrollTextHighlight className="faq-list" dimOpacity={0.2} blurAmount={1}>
              <FAQItem question="כמה אני מרוויח?">
                <p>אחוז חוזר על כל לקוח פעיל שהבאת, החל מ-15% ועד 25%, לפי כמות הלקוחות. המדרגות רטרואקטיביות, כך שמעבר מדרגה מעלה את האחוז על כל הלקוחות שלך. סוכנות במסלול White-Label מרוויחה מרווח סיטונאי של עד 45%.</p>
              </FAQItem>
              <FAQItem question="יש עלות הצטרפות או חוזה?">
                <p>אין. ההצטרפות חינם, בלי חוזה ובלי מינימום. אנחנו משלמים לך רק כשאתה מביא לקוח שמשלם, אז אין לך שום סיכון.</p>
              </FAQItem>
              <FAQItem question="מה ההבדל בין המסלולים?">
                <p>שותף מפנה מפנה אלינו לקוח, ואנחנו מחייבים ותומכים, והוא מקבל תמלוג חודשי. סוכנות White-Label קונה בסיטונאי, מוכרת במותג שלה וקובעת את המחיר ללקוח. לקוח קיים יכול להיות שגריר ולקבל אחוז על חברים שהוא מביא.</p>
              </FAQItem>
              <FAQItem question="אני צריך למכור ולתמוך בעצמי?">
                <p>לא במסלול ההפניה. אתה מביא את הקשר, ואנחנו סוגרים את העסקה, מחייבים ונותנים תמיכה. רק אם בחרת במסלול White-Label אתה מחזיק בקשר הלקוח ובחיוב.</p>
              </FAQItem>
              <FAQItem question="מתי ואיך אני מקבל תשלום?">
                <p>תשלום חודשי, כל עוד הלקוח פעיל. אפשר לקבל במזומן, ואם אתה לקוח, גם כקרדיט שמקזז לך את המנוי. יש סף תשלום מינימלי נמוך שמצטבר לחודש הבא אם לא הגעת אליו.</p>
              </FAQItem>
              <FAQItem question="ומה עם ליווי ושירותים, לא רק תוכנה?">
                <p>אותו כלל: ליווי חודשי שוטף הוא הכנסה חוזרת, אז אתה מקבל עליו תמלוג חודשי בדיוק כמו על תוכנה. פרויקט הקמה חד-פעמי מזכה בעמלת הפניה חד-פעמית.</p>
              </FAQItem>
            </ScrollTextHighlight>
          </div>
        </div>
      </section>

      {/* ──── 13. APPLY FORM ──── */}
      <PartnerApplyForm />

      {/* ──── 14. FINAL CTA ──── */}
      <FinalCTA
        title="בוא נרוויח יחד."
        subtitle="הצטרפות חינם, בלי חוזה. נראה לך כמה אתה יכול להרוויח ואיך מתחילים, בשיחה של רבע שעה."
        ctaHref={wa}
        ctaText="בואו נדבר בוואטסאפ"
      />
    </div>
  );
}

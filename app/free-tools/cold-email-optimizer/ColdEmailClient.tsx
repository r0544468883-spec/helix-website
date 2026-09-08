'use client';

import { Gauge, Wrench, PenLine, Mail, Sparkles, SearchCheck, Bot } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import FAQItem from '../../components/FAQItem';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import SamplePreview from '../_shared/SamplePreview';
import ColdEmailToolClient from './ColdEmailToolClient';

const HOW = [
  { n: '01', title: 'מדביקים את המייל', text: 'את המייל הקר שכתבתם, כולל שורת הנושא. מוסיפים למי הוא נשלח ומה המטרה. כמה דקות.' },
  { n: '02', title: 'הצוות מדרג וכותב מחדש', text: 'היוצר מדרג את המייל על חמישה מדדים, כותב אותו מחדש ומציע שורות נושא. המבקר בודק כל תיקון.' },
  { n: '03', title: 'מקבלים דוח מלא', text: 'ציון לפי מדד, תיקונים קונקרטיים, מייל כתוב מחדש, שורות נושא חזקות ודגלים אדומים של ספאם.' },
];

const WHAT = [
  { icon: Gauge, title: 'ציון לפי 5 מדדים', items: ['נושא', 'פתיח', 'רלוונטיות ופרסונליזציה', 'CTA · אורך'] },
  { icon: Wrench, title: 'תיקונים קונקרטיים', items: ['מה שבור בדיוק', 'פעולה ספציפית', 'לא עצה כללית', 'מבוסס על המייל'] },
  { icon: PenLine, title: 'מייל כתוב מחדש', items: ['פתיח שמחבר', 'ערך ברור', 'CTA אחד קטן', 'דוגרי, בלי קלישאות'] },
  { icon: Mail, title: 'שורות נושא', items: ['6 עד 8 חלופות', 'ספציפיות', 'בלי מילות ספאם', 'שגורמות לפתוח'] },
];

const TEAM = [
  { icon: Wrench, title: 'היוצר', text: 'מדרג את המייל על חמישה מדדים, נותן תיקונים קונקרטיים, כותב את המייל מחדש ומציע שורות נושא חזקות יותר.' },
  { icon: SearchCheck, title: 'המבקר', text: 'בודק כל תיקון שיהיה קונקרטי ולא גנרי, מוודא שהכתיבה מחדש דוגרי בלי קלישאות של AI, ושאין עובדות מומצאות על הנמען.' },
  { icon: Bot, title: 'צ׳יף', text: 'מתזמר את הלולאה בין היוצר למבקר, ומרכיב את הדוח הסופי בעברית טבעית, כן ומדויק, לא מחמיא.' },
];

export default function ColdEmailClient({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <>
      <section className="geo-hero">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" /><div className="geo-orb geo-orb-2" /><div className="geo-orb geo-orb-3" />
        </div>
        <div className="container">
          <span className="geo-hero-badge"><span className="dot" /> בדיקת מייל קר בחינם</span>
          <h1 className="geo-hero-title">המייל הקר שלכם,<br />עם ציון ותיקונים</h1>
          <p className="geo-hero-sub">
            מדביקים את המייל הקר שכתבתם, וצוות סוכנים מדרג אותו על חמישה מדדים, נותן <strong>תיקונים קונקרטיים,
            מייל כתוב מחדש ושורות נושא חזקות יותר</strong>, ומסמן דגלים אדומים של ספאם. בכנות, מה עובד ומה שובר לכם
            את שיעור התגובה. בלי הרשמה.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
            <a href="#cold-email-tool" className="btn btn-primary"><Sparkles size={16} /> התחילו את הבדיקה, בחינם</a>
          </div>
        </div>
      </section>

      <ColdEmailToolClient id="cold-email-tool" />

      {/* HOW IT WORKS */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד</h2>
            <p className="sp2-lead">שלושה שלבים, מהדבקת המייל ועד דוח מלא.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid sp-grid-3">
              {HOW.map((s) => (
                <div key={s.n} className="flip-card"><div className="flip-card-inner">
                  <div className="flip-card-front"><span className="flip-card-num">{s.n}</span><h3>{s.title}</h3></div>
                  <div className="flip-card-back"><span className="flip-card-num">{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></div>
                </div></div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה מקבלים</h2>
            <p className="sp2-lead">בדיקה מלאה של המייל הקר, מדד אחרי מדד. רחפו על כרטיס.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {WHAT.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="flip-card"><div className="flip-card-inner">
                    <div className="flip-card-front"><span className="flip-card-icon"><Icon size={26} /></span><h3>{c.title}</h3></div>
                    <div className="flip-card-back"><span className="flip-card-icon"><Icon size={20} /></span><h3>{c.title}</h3><p>{c.items.join(' · ')}</p></div>
                  </div></div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SAMPLE OUTPUT */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">הצצה לפלט</h2>
            <p className="sp2-lead">ככה נראה הדוח שתקבלו. זו רק דוגמה.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <SamplePreview
              score={58}
              scoreLabel="מייל בינוני, יש מה לתקן"
              dims={[
                { label: 'נושא', value: 44 },
                { label: 'פתיח', value: 51 },
                { label: 'רלוונטיות ופרסונליזציה', value: 62 },
                { label: 'CTA', value: 55 },
                { label: 'אורך וקריאוּת', value: 78 },
              ]}
              highlightBadge="שורת הנושא המנצחת"
              highlightTitle="שאלה קטנה על התהליך שלכם בתפעול"
              highlightBody="השורה הקיימת כללית מדי ונשמעת כמו טמפלייט. שורה שמזכירה כאב ספציפי מכפילה את שיעור הפתיחה."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* AGENT TEAM */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">צוות הסוכנים שמאחורי הבדיקה</h2>
            <p className="sp2-lead">לא מודל אחד שיורה תשובה, אלא לולאה של היוצר והמבקר, כדי שהפלט יהיה מדויק ולא מחמיא.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid sp-grid-3">
              {TEAM.map((g) => {
                const Icon = g.icon;
                return (
                  <div key={g.title} className="flip-card"><div className="flip-card-inner">
                    <div className="flip-card-front"><span className="flip-card-icon"><Icon size={26} /></span><h3>{g.title}</h3></div>
                    <div className="flip-card-back"><span className="flip-card-icon"><Icon size={20} /></span><h3>{g.title}</h3><p>{g.text}</p></div>
                  </div></div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <TrustBar items={['בלי הרשמה', '3 בדיקות חינם', 'מבקר שבודק כל תיקון', 'עברית דוגרי, בלי קלישאות של AI']} />

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="container">
          <ScrollReveal direction="up"><h2 className="sp2-section-title" style={{ textAlign: 'center' }}>שאלות נפוצות</h2></ScrollReveal>
          <div className="faq-list" style={{ maxWidth: 760, margin: '24px auto 0' }}>
            {faqs.map((f) => <FAQItem key={f.q} question={f.q}><p>{f.a}</p></FAQItem>)}
          </div>
        </div>
      </section>

      <FinalCTA
        title="רוצים לדעת למי בכלל לשלוח?"
        subtitle="בדיקת המייל הקר משפרת את מה שכתבתם. מודיעין GTM אומר לכם את מי לתקוף, עם אילו טריגרים ומאיזו זווית, על אותו קמפיין."
        ctaHref="/free-tools/gtm-intelligence"
        ctaText="למודיעין GTM ←"
      />
    </>
  );
}

'use client';

import { Users, Filter, MessageSquare, Phone, Sparkles, Wrench, SearchCheck, Bot } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import FAQItem from '../../components/FAQItem';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import SamplePreview from '../_shared/SamplePreview';
import SalesToolClient from './SalesToolClient';

const HOW = [
  { n: '01', title: 'עונים על כמה שאלות', text: 'מה אתם מוכרים, למי, גודל עסקה, אילו ערוצים ואיזו הוכחה יש לכם. כמה דקות.' },
  { n: '02', title: 'הצוות בונה את הפלייבוק', text: 'היוצר בונה ICP, משפך, ANUM, ערוצים, הודעות ותסריט שיחה. המבקר בודק כל טענה אחריו.' },
  { n: '03', title: 'מקבלים פלייבוק מוכן', text: 'ציון מוכנות מכירה, משפך עם טריגרים, רצף לינקדאין, מייל, התנגדויות ותסריט שיחה טלפונית.' },
];

const WHAT = [
  { icon: Users, title: 'ICP ומפת החלטות', items: ['הלקוח האידיאלי', 'הכאב שקונה', 'מי מחליט וחוסם', 'השמפיון הפנימי'] },
  { icon: Filter, title: 'משפך ו-ANUM', items: ['5 שלבים', 'טריגר לכל מעבר', 'שער סינון', 'מתמטיקת פייפליין'] },
  { icon: MessageSquare, title: 'הודעות פנייה', items: ['רצף לינקדאין', 'לא פיץ׳ ראשון', 'גרסת מייל', 'טיפול בהתנגדויות'] },
  { icon: Phone, title: 'תסריט שיחה', items: ['פתיח ורשות', 'שאלות גילוי', 'ANUM מובנה', 'צעד הבא ברור'] },
];

const TEAM = [
  { icon: Wrench, title: 'היוצר', text: 'בונה את הפלייבוק המלא: ICP, משפך, ANUM, ערוצים, הודעות פנייה ותסריט שיחה, לפי מתודולוגיה אמיתית.' },
  { icon: SearchCheck, title: 'המבקר', text: 'בודק כל טענה: מספרי הפייפליין מסומנים כהנחה, הלינקדאין בונה קשר לפני שמבקש, הערת §30א כנה, בלי הזיות.' },
  { icon: Bot, title: 'צ׳יף', text: 'מתזמר את הלולאה בין היוצר למבקר, ומרכיב את הפלייבוק הסופי בעברית טבעית ומדוברת, מוכן לשימוש, לא תרגום מאנגלית.' },
];

export default function SalesClient({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <>
      <section className="geo-hero">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" /><div className="geo-orb geo-orb-1" /><div className="geo-orb geo-orb-2" /><div className="geo-orb geo-orb-3" />
        </div>
        <div className="container">
          <span className="geo-hero-badge"><span className="dot" /> בדיקת מכירות בחינם</span>
          <h1 className="geo-hero-title">משפך מכירות מוכן,<br />ותסריט שיחה בכיס</h1>
          <p className="geo-hero-sub">
            עונים על כמה שאלות על העסק, וצוות סוכנים בונה פלייבוק מכירות מלא: ICP, משפך עם טריגרים, שער ANUM,
            הודעות פנייה בלינקדאין ובמייל, טיפול בהתנגדויות, ו<strong>תסריט שיחה טלפונית מותאם</strong>. בלי הרשמה.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
            <a href="#sales-tool" className="btn btn-primary"><Sparkles size={16} /> התחילו את הבדיקה, בחינם</a>
          </div>
        </div>
      </section>

      <SalesToolClient id="sales-tool" />

      {/* HOW IT WORKS */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד</h2>
            <p className="sp2-lead">שלושה שלבים, מהשאלון ועד פלייבוק מכירות מלא.</p>
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
            <h2 className="sp2-section-title">מה מקבלים בפלייבוק</h2>
            <p className="sp2-lead">פלייבוק מכירות שלם, מ-ICP ועד תסריט השיחה. רחפו על כרטיס.</p>
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
            <p className="sp2-lead">ככה נראה הפלייבוק שתקבלו. זו רק דוגמה.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <SamplePreview
              score={57}
              scoreLabel="מוכנות מכירה בינונית"
              dims={[
                { label: 'בהירות ה-ICP', value: 71 },
                { label: 'בשלות המשפך', value: 44 },
                { label: 'התאמת הערוצים', value: 62 },
                { label: 'חוזק ההוכחה', value: 50 },
              ]}
              highlightBadge="ICP והכאב"
              highlightTitle="סוכנויות ביטוח עצמאיות, 15 עד 80 עובדים"
              highlightBody="הכאב: הוואטסאפ הפך למרכז העצבים ולבלאגן, חידושים והצעות נופלים בין הכיסאות."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* AGENT TEAM */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">צוות הסוכנים שמאחורי הפלייבוק</h2>
            <p className="sp2-lead">היוצר בונה, המבקר בודק כל טענה. ככה הפלייבוק יוצא מדויק ומוכן לשימוש.</p>
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

      <TrustBar items={['בלי הרשמה', '2 פלייבוקים חינם', 'רצף לינקדאין rapport-first', 'הערת §30א כנה, בלי סיכון']} />

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
        title="רוצים קודם לדעת מה מבדל אתכם?"
        subtitle="כלי הבידול אומר לכם איפה היתרון האמיתי שלכם, וכלי המכירות בונה מזה את מנוע המכירות. הרבה עסקים מריצים קודם את הבידול."
        ctaHref="/free-tools/differentiation"
        ctaText="לכלי הבידול ←"
      />
    </>
  );
}

'use client';

import { Compass, Layers, ShieldCheck, Target, Sparkles, Wrench, SearchCheck, Bot } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import FAQItem from '../../components/FAQItem';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import SamplePreview from '../_shared/SamplePreview';
import DifferentiationToolClient from './DifferentiationToolClient';

const HOW = [
  { n: '01', title: 'עונים על כמה שאלות', text: 'מה אתם מוכרים, למי, מי המתחרים ומה היתרונות שאתם חושבים שיש לכם. שאלה אחת בכל פעם, כמה דקות.' },
  { n: '02', title: 'הצוות מריץ את המודלים', text: 'היוצר מריץ פורטר, קבוצות אסטרטגיה, VRINO, SWOT ואוקיינוס כחול. המבקר בודק כל טענה אחריו.' },
  { n: '03', title: 'מקבלים דוח בידול', text: 'ציון בהירות בידול, מפת יתרונות, הנכס היחיד שעובר VRINO, ומשפט אסטרטגי אחד עם מהלכים.' },
];

const WHAT = [
  { icon: Layers, title: 'קבוצות אסטרטגיה', items: ['שני צירים שמפרידים', 'איפה אתם על המפה', 'האשכול הצפוף', 'המרחב הפנוי'] },
  { icon: ShieldCheck, title: 'VRINO, מבחן הכנות', items: ['כל יתרון עובר סינון', 'מה תנאי סף', 'מה באמת נדיר', 'הנכס שעובר'] },
  { icon: Compass, title: 'SWOT מנוף ובטן רכה', items: ['חוזקה פוגשת הזדמנות', 'חולשה פוגשת איום', 'לא רשימה שטוחה', 'איפה לדחוף'] },
  { icon: Target, title: 'משפט אסטרטגי', items: ['מטרה', 'סקופ', 'יתרון לא-מחיק', 'ו-2-3 מהלכים'] },
];

const TEAM = [
  { icon: Wrench, title: 'היוצר', text: 'מריץ את מחסנית המודלים על העסק שלכם: פורטר, קבוצות אסטרטגיה, VRINO, SWOT ואוקיינוס כחול.' },
  { icon: SearchCheck, title: 'המבקר', text: 'בודק כל טענה, מפיל יתרונות שהם בעצם תנאי סף של הקטגוריה, ומסמן כל מתחרה שלא אומת. מונע הזיות.' },
  { icon: Bot, title: 'צ׳יף', text: 'מתזמר את הלולאה בין היוצר למבקר, ומרכיב את הניתוח הסופי בעברית טבעית, כן ומדויק, לא מחמיא.' },
];

export default function DifferentiationClient({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <>
      <section className="geo-hero">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" /><div className="geo-orb geo-orb-2" /><div className="geo-orb geo-orb-3" />
        </div>
        <div className="container">
          <span className="geo-hero-badge"><span className="dot" /> בדיקת בידול עסקי בחינם</span>
          <h1 className="geo-hero-title">איפה היתרון האמיתי<br />שלכם מסתתר?</h1>
          <p className="geo-hero-sub">
            עונים על כמה שאלות על העסק, וצוות סוכנים מריץ ניתוח בידול אסטרטגי מלא ברמת MBA:
            קבוצות אסטרטגיה, VRINO, SWOT ואוקיינוס כחול. בסוף מקבלים <strong>ציון בהירות בידול ומשפט אסטרטגי אחד עם מהלכים</strong>,
            ובכנות, מה באמת מבדל אתכם ומה רק נשמע ככה. בלי הרשמה.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
            <a href="#diff-tool" className="btn btn-primary"><Sparkles size={16} /> התחילו את הבדיקה, בחינם</a>
          </div>
        </div>
      </section>

      <DifferentiationToolClient id="diff-tool" />

      {/* HOW IT WORKS */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד</h2>
            <p className="sp2-lead">שלושה שלבים, מהשאלון ועד דוח בידול מלא.</p>
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
            <h2 className="sp2-section-title">מה מקבלים בדוח</h2>
            <p className="sp2-lead">ניתוח אסטרטגי מלא, מודל אחרי מודל. רחפו על כרטיס.</p>
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
              score={62}
              scoreLabel="בהירות בידול בינונית-גבוהה"
              dims={[
                { label: 'חוזק הנכס שעובר', value: 78 },
                { label: 'מיצוב מול האשכול', value: 54 },
                { label: 'גודל המרחב הפנוי', value: 66 },
                { label: 'בהירות המסר', value: 49 },
              ]}
              highlightBadge="המשפט האסטרטגי"
              highlightTitle="AI בפרודקשן ברמת אמינות פיננסית, לעסקים מפוקחים"
              highlightBody="הבידול לא בצוות הסניורי, זה תנאי סף. הוא באמינות ברמת פינטק, מגובה בהוכחה אמיתית."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* AGENT TEAM */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">צוות הסוכנים שמאחורי הניתוח</h2>
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

      <TrustBar items={['בלי הרשמה', '2 ניתוחים חינם', 'מבקר שבודק כל טענה', 'עברית דוגרי, בלי קלישאות של AI']} />

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
        title="רוצים גם משפך מכירות מוכן?"
        subtitle="כלי הבידול אומר לכם מה מבדל אתכם. כלי המכירות בונה מזה ICP, משפך, הודעות פנייה ותסריט שיחה, על אותו עסק."
        ctaHref="/free-tools/sales"
        ctaText="לכלי המכירות ←"
      />
    </>
  );
}

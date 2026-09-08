'use client';

import { ListFilter, CheckCheck, Target, Flame, Sparkles, Wrench, SearchCheck, Bot } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import FAQItem from '../../components/FAQItem';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import SamplePreview from '../_shared/SamplePreview';
import IcpListToolClient from './IcpListToolClient';

const HOW = [
  { n: '01', title: 'מגדירים את ה-ICP', text: 'מי הלקוח האידיאלי שלכם: תחום, גודל, תפקיד וכאב. ומי לפסול מיד. כמה שורות, בשפה שלכם.' },
  { n: '02', title: 'מדביקים את הרשימה', text: 'ליד אחד בכל שורה. שם, חברה, תפקיד. עד 40 שורות. היוצר מסווג כל אחד, המבקר בודק שאף ליד לא נפל.' },
  { n: '03', title: 'מקבלים רשימה מסוננת', text: 'כל ליד מסומן מתאים, לבדיקה או לא מתאים, עם סיבה לכל שורה, ורשימת ההמלצות החמות להתחיל מהן.' },
];

const WHAT = [
  { icon: ListFilter, title: 'סיווג לכל ליד', items: ['מתאים', 'לבדיקה נוספת', 'לא מתאים', 'שום שורה לא נופלת'] },
  { icon: CheckCheck, title: 'סיבה לכל שורה', items: ['למה סווג ככה', 'מול ה-ICP שלכם', 'קונקרטי, לא כללי', 'בלי הזיות'] },
  { icon: Target, title: 'ריכוז התאמות', items: ['כמה מתאימים', 'כמה לבדיקה', 'כמה לפסול', 'ציון סינון כולל'] },
  { icon: Flame, title: 'המלצות חמות', items: ['הלידים לפתוח בהם', 'לפי חוזק ההתאמה', 'שמות מוכנים', 'מאיפה מתחילים'] },
];

const TEAM = [
  { icon: Wrench, title: 'היוצר', text: 'קורא את ה-ICP שלכם ועובר על כל שורה ברשימה, מסווג אותה למתאים, לבדיקה או לא מתאים, ונותן סיבה קצרה.' },
  { icon: SearchCheck, title: 'המבקר', text: 'בודק שאף ליד לא הושמט בשקט, שהחברה שלכם ומתחרים לא נספרים כהתאמה, ושכל סיבה קונקרטית. מונע הזיות.' },
  { icon: Bot, title: 'צ׳יף', text: 'מתזמר את הלולאה בין היוצר למבקר, ומרכיב את הרשימה הסופית בעברית טבעית, כן ומדויק, לא מנפח.' },
];

export default function IcpListClient({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <>
      <section className="geo-hero">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" /><div className="geo-orb geo-orb-2" /><div className="geo-orb geo-orb-3" />
        </div>
        <div className="container">
          <span className="geo-hero-badge"><span className="dot" /> סינון רשימה מול ICP בחינם</span>
          <h1 className="geo-hero-title">הרשימה שלכם,<br />מסוננת מול ה-ICP</h1>
          <p className="geo-hero-sub">
            מגדירים מי הלקוח האידיאלי, מדביקים רשימת לידים, וצוות סוכנים ממיין כל שורה
            למתאים, לבדיקה או לא מתאים, <strong>עם סיבה אחת קונקרטית לכל ליד</strong>,
            ורשימת ההמלצות החמות להתחיל מהן. בלי הרשמה.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
            <a href="#icp-list-tool" className="btn btn-primary"><Sparkles size={16} /> סננו את הרשימה, בחינם</a>
          </div>
        </div>
      </section>

      <IcpListToolClient id="icp-list-tool" />

      {/* HOW IT WORKS */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד</h2>
            <p className="sp2-lead">שלושה שלבים, מה-ICP ועד רשימה מסוננת עם סיבה לכל שורה.</p>
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
            <p className="sp2-lead">רשימה מסוננת, ליד אחר ליד. רחפו על כרטיס.</p>
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
            <p className="sp2-lead">ככה נראה הסינון שתקבלו. זו רק דוגמה.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <SamplePreview
              score={64}
              scoreLabel="רשימה סבירה, יש ממה להתחיל"
              dims={[
                { label: 'אחוז התאמה', value: 58 },
                { label: 'איכות הרשימה', value: 71 },
                { label: 'ריכוז ICP', value: 62 },
                { label: 'כיסוי פרסונות', value: 49 },
              ]}
              highlightBadge="ההמלצות החמות"
              highlightTitle="9 מתוך 24 מתאימים"
              highlightBody="דנה כהן ממסעדת X, יוסי לוי מרשת Y, ורונית ברק מקבוצת Z. שלושתם על ה-ICP במדויק, כאן מתחילים."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* AGENT TEAM */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">צוות הסוכנים שמאחורי הסינון</h2>
            <p className="sp2-lead">לא מודל אחד שיורה תשובה, אלא לולאה של היוצר והמבקר, כדי שאף ליד לא ייפול ואף התאמה לא תנופח.</p>
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

      <TrustBar items={['בלי הרשמה', '3 סינונים חינם', 'מבקר שבודק כל שורה', 'עברית דוגרי, בלי קלישאות של AI']} />

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
        title="רוצים מודיעין על הלידים החמים?"
        subtitle="כלי הסינון אומר לכם מי מתאים. מודיעין GTM אוסף על הלידים החמים אותות, טריגרים והקשר, כדי שתדעו איך ומתי לפנות."
        ctaHref="/free-tools/gtm-intelligence"
        ctaText="למודיעין GTM ←"
      />
    </>
  );
}

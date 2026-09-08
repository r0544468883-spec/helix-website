'use client';

import { Target, Users, Building2, Swords, Sparkles, Wrench, SearchCheck, Bot } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import FAQItem from '../../components/FAQItem';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import SamplePreview from '../_shared/SamplePreview';
import GtmIntelligenceToolClient from './GtmIntelligenceToolClient';

const HOW = [
  { n: '01', title: 'עונים על כמה שאלות', text: 'מה אתם מוכרים, למי, מה השוק, גודל העסקה, ואם יש חברה או מתחרה שתרצו תחקיר עליו. שאלה אחת בכל פעם, כמה דקות.' },
  { n: '02', title: 'הצוות מריץ את המודיעין', text: 'היוצר בונה ICP, מודל TAM והכנסה, תדריך יעד ו-battlecard. המבקר בודק כל טענה ומספר אחריו.' },
  { n: '03', title: 'מקבלים דוח GTM', text: 'ציון מודיעין, ICP חד, גודל שוק בשקלים, תדריך על היעד ו-battlecard מול המתחרה, עם מהלכים.' },
];

const WHAT = [
  { icon: Target, title: 'ICP, למי למכור', items: ['פרופיל לקוח אידיאלי', 'פירמוגרפיה', 'פרסונות ועדת קנייה', 'מי לא מתאים'] },
  { icon: Users, title: 'TAM, גודל השוק', items: ['הגדרת השוק', 'מספר חברות', 'SAM ו-SOM בשקלים', 'הנחות החישוב'] },
  { icon: Building2, title: 'תדריך יעד', items: ['תחקיר חשבון', 'סימני קנייה', 'תזמון', 'תפקידים להגיע אליהם'] },
  { icon: Swords, title: 'Battlecard', items: ['חוזקות המתחרה', 'חולשות חשופות', 'שורת מיצוב', 'טיפול בהתנגדויות'] },
];

const TEAM = [
  { icon: Wrench, title: 'היוצר', text: 'בונה את המודיעין על העסק שלכם: ICP, מודל TAM והכנסה, תדריך יעד ו-battlecard מול המתחרה.' },
  { icon: SearchCheck, title: 'המבקר', text: 'בודק כל טענה, מסמן כל מתחרה, מספר או לקוח שלא אומת, ומפריד ראיה מהסקה. מונע הזיות.' },
  { icon: Bot, title: 'צ׳יף', text: 'מתזמר את הלולאה בין היוצר למבקר, ומרכיב את הדוח הסופי בעברית טבעית, כן ומדויק, לא מחמיא.' },
];

export default function GtmIntelligenceClient({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <>
      <section className="geo-hero">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" /><div className="geo-orb geo-orb-2" /><div className="geo-orb geo-orb-3" />
        </div>
        <div className="container">
          <span className="geo-hero-badge"><span className="dot" /> מודיעין GTM בחינם</span>
          <h1 className="geo-hero-title">למי למכור, ואיך לנצח<br />את מי שכבר שם</h1>
          <p className="geo-hero-sub">
            עונים על כמה שאלות על העסק, וצוות סוכנים בונה מודיעין GTM מלא:
            ICP חד, מודל TAM עם גודל שוק בשקלים, תדריך על חברת יעד ו-battlecard מול מתחרה.
            בסוף מקבלים <strong>דוח מודיעין שאומר למי לפנות, כמה גדול השוק, ואיך למצב מול מי שכבר שם</strong>,
            בכנות ובלי נתונים מומצאים. בלי הרשמה.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
            <a href="#gtm-tool" className="btn btn-primary"><Sparkles size={16} /> התחילו את הבדיקה, בחינם</a>
          </div>
        </div>
      </section>

      <GtmIntelligenceToolClient id="gtm-tool" />

      {/* HOW IT WORKS */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד</h2>
            <p className="sp2-lead">שלושה שלבים, מהשאלון ועד דוח מודיעין GTM מלא.</p>
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
            <p className="sp2-lead">מודיעין GTM מלא, חלק אחרי חלק. רחפו על כרטיס.</p>
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
              score={71}
              scoreLabel="מודיעין GTM חד, עם יעד ברור"
              dims={[
                { label: 'התאמת ICP', value: 82 },
                { label: 'בשלות השוק (TAM)', value: 64 },
                { label: 'חוזק היעד', value: 77 },
                { label: 'בהירות הפנייה', value: 58 },
              ]}
              highlightBadge="משפט הפנייה"
              highlightTitle="מסעדות רשת עם 3-15 סניפים, שסובלות מעודף שעות ומחלוקות שכר"
              highlightBody="השוק בר-ההשגה נאמד ב-₪4.2M בשנה. הפנייה מתחילה ממנהל התפעול, לא מהבעלים."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* AGENT TEAM */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">צוות הסוכנים שמאחורי המודיעין</h2>
            <p className="sp2-lead">לא מודל אחד שיורה תשובה, אלא לולאה של היוצר והמבקר, כדי שהפלט יהיה מדויק ולא ממציא נתונים.</p>
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
        title="יש לכם מודיעין, עכשיו לבנות את הפנייה"
        subtitle="כלי המודיעין אומר לכם למי לפנות ומול מי אתם עומדים. כלי המייל הקר בונה מזה את הודעת הפתיחה, על אותם לקוחות."
        ctaHref="/free-tools/cold-email-optimizer"
        ctaText="לכלי המייל הקר ←"
      />
    </>
  );
}

'use client';

import { Dna, PenLine, Mail, Sparkles, Languages, Zap } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import FAQItem from '../../components/FAQItem';
import ContentToolClient from './ContentToolClient';

const WHAT = [
  { icon: Dna, title: 'ניתוח DNA של פוסטים', items: ['פירוק ל-4 גנים', 'הנוסחה החוזרת', 'עקביות בין פוסטים', 'למה הקהל מגיב'] },
  { icon: PenLine, title: 'בניית פוסטים', items: ['פוסט מוכן לפרסום', 'לפי הנוסחה שלך', 'פתיחים חלופיים', 'לכל פלטפורמה'] },
  { icon: Mail, title: 'כתיבת מיילים', items: ['מבריף למייל שלם', 'נושא + גוף', 'טון לבחירתך', 'מוכן לשליחה'] },
  { icon: Languages, title: 'שכתוב מיילים', items: ['ברור, חם ואפקטיבי', 'שומר על הכוונה', 'עברית ואנגלית', 'בשניות'] },
];

const GET = [
  { n: '01', title: 'הנוסחה שמאחורי מה שעובד', text: 'מדביקים פוסטים שקיבלו תגובות — ומקבלים את התבנית החוזרת שאפשר לשכפל שוב ושוב.' },
  { n: '02', title: 'פוסט חדש בלחיצה', text: 'נושא אחד → פוסט טבעי, לא-רובוטי, בנוי על הנוסחה המנצחת שלך, מוכן לפרסום.' },
  { n: '03', title: 'מיילים בעברית ובאנגלית', text: 'כותב מבריף קצר, או משכתב מייל קיים שיהיה ברור וחד — בשתי השפות, בטון שתבחר.' },
];

export default function FreeToolsContentClient({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <>
      {/* HERO */}
      <section className="geo-hero">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" />
          <div className="geo-orb geo-orb-2" />
          <div className="geo-orb geo-orb-3" />
        </div>
        <div className="container">
          <span className="geo-hero-badge"><span className="dot" /> בדיקת תוכן בחינם</span>
          <h1 className="geo-hero-title">
            מה הופך את התוכן שלך<br />לתוכן שעובד?
          </h1>
          <p className="geo-hero-sub">
            נתחו פוסטים שהצליחו וגלו את הנוסחה שלהם — ואז בנו פוסטים חדשים וכתבו מיילים בעברית ובאנגלית,
            לפי מה שכבר עובד לכם. בלי הרשמה.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
            <a href="#content-tool" className="btn btn-primary"><Sparkles size={16} /> נסו עכשיו בחינם</a>
          </div>
        </div>
      </section>

      {/* THE TOOL */}
      <ContentToolClient id="content-tool" />

      {/* WHAT IT DOES */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה הכלי עושה</h2>
            <p className="sp2-lead">שלושה כלים במקום אחד — מהניתוח ועד התוכן המוכן. רחפו על כרטיס.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {WHAT.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="flip-card">
                    <div className="flip-card-inner">
                      <div className="flip-card-front">
                        <span className="flip-card-icon"><Icon size={26} /></span>
                        <h3>{c.title}</h3>
                      </div>
                      <div className="flip-card-back">
                        <span className="flip-card-icon"><Icon size={20} /></span>
                        <h3>{c.title}</h3>
                        <p>{c.items.join(' · ')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה מקבלים</h2>
            <p className="sp2-lead">תובנות ותוכן מוכן כבר מהשימוש הראשון. רחפו על כרטיס.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {GET.map((g) => (
                <div key={g.n} className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <span className="flip-card-icon">{g.n}</span>
                      <h3>{g.title}</h3>
                    </div>
                    <div className="flip-card-back">
                      <span className="flip-card-icon">{g.n}</span>
                      <h3>{g.title}</h3>
                      <p>{g.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why">
              <h2 className="sp2-section-title">להפסיק לנחש מה יעבוד</h2>
              <p className="sp2-lead">
                רוב היוצרים כותבים באינטואיציה ומתפללים. הכלי הזה לוקח את מה ש<strong>כבר עבד לכם</strong>,
                מפרק אותו לנוסחה, ומייצר ממנה תוכן חדש — פוסטים ומיילים — בשפה טבעית שלא מריחה AI.
                כך כל פיסת תוכן נבנית על מה שמוכח, לא על ניחוש.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">שאלות נפוצות</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <div className="geo-faq">
              {faqs.map((f) => (
                <FAQItem key={f.q} question={f.q}>
                  <p>{f.a}</p>
                </FAQItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="geo-bottom-check">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title" style={{ marginInline: 'auto' }}>נסו את הכלי — עכשיו, בחינם</h2>
            <p className="sp2-lead" style={{ marginInline: 'auto' }}>ניתוח, פוסטים ומיילים במקום אחד. בלי הרשמה.</p>
            <a href="#content-tool" className="btn btn-primary" style={{ marginTop: 8 }}><Zap size={16} /> קדימה</a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

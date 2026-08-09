'use client';

import { Sparkles, FileText, MessageSquare, FolderGit2, Bot, Braces } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import FAQItem from '../../components/FAQItem';
import TrustBar from '../../components/service/TrustBar';
import FinalCTA from '../../components/service/FinalCTA';
import { SITE } from '@/lib/site';
import ContextQuestionnaire from './ContextQuestionnaire';

const WHERE = [
  { icon: MessageSquare, title: 'Claude Projects', desc: 'הדביקו את הקובץ ב-Project Knowledge — קלוד יכיר את הארגון בכל שיחה.' },
  { icon: Bot, title: 'GPT מותאם', desc: 'הדביקו ב-Instructions של GPT אישי — ChatGPT מבין מי אתם, פעם אחת.' },
  { icon: Sparkles, title: 'Gemini Gems', desc: 'אותו קובץ הופך ג׳מיני למי שמכיר את השפה, הקהל והטון שלכם.' },
  { icon: FolderGit2, title: 'CLAUDE.md', desc: 'שמרו כ-CLAUDE.md בפרויקט קוד — Claude Code עובד לפי ההקשר הארגוני.' },
  { icon: Braces, title: 'AGENTS.md', desc: 'אותו קובץ בדיוק הופך ל-AGENTS.md ב-Codex וסוכני קוד אחרים.' },
  { icon: FileText, title: 'כל כלי AI אחר', desc: 'טקסט אחד, נקי, שמתאר את הארגון — עובד בכל מקום שבו יש שדה הנחיות.' },
];

const HOW = [
  { n: '01', title: 'עונים על שאלון קצר', text: 'שאלה אחת בכל פעם — על העיסוק, מה גוזל לכם זמן, והמצב הנוכחי שלכם עם AI. כמה דקות.' },
  { n: '02', title: 'מקבלים תוכנית מותאמת', text: 'המלצות אישיות: Quick Win להתחיל ממנו, מה לתקן קודם, כלים מומלצים וציון מוכנות.' },
  { n: '03', title: 'בונוס: קובץ אפיון ל-AI', text: 'ובנוסף — קובץ אחד שמתאר את הארגון, להדבקה בכל כלי AI (Claude · GPT · Gems · CLAUDE.md).' },
];

const FAQS = [
  { q: 'מה הכלי עושה?', a: 'עונים על שאלון קצר על הארגון והמצב הנוכחי שלכם עם AI — ומקבלים תוכנית פעולה מותאמת אישית: Quick Win להתחיל ממנו, מה כדאי לתקן קודם, כלים מומלצים וציון מוכנות. בונוס: קובץ אפיון להדבקה בכל כלי AI. חינם, בלי הרשמה.' },
  { q: 'זה באמת בחינם? צריך להירשם?', a: 'חינם לגמרי, בלי הרשמה. הכל נבנה אצלכם בדפדפן. אנחנו כן מבקשים פרטי קשר בסוף כדי שנוכל להתאים לכם ליווי אם תרצו.' },
  { q: 'איפה אפשר להשתמש בקובץ הבונוס?', a: 'בכל כלי AI עם שדה הנחיות: Claude Projects, GPT מותאם, Gemini Gems — ולמפתחים, אותו קובץ בדיוק הופך ל-CLAUDE.md בקלוד קוד ול-AGENTS.md בקודקס.' },
  { q: 'לפי מה בניתם את הכלי?', a: 'לפי ההנחיות הרשמיות של Anthropic, OpenAI וגוגל לכתיבת קבצי הקשר וסוכנים — כדי שהקובץ יעבוד טוב בכל הכלים.' },
  { q: 'מה ההבדל בין זה לליווי בהטמעת AI?', a: 'זו המתנה החודשית שלנו לקהילת "מאפס ל-AI" — נקודת התחלה. הליווי המלא לוקח את הארגון הרבה מעבר: מיפוי הזדמנויות, Quick Wins, סדנאות לצוות ומדיניות אבטחת מידע.' },
];

export const AI_CONTEXT_FAQS = FAQS;

export default function AiContextClient() {
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
          <span className="geo-hero-badge"><span className="dot" /> המתנה החודשית · מאפס ל-AI</span>
          <h1 className="geo-hero-title">
            איך לשפר את העבודה שלכם<br />עם AI? — קבלו תוכנית מותאמת.
          </h1>
          <p className="geo-hero-sub">
            ענו על שאלון קצר על הארגון שלכם, ובסוף קבלו <strong>תוכנית פעולה מותאמת אישית</strong>:
            מאיפה להתחיל (Quick Win), מה כדאי לתקן קודם, ואילו כלי AI מתאימים לכם — כולל ציון מוכנות.
            בונוס: קובץ אפיון להדבקה בכל כלי AI. בלי הרשמה, הכל בדפדפן.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
            <a href="#context-tool" className="btn btn-primary"><Sparkles size={16} /> קבלו את התוכנית שלכם — בחינם</a>
          </div>
        </div>
      </section>

      {/* THE TOOL */}
      <ContextQuestionnaire id="context-tool" />

      {/* WHERE YOU USE IT */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">בונוס: איפה משתמשים בקובץ האפיון</h2>
            <p className="sp2-lead">מלבד התוכנית — מקבלים גם קובץ אפיון אחד שעובד בכל כלי AI. רחפו על כרטיס.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {WHERE.map((c) => {
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
                        <p>{c.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד</h2>
            <p className="sp2-lead">שלושה שלבים. מהשאלון ועד שכל כלי AI מכיר אתכם.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {HOW.map((s) => (
                <div key={s.n} className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <span className="flip-card-num">{s.n}</span>
                      <h3>{s.title}</h3>
                    </div>
                    <div className="flip-card-back">
                      <span className="flip-card-num">{s.n}</span>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* TRUST */}
      <TrustBar items={['בלי הרשמה', 'הכל נשאר בדפדפן שלכם', 'לפי ההנחיות של Anthropic · OpenAI · Google', 'חינם — מתנה לקהילה']} />

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title" style={{ textAlign: 'center' }}>שאלות נפוצות</h2>
          </ScrollReveal>
          <div className="faq-list" style={{ maxWidth: 760, margin: '24px auto 0' }}>
            {FAQS.map((f) => (
              <FAQItem key={f.q} question={f.q}><p>{f.a}</p></FAQItem>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA → consulting */}
      <FinalCTA
        title="רוצים שנעשה את זה איתכם — עד הסוף?"
        subtitle="קובץ האפיון הוא ההתחלה. הילדים הטובים מלווים ארגונים בהטמעת AI מלאה: מיפוי, Quick Wins, סדנאות ומדיניות. אבחון ראשוני בחינם."
        ctaHref={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, השתמשתי בכלי קובץ האפיון ורציתי לשמוע על ליווי והטמעת AI')}`}
        ctaText="בואו נדבר"
      />
    </>
  );
}

'use client';

import { Bot, Banknote, Eye, CalendarX, Layers, TrendingUp, type LucideIcon } from 'lucide-react';
import SectionHeader from '../SectionHeader';
import ScrollTextHighlight from '../ScrollTextHighlight';

const features: { Icon: LucideIcon; title: string; desc: string; featured?: boolean }[] = [
  {
    Icon: Bot,
    title: 'AI-First',
    desc: 'בגלל שהכל בנוי על AI מהיסוד, מה שפעם לקח חודשים ועלה הון, אתם מקבלים בשבריר מהזמן ומהמחיר. כל פרויקט רץ על Claude, GPT-4 ו-Cursor.',
    featured: true,
  },
  {
    Icon: Banknote,
    title: 'החל מ-1,250 ₪',
    desc: 'משלמים כמו עסק קטן, מקבלים כלים של חברה גדולה. ה-AI מוריד את המחיר בגדול, וההפרש נשאר אצלכם.',
  },
  {
    Icon: Eye,
    title: 'שקיפות מלאה',
    desc: 'אתם יודעים כל חודש בדיוק על מה שילמתם ומה זה הביא. דוח עם מספרים אמיתיים ופגישה שבועית של 30 דקות. בלי הפתעות.',
  },
  {
    Icon: CalendarX,
    title: 'בלי חוזה',
    desc: 'חודש בחודש. לא מתחברים? עוזבים בהתראה של 30 יום, בלי קנסות ובלי דרמה. אתם לא כלואים.',
  },
  {
    Icon: Layers,
    title: 'הכל תחת גג אחד',
    desc: 'במקום לתאם בין פרילנסר פה לסוכנות שם, הכל אצל אותם אנשים שמכירים את כל התמונה. פחות כאב ראש, פחות דברים שנופלים בין הכיסאות.',
  },
  {
    Icon: TrendingUp,
    title: 'תוצאות, לא דוחות',
    desc: 'נמדדים במה שחשוב לכם: כמה פונים קיבלו מענה, כמה הפכו לפגישה, וכמה לעסקה. מספרים שאפשר לעשות איתם משהו.',
  },
];

export default function WhyHelix() {
  return (
    <section className="why-helix">
      <div className="container">
        <SectionHeader
          eyebrow="למה אנחנו"
          titleHtml="למה דווקא HELIX."
          description="שש סיבות שבזכותן בעלי עסק חוזרים אלינו. אל תסמכו עלינו, קראו מה השתנה עבורם."
        />

        <ScrollTextHighlight className="why-grid" dimOpacity={0.15} blurAmount={1}>
          {features.map((f) => (
            <div key={f.title} className={`why-card${f.featured ? ' why-card--featured' : ''}`}>
              <div className="why-icon">
                <f.Icon size={f.featured ? 36 : 28} strokeWidth={1.5} />
              </div>
              <h3 className="why-title">{f.title}</h3>
              <p className="why-desc">{f.desc}</p>
            </div>
          ))}
        </ScrollTextHighlight>
      </div>
    </section>
  );
}

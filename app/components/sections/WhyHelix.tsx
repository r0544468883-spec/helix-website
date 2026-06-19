import { Bot, Banknote, Eye, CalendarX, Layers, TrendingUp, type LucideIcon } from 'lucide-react';
import SectionHeader from '../SectionHeader';

const features: { Icon: LucideIcon; title: string; desc: string; featured?: boolean }[] = [
  {
    Icon: Bot,
    title: 'AI-First',
    desc: 'אנחנו לא משתמשים ב-AI כתוספת. זה הבסיס. כל פרויקט נבנה עם Claude, GPT-4, ו-Cursor מהשורה הראשונה.',
    featured: true,
  },
  {
    Icon: Banknote,
    title: 'החל מ-1,250 ₪',
    desc: 'AI חתך 60% משעות העבודה. במקום לכסות על זה, העברנו את החיסכון ללקוחות. שיווק מלא בעשירית מהמחיר הרגיל.',
  },
  {
    Icon: Eye,
    title: 'שקיפות מלאה',
    desc: 'דוח חודשי עם מספרים אמיתיים. פגישה שבועית של 30 דקות. אתה תמיד יודע מה קורה ולאן הולך הכסף.',
  },
  {
    Icon: CalendarX,
    title: 'בלי חוזה',
    desc: 'חודש בחודש. ביטול בכל עת עם הודעה של 30 יום. אם אנחנו לא מספקים ערך, אתה הולך. פשוט.',
  },
  {
    Icon: Layers,
    title: 'הכל תחת גג אחד',
    desc: 'שיווק, אתר, אוטומציה, פיתוח. צוות אחד שמבין את כל התמונה. בלי 3 ספקים שלא מדברים.',
  },
  {
    Icon: TrendingUp,
    title: 'תוצאות, לא דוחות',
    desc: 'אנחנו מודדים לידים, מכירות, והמרות. לא impressions, לא reach, לא מספרים שנשמעים טוב אבל לא אומרים כלום.',
  },
];

export default function WhyHelix() {
  return (
    <section className="why-helix">
      <div className="container">
        <SectionHeader
          eyebrow="למה אנחנו"
          titleHtml="למה דווקא HELIX."
          description="שש סיבות שבעלי עסק חוזרים אלינו. אל תסמכו עלינו — קראו מה השתנה עבורם."
        />

        <div className="why-grid">
          {features.map((f) => (
            <div key={f.title} className={`why-card${f.featured ? ' why-card--featured' : ''}`}>
              <div className="why-icon">
                <f.Icon size={f.featured ? 36 : 28} strokeWidth={1.5} />
              </div>
              <h3 className="why-title">{f.title}</h3>
              <p className="why-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

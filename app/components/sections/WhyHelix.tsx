import SectionHeader from '../SectionHeader';

const features = [
  {
    icon: '🤖',
    title: 'AI-First',
    desc: 'אנחנו לא משתמשים ב-AI כתוספת. זה הבסיס. כל פרויקט נבנה עם Claude, GPT-4, ו-Cursor מהשורה הראשונה.',
  },
  {
    icon: '💰',
    title: '500 ₪ בחודש',
    desc: 'AI חתך 60% משעות העבודה. במקום לכסות על זה, העברנו את החיסכון ללקוחות. אותו שירות, עשירית מהמחיר.',
  },
  {
    icon: '🔍',
    title: 'שקיפות מלאה',
    desc: 'דוח חודשי עם מספרים אמיתיים. פגישה שבועית של 30 דקות. אתה תמיד יודע מה קורה ולאן הולך הכסף.',
  },
  {
    icon: '🚫',
    title: 'בלי חוזה',
    desc: 'חודש בחודש. ביטול בכל עת עם הודעה של 30 יום. אם אנחנו לא מספקים ערך, אתה הולך. פשוט.',
  },
  {
    icon: '🎯',
    title: 'הכל תחת גג אחד',
    desc: 'שיווק, אתר, אוטומציה, פיתוח. צוות אחד שמבין את כל התמונה. בלי 3 ספקים שלא מדברים.',
  },
  {
    icon: '📊',
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
          titleHtml="למה דווקא Helix."
          description="שישה דברים שמבדילים אותנו מכל סוכנות, פרילנסר, או חבר שמבין בקומפיוטרים."
        />

        <div className="why-grid">
          {features.map((f) => (
            <div key={f.title} className="why-card">
              <div className="why-icon">{f.icon}</div>
              <h3 className="why-title">{f.title}</h3>
              <p className="why-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

const cards = [
  {
    type: 'linkedin',
    label: 'LinkedIn',
    name: 'דנה כהן',
    role: 'VP Marketing · TechFlow',
    text: 'היי דנה, ראיתי את הפוסט שלך על אתגרי הגדילה ב-SaaS — אנחנו חווים בדיוק את אותו דבר. שווה שיחה קצרה?',
    time: '09:14',
    x: 5, y: 8, rotate: -3, delay: 0,
  },
  {
    type: 'email',
    label: 'Cold Email',
    name: 'עמית לוי',
    role: 'CEO · DataBridge',
    text: 'Subject: שאלה קצרה על תהליך הלידים שלכם\n\nהיי עמית, עקבתי אחרי DataBridge ושמתי לב שאתם בשלב צמיחה מרשים. רציתי לשאול — איך אתם מנהלים את ה-outreach היום?',
    time: '10:32',
    x: 55, y: 5, rotate: 2, delay: 0.8,
  },
  {
    type: 'followup',
    label: 'Follow-up #2',
    name: 'מיכל ברק',
    role: 'Head of Sales · CloudBase',
    text: 'היי מיכל, חזרתי לבדוק — ראיתי שהעלתם פיצ\'ר חדש השבוע. מעניין אותי לשמוע איך זה משפיע על ה-pipeline. 5 דקות?',
    time: '14:05',
    x: 10, y: 52, rotate: 1.5, delay: 1.6,
  },
  {
    type: 'linkedin',
    label: 'LinkedIn',
    name: 'רון אביב',
    role: 'COO · ScaleUp AI',
    text: 'היי רון, ראיתי שאתם מגייסים SDR — מוכר לי הכאב. יש לנו גישה קצת אחרת שחוסכת את הגיוס. מעניין?',
    time: '11:47',
    x: 58, y: 48, rotate: -2, delay: 2.4,
  },
  {
    type: 'email',
    label: 'Cold Email',
    name: 'שירה מנחם',
    role: 'Marketing Manager · Finova',
    text: 'Subject: ראיתי את ההרצאה שלך ב-SaaStock\n\nהיי שירה, נהניתי מאוד מההרצאה על PLG. רציתי לשתף משהו שעשינו שיכול להשלים את הגישה שלכם.',
    time: '08:55',
    x: 30, y: 78, rotate: 2.5, delay: 3.2,
  },
  {
    type: 'ai',
    label: 'AI Personalization',
    name: '',
    role: '',
    text: '🤖 מתאים מסר אישי לכל נמען — תפקיד, חברה, פוסטים אחרונים, כאב ספציפי. לא תבנית.',
    time: '',
    x: 32, y: 35, rotate: 0, delay: 4,
  },
];

const typeColors: Record<string, string> = {
  linkedin: 'rgba(16,185,129,0.15)',
  email: 'rgba(52,211,153,0.1)',
  followup: 'rgba(16,185,129,0.08)',
  ai: 'rgba(16,185,129,0.2)',
};

const labelColors: Record<string, string> = {
  linkedin: '#10B981',
  email: '#34D399',
  followup: '#6EE7B7',
  ai: '#10B981',
};

export default function BDRFloatingCards() {
  return (
    <div className="bdr-float-wrap">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bdr-float-card"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            transform: `rotate(${card.rotate}deg)`,
            animationDelay: `${card.delay}s`,
            background: typeColors[card.type],
          }}
        >
          <div className="bdr-float-label" style={{ color: labelColors[card.type] }}>
            {card.type === 'linkedin' && '💼'}
            {card.type === 'email' && '📧'}
            {card.type === 'followup' && '🔄'}
            {card.type === 'ai' && '🤖'}
            {' '}{card.label}
          </div>
          {card.name && (
            <div className="bdr-float-from">
              <strong>{card.name}</strong>
              <span>{card.role}</span>
            </div>
          )}
          <p className="bdr-float-text">{card.text}</p>
          {card.time && <span className="bdr-float-time">{card.time}</span>}
        </div>
      ))}
    </div>
  );
}

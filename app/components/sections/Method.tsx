import SectionHeader from '../SectionHeader';

const items = [
  {
    number: '01 / METHOD',
    title: 'אפיון לפני כסף',
    text: 'לפני שמתחילים פרויקט, אנחנו מבצעים שיחת אפיון כתובה: מה נעשה, באיזה זמן, באיזה מחיר, ומה מצופה משני הצדדים. תוצאה: מסמך אחד, חתימה אחת, אפס "אבל אנחנו אמרנו".',
  },
  {
    number: '02 / METHOD',
    title: 'סטטוס שבועי בקלנדר',
    text: 'בכל יום שלישי בבוקר — 30 דקות. מה נעשה, מה לא, מה חוסם, ומה הצעד הבא. כתוב, מתועד, ושמור. אם פספסת — תקבל סיכום באימייל.',
  },
  {
    number: '03 / METHOD',
    title: 'דיווח בקצב הקמפיין',
    text: 'קמפיינים מקבלים דוח שבועי, לא חודשי. CPL אמיתי, conversion rate אמיתי, ROAS אמיתי. אם הקמפיין לא עובד — אתה יודע ביום ה-7, לא ביום ה-30.',
  },
  {
    number: '04 / METHOD',
    title: 'מפתח אחד, שיווקיסט אחד, אותו ראש',
    text: 'המפתח שלך והשיווקיסט שלך לא צריכים להעביר ידיים אחד לשני. שניהם אנחנו. הקוד והקמפיינים נבנים ביחד מהיום הראשון, בלי שגרירים בין סוגרים שונים.',
  },
];

export default function Method() {
  return (
    <section className="method" id="method">
      <div className="container">
        <SectionHeader
          eyebrow="השיטה"
          titleHtml="ככה אנחנו<br>עובדים אחרת."
          description="ארבע התנהגויות תפעוליות שאפשר לבדוק תוך 30 יום. לא הבטחות, לא buzzwords. כל אחת מהן נכנסת לחוזה."
        />

        <div className="method-grid">
          {items.map((item) => (
            <div key={item.number} className="method-item">
              <div className="method-number" dir="ltr">{item.number}</div>
              <h3 className="method-title">{item.title}</h3>
              <p className="method-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

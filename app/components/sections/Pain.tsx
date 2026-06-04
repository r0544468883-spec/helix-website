import SectionHeader from '../SectionHeader';

const rows = [
  {
    number: '01',
    promise: '"האתר יהיה מוכן תוך שבועיים וזה יעלה לך 12,000 שקל."',
    reality: 'חודשיים אחרי, האתר עדיין "כמעט מוכן". הספק נעלם לשבוע, והחשבון עלה ל-18,000, בלי שהבנת למה.',
  },
  {
    number: '02',
    promise: '"אנחנו סוכנות שיווק בוטיק, מעטפת מלאה, שקיפות של 100%."',
    reality:
      'דו"ח חודשי עם גרפים יפים שאף אחד לא מבין. 5,000 שקל בחודש, ואתה לא יודע כמה לידים הגיעו בגלל הקמפיין וכמה בגלל גוגל.',
  },
  {
    number: '03',
    promise: '"ריטיינר חודשי, צוות שלם עובד בשבילך."',
    reality:
      'ג\'וניור אחד מנהל לך את החשבון בין עוד שבעה לקוחות. שואל אותך בכל שבוע "מה רוצים לפרסם?" כאילו אתה צריך לעשות לו את העבודה.',
  },
];

export default function Pain() {
  return (
    <section className="pain">
      <div className="container">
        <SectionHeader
          eyebrow="המציאות"
          title="הכרת את זה?"
          description="כל בעל עסק שעבד עם ספק טכני או שיווקי בישראל מכיר את שלושת הסיפורים האלה. הם לא חריגים. הם הסטנדרט."
        />

        <div className="pain-stack">
          {rows.map((row) => (
            <div key={row.number} className="pain-row">
              <div className="pain-row-number" dir="ltr">{row.number}</div>
              <div className="pain-col promise">
                <div className="pain-col-label">ההבטחה</div>
                <p className="pain-col-text">{row.promise}</p>
              </div>
              <div className="pain-col reality">
                <div className="pain-col-label">המציאות</div>
                <p className="pain-col-text">{row.reality}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="pain-closing">
          <span className="quiet">זה לא קלקול בענף.</span><br />
          זה ברירת המחדל של הענף.
        </p>
      </div>
    </section>
  );
}

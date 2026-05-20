import SectionHeader from '../SectionHeader';

const rows = [
  {
    number: '01',
    promise: '"תוך 30 יום נביא לך 300 לידים בעלות של 8 ש"ח."',
    reality: 'חודשיים אחרי, יש לך 30 לידים בעלות של 60 ש"ח. ואף אחד לא מסביר למה.',
  },
  {
    number: '02',
    promise: '"תוך 3 חודשים אתם עם MVP בייר."',
    reality:
      '7 חודשים אחרי, יש לך חצי מערכת, חצי תיעוד, וצוות ספקים שמאשים אחד את השני.',
  },
  {
    number: '03',
    promise: '"תהיה לך שיחה שבועית, דוחות, ושקיפות מלאה."',
    reality:
      'שלוש פגישות בחודש הראשון. אחרי זה — שתיקה. אתה הופך לזה שרודף.',
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

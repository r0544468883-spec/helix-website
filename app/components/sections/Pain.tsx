'use client';

import SectionHeader from '../SectionHeader';
import ScrollTextHighlight from '../ScrollTextHighlight';

const rows = [
  {
    number: '01',
    promise: '"המערכת תהיה מוכנה תוך חודש, מחיר סופי 40,000 שקל."',
    reality:
      'ארבעה חודשים אחרי, יש דמו שעובד רק על המחשב של המפתח. כל שינוי קטן הוא "זה לא היה באפיון", והחשבון כבר 60,000.',
  },
  {
    number: '02',
    promise: '"נחבר לך אוטומציה שתחסוך שעתיים ביום."',
    reality:
      'האוטומציה נשברה בשבוע השני ואף אחד לא שם לב חודש. בינתיים חזרתם להעתיק לידים לאקסל ביד, בדיוק כמו קודם.',
  },
  {
    number: '03',
    promise: '"נטמיע לך AI בעסק, זה ישנה לך את החיים."',
    reality:
      'קיבלת מסמך עם 12 המלצות ורישיון ל-ChatGPT. חודש אחרי, אף אחד בצוות לא פתח אותו ואף תהליך בעסק לא השתנה.',
  },
];

export default function Pain() {
  return (
    <section className="pain">
      <div className="container">
        <SectionHeader
          eyebrow="המציאות"
          title="הכרת את זה?"
          description="כל בעל עסק שהזמין פעם מערכת, אוטומציה או פרויקט AI מכיר את שלושת הסיפורים האלה. הם לא חריגים. הם הסטנדרט."
        />

        <ScrollTextHighlight className="pain-stack" dimOpacity={0.12} blurAmount={1.5}>
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
        </ScrollTextHighlight>

        <p className="pain-closing">
          <span className="quiet">זה לא קלקול בענף.</span><br />
          זה ברירת המחדל של הענף.
        </p>
      </div>
    </section>
  );
}

import SectionHeader from '../SectionHeader';

const steps = [
  {
    n: '01',
    title: 'שיחת היכרות',
    text: '30 דקות, חינם, בלי פיץ׳. אתה מסביר על העסק והכאב, אני שואל שאלות.',
  },
  {
    n: '02',
    title: 'בחירת השירות',
    text: 'יחד אנחנו מבינים: Audit לאבחון, Launch לפרויקט, או Grow לשותפות.',
  },
  {
    n: '03',
    title: 'פגישת אפיון',
    text: 'כאן קובעים יחד: scope מדויק, לוח זמנים, ומחיר. מסמך כתוב בסוף.',
  },
  {
    n: '04',
    title: 'חתימה ומתחילים',
    text: 'חוזה שמתבסס על האפיון. תיאום ציפיות מלא. עובדים יחד.',
  },
];

export default function Journey() {
  return (
    <section className="journey" id="journey">
      <div className="container">
        <SectionHeader
          eyebrow="התהליך"
          titleHtml="איך מתחילים<br>לעבוד יחד."
          description="ארבעה צעדים מהשיחה הראשונה ועד שמתחילים בפועל. אין כאן הצעת מחיר באתר כי אין מחיר אחיד — כל פרויקט נתפר עם הלקוח, בפגישת אפיון משותפת."
        />

        <div className="journey-stepper">
          {steps.map((step) => (
            <div key={step.n} className="journey-step">
              <div className="journey-circle">{step.n}</div>
              <h3 className="journey-step-title">{step.title}</h3>
              <p className="journey-step-text">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="journey-note">
          <strong>למה אין מחירים באתר?</strong>
          כי כל פרויקט שונה. רשת בתי קפה צריכה משהו אחר מעמותה, ועמותה משהו אחר מסטארטאפ B2B2C. מחיר באתר יכריח אותנו להיות גרועים בשני הצדדים: או נציע זול מדי ונפסיד, או ננפח כדי "להיות בטוחים" — וזה לא הוגן כלפיך. במקום זה, בפגישת האפיון אנחנו בונים את ההצעה יחד, על בסיס מה שבאמת נדרש.
        </div>
      </div>
    </section>
  );
}

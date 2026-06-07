const areas = [
  'שיווק דיגיטלי',
  'בניית אתרים',
  'אוטומציות שיווק',
  'אוטומציות מכירה',
  'Growth Hacking',
  'פיתוח תוכנה',
  'מוצרי תוכנה',
  'GTM Marketing',
];

export default function Expertise() {
  return (
    <section className="expertise">
      <div className="container">
        <div className="expertise-label">— תחומי מומחיות</div>
        <div className="expertise-pills">
          {areas.map((area) => (
            <span key={area} className="expertise-pill">{area}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

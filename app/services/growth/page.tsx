import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growth Hacking',
  description: 'צמיחה מהירה בשיטות לא שגרתיות. ניסויים, אופטימיזציה, ותוצאות. 500 ₪ לחודש.',
};

export default function GrowthPage() {
  return (
    <section style={{ padding: 'clamp(100px, 14vw, 160px) 0 clamp(60px, 8vw, 100px)' }}>
      <div className="container">
        <p className="section-tag">Growth Hacking</p>
        <h1 className="section-title">צמיחה מהירה.<br />בשיטות שעובדות.</h1>
        <p className="section-desc">
          אסטרטגיית צמיחה מותאמת, ניסויי A/B, אופטימיזציית המרות, viral loops, ותוכניות referral.
          הכל ב-500 ₪ לחודש. הדף בבנייה, דברו איתנו לפרטים.
        </p>
      </div>
    </section>
  );
}

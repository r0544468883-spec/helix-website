import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'תהליכי מכירה אוטומטיים',
  description: 'SDR שעובד 24/7. בניית מערך פיתוח עסקי אוטומטי מקצה לקצה. 500 ₪ לחודש.',
};

export default function SalesPage() {
  return (
    <section style={{ padding: 'clamp(100px, 14vw, 160px) 0 clamp(60px, 8vw, 100px)' }}>
      <div className="container">
        <p className="section-tag">תהליכי מכירה אוטומטיים</p>
        <h1 className="section-title">מערך מכירות אוטומטי.<br />SDR שעובד 24/7.</h1>
        <p className="section-desc">
          Data Enrichment, LinkedIn Sales Navigator, outreach sequences, וניהול pipeline אוטומטי.
          הכל ב-500 ₪ לחודש. הדף בבנייה, דברו איתנו לפרטים.
        </p>
      </div>
    </section>
  );
}

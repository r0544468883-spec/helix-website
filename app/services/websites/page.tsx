import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'אתרים ואיקומרס',
  description: 'מאפיון ועד תחזוקה שוטפת. אתר תדמית, חנות eCommerce, דף נחיתה. 500 ₪ לחודש.',
};

export default function WebsitesPage() {
  return (
    <section className="service-page">
      <div className="container">
        <p className="service-tag">חבילה 02</p>
        <h1 className="service-title">אתרים ואיקומרס</h1>
        <p className="service-subtitle">מאסטרטגיה ועד תחזוקה שוטפת. האתר עולה לאוויר ונשאר חי.</p>
        <div className="service-price">500 &#8362; <small>/ לחודש</small></div>
        <div className="service-body">
          <p>דף השירות בבנייה. בקרוב כאן יהיה מידע מלא על חבילת האתרים והאיקומרס.</p>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'אוטומציה',
  description: 'מיפוי תהליכים, CRM, Email Automation, Lead Nurturing ו-Funnel אוטומטי. 500 ₪ לחודש.',
};

export default function AutomationPage() {
  return (
    <section className="service-page">
      <div className="container">
        <p className="service-tag">חבילה 03</p>
        <h1 className="service-title">אוטומציה</h1>
        <p className="service-subtitle">מאסטרטגיה, דרך הטמעה, ועד ניהול שוטף של כל התהליך.</p>
        <div className="service-price">500 &#8362; <small>/ לחודש</small></div>
        <div className="service-body">
          <p>דף השירות בבנייה. בקרוב כאן יהיה מידע מלא על חבילת האוטומציה.</p>
        </div>
      </div>
    </section>
  );
}
